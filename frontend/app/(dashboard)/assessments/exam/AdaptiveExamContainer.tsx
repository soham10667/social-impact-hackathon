"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  ASSESSMENT_CATEGORIES, 
  AssessmentCategory 
} from "../page";
import { 
  ExamQuestion, 
  getInitialQuestion, 
  getNextAdaptiveQuestion,
  normalizeCategorySlug,
  calculateNextDifficulty,
  normalizeQuestionText
} from "../examEngine";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Clock, 
  XCircle, 
  ArrowRight, 
  BrainCircuit, 
  Check,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function AdaptiveExamContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, recordActivity } = useAuth();

  const rawSlug = searchParams?.get("slug");
  const safeSlug = normalizeCategorySlug(rawSlug);

  const [category] = useState<AssessmentCategory>(() => {
    return (
      ASSESSMENT_CATEGORIES.find((c) => c.slug === safeSlug) ||
      ASSESSMENT_CATEGORIES[0]
    );
  });

  // Exam Session State
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion>(() =>
    getInitialQuestion(safeSlug, "Medium")
  );

  const [attemptedIds, setAttemptedIds] = useState<string[]>([currentQuestion.id]);
  const [attemptedFingerprints, setAttemptedFingerprints] = useState<string[]>([
    currentQuestion.normalizedFingerprint
  ]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answersHistory, setAnswersHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Difficulty progression log for telemetry report
  const [difficultyHistory, setDifficultyHistory] = useState<string[]>(["Medium"]);

  // Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(category.durationMinutes * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  // Countdown timer hook
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finalizeExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Submit Answer & Adapt Difficulty
  const handleSubmitAnswer = async () => {
    if (isSubmitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    let isCorrect = false;

    if (
      currentQuestion.type === "mcq" ||
      currentQuestion.type === "code_output" ||
      currentQuestion.type === "sql"
    ) {
      isCorrect = selectedOption === Number(currentQuestion.correctAnswer);
    } else {
      isCorrect = textAnswer.trim().length > 10;
    }

    const answerRecord = {
      question: currentQuestion,
      selectedOption,
      textAnswer,
      isCorrect,
      difficultySubmitted: difficulty
    };

    const newHistory = [...answersHistory, answerRecord];
    const newAttemptedIds = [...attemptedIds, currentQuestion.id];
    const newAttemptedFp = [
      ...attemptedFingerprints,
      currentQuestion.normalizedFingerprint
    ];

    setAnswersHistory(newHistory);
    setAttemptedIds(newAttemptedIds);
    setAttemptedFingerprints(newAttemptedFp);

    // Check if exam completed
    if (currentQuestionNumber >= category.questionsCount) {
      await finalizeExam(newHistory);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    // Dynamic Adaptive Stepping
    const nextDiff = calculateNextDifficulty(difficulty, isCorrect);
    setDifficulty(nextDiff);
    setDifficultyHistory((prev) => [...prev, nextDiff]);

    let nextQ: ExamQuestion | null = null;

    // Optional AI Generation Probe with graceful fallback to curated bank
    try {
      const aiRes = await axios.post(
        "/api/assessments/generate-question",
        {
          categorySlug: category.slug,
          difficulty: nextDiff,
          topic: currentQuestion.topic,
          attemptedFingerprints: newAttemptedFp
        },
        { timeout: 3500 }
      );

      if (aiRes.data?.success && aiRes.data?.question) {
        nextQ = aiRes.data.question;
      }
    } catch {
      // AI service timeout or offline -> seamless bank fallback
    }

    if (!nextQ) {
      nextQ = getNextAdaptiveQuestion({
        categorySlug: category.slug,
        targetDifficulty: nextDiff,
        attemptedIds: newAttemptedIds,
        attemptedFingerprints: newAttemptedFp
      });
    }

    setCurrentQuestion(nextQ);
    setCurrentQuestionNumber((prev) => prev + 1);
    setSelectedOption(null);
    setTextAnswer("");
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  };

  const finalizeExam = async (finalHistory?: any[]) => {
    setIsCompleted(true);
    const hist = finalHistory || answersHistory;
    const correctCount = hist.filter((h) => h.isCorrect).length;
    const totalQuestions = hist.length;
    const scorePercentage = Math.round((correctCount / (totalQuestions || 1)) * 100);

    const timeSpent = Math.max(1, Math.round((category.durationMinutes * 60 - timeLeftSeconds) / 60));

    const report = {
      categoryTitle: category.title,
      categorySlug: category.slug,
      scorePercentage,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      totalQuestions,
      timeTakenMinutes: timeSpent,
      history: hist,
      difficultyProgression: difficultyHistory
    };

    setEvaluationReport(report);

    // Save to Supabase (preserving student assessment history)
    try {
      if (user?.id) {
        await supabase.from("assessment_attempts").insert({
          user_id: user.id,
          category_slug: category.slug,
          category_title: category.title,
          score_percentage: scorePercentage,
          correct_count: correctCount,
          total_questions: totalQuestions,
          time_taken_minutes: timeSpent,
          difficulty_progression: difficultyHistory,
          answers_summary: hist.map((h) => ({
            topic: h.question.topic,
            difficulty: h.difficultySubmitted,
            isCorrect: h.isCorrect
          }))
        });
      }
    } catch (dbErr) {
      console.warn("Supabase assessment attempt record skipped:", dbErr);
    }

    try {
      await recordActivity("technical_assessment");
    } catch {}
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Render Post-Exam Report Screen
  if (isCompleted && evaluationReport) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-[#1F2937] animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl border border-[#D1FAE5] shadow-soft-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#D1FAE5] pb-6">
            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#86EFAC]">
                Examination Finalized
              </span>
              <h1 className="text-3xl font-extrabold text-[#1F2937] mt-2">
                {evaluationReport.categoryTitle} Report
              </h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#16A34A]">
                {evaluationReport.scorePercentage}%
              </div>
              <span className="text-xs text-[#6B7280]">Adaptive Final Score</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5]">
              <span className="text-xs text-[#6B7280] block">Passed</span>
              <span className="text-xl font-bold text-[#16A34A] mt-1 block">
                {evaluationReport.correctCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5]">
              <span className="text-xs text-[#6B7280] block">Failed</span>
              <span className="text-xl font-bold text-red-600 mt-1 block">
                {evaluationReport.incorrectCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5]">
              <span className="text-xs text-[#6B7280] block">Total Questions</span>
              <span className="text-xl font-bold text-[#1F2937] mt-1 block">
                {evaluationReport.totalQuestions}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5]">
              <span className="text-xs text-[#6B7280] block">Time Taken</span>
              <span className="text-xl font-bold text-[#D97706] mt-1 block">
                {evaluationReport.timeTakenMinutes} Mins
              </span>
            </div>
          </div>

          {/* Difficulty Progression Indicator */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#D1FAE5] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#166534]">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#22C55E]" /> Adaptive Difficulty Trajectory
              </span>
              <span className="font-mono text-[11px] text-[#6B7280]">
                {evaluationReport.difficultyProgression?.join(" → ")}
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563]">
              Difficulty started at Medium, escalating to Hard on correct answers and calibrating to Easy on missed concepts.
            </p>
          </div>

          {/* Question Review & Explanations */}
          <div className="space-y-3 pt-4 border-t border-[#D1FAE5]">
            <h3 className="text-base font-bold text-[#1F2937]">Question Review & AI Feedback</h3>
            {evaluationReport.history.map((h: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F2937]">
                    Q{idx + 1}: {h.question.topic} • <span className="text-[#D97706] font-semibold">{h.difficultySubmitted}</span>
                  </span>
                  {h.isCorrect ? (
                    <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> PASSED
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> FAILED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4B5563]">{h.question.questionText}</p>
                <p className="text-xs text-[#166534] bg-[#F0FDF4] p-2.5 rounded-lg border border-[#86EFAC]">
                  <strong>Explanation:</strong> {h.question.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/assessments"
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-xs px-6 py-3 rounded-xl transition shadow-button-primary"
            >
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#1F2937] animate-fadeIn">
      {/* Top Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#D1FAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-card">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">{category.title}</h1>
          <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-1">
            <span>Adaptive AI Exam Session</span> •
            <span className="text-[#D97706] font-bold">
              Current Difficulty: {difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#D97706] bg-[#FFFBEB] px-4 py-2 rounded-xl border border-[#FDE68A]">
            <Clock className="w-4 h-4" /> {formatTime(timeLeftSeconds)}
          </div>
          <button
            onClick={() => finalizeExam()}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            End Exam
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Main Question & Answer Panel */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] space-y-6 min-h-[460px] flex flex-col justify-between shadow-soft-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#D1FAE5]">
                  Question {currentQuestionNumber} of {category.questionsCount}
                </span>
                <span className="text-xs text-[#6B7280] font-mono">{currentQuestion.topic}</span>
              </div>

              <h2 className="text-lg font-bold text-[#1F2937] leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              {currentQuestion.codeSnippet && (
                <pre className="p-4 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5] font-mono text-xs text-[#166534] overflow-x-auto">
                  {currentQuestion.codeSnippet}
                </pre>
              )}

              {/* Options selection for MCQ / Output Prediction */}
              {currentQuestion.options && (
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={isSubmitting}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition ${
                        selectedOption === i
                          ? "bg-[#F0FDF4] border-[#22C55E] text-[#166534] font-semibold shadow-xs"
                          : "bg-white border-[#D1FAE5] text-[#4B5563] hover:border-[#86EFAC] hover:text-[#1F2937] hover:bg-[#FAFDFA]"
                      }`}
                    >
                      <span className="font-bold mr-2 text-[#16A34A]">
                        {String.fromCharCode(65 + i)}.
                      </span>{" "}
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Short Answer input */}
              {!currentQuestion.options && (
                <textarea
                  value={textAnswer}
                  disabled={isSubmitting}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your technical answer & reasoning here..."
                  className="w-full bg-white border border-[#D1FAE5] rounded-xl p-4 text-xs font-mono text-[#1F2937] focus:outline-none focus:border-[#22C55E] focus:ring-3 focus:ring-green-100 h-32 resize-none"
                />
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#D1FAE5]">
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  isSubmitting ||
                  (selectedOption === null && textAnswer.trim().length === 0)
                }
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-button-primary disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating & Adapting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer & Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel: Exam Progress Tracker */}
        <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-[#D1FAE5] space-y-5 flex flex-col justify-between shadow-soft-card">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Exam Progress
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>Completed:</span>
                <span className="text-[#1F2937] font-bold">
                  {currentQuestionNumber - 1} / {category.questionsCount}
                </span>
              </div>
              <div className="w-full bg-[#DCFCE7] h-2 rounded-full overflow-hidden border border-[#D1FAE5]">
                <div
                  className="bg-[#22C55E] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionNumber - 1) / category.questionsCount) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5] text-xs text-[#6B7280] leading-relaxed space-y-2">
              <div className="font-bold text-[#1F2937] flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-[#16A34A]" /> Adaptive Calibration
              </div>
              <p>
                Every exam starts at <strong>Medium</strong>. A correct answer immediately increases difficulty toward <strong>Hard</strong>, while an incorrect response adjusts difficulty to <strong>Easy</strong> to identify core conceptual gaps.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] text-xs text-[#166534] space-y-1">
              <span className="font-bold block">Current Question Difficulty:</span>
              <span className="text-xs font-mono font-bold text-[#D97706] uppercase">
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
