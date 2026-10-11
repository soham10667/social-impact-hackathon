"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ASSESSMENT_CATEGORIES, 
  AssessmentCategory 
} from "../page";
import { 
  ExamQuestion, 
  getInitialQuestion, 
  getNextAdaptiveQuestion 
} from "../examEngine";
import { useAuth } from "@/context/AuthContext";
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  BrainCircuit, 
  BarChart3, 
  FileText,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";

export default function AdaptiveExamContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordActivity } = useAuth();
  const slug = searchParams.get("slug") || "dsa";

  const [category, setCategory] = useState<AssessmentCategory>(
    ASSESSMENT_CATEGORIES.find((c) => c.slug === slug) || ASSESSMENT_CATEGORIES[0]
  );

  // Exam Session State
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion>(
    getInitialQuestion(category.slug, "Medium")
  );
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [attemptedFingerprints, setAttemptedFingerprints] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answersHistory, setAnswersHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer State (Server/Local Sync)
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
  const handleSubmitAnswer = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let isCorrect = false;

    if (currentQuestion.type === "mcq" || currentQuestion.type === "code_output" || currentQuestion.type === "sql") {
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
    const newAttemptedFp = [...attemptedFingerprints, currentQuestion.normalizedFingerprint];
    setAnswersHistory(newHistory);
    setAttemptedIds(newAttemptedIds);
    setAttemptedFingerprints(newAttemptedFp);

    // Check if total question limit reached
    if (currentQuestionNumber >= category.questionsCount) {
      finalizeExam(newHistory);
      setIsSubmitting(false);
      return;
    }

    // Adaptive Selection Engine Call
    const { nextQuestion, newDifficulty } = getNextAdaptiveQuestion(
      category.slug,
      difficulty,
      isCorrect,
      newAttemptedIds,
      newAttemptedFp
    );

    setDifficulty(newDifficulty);
    setCurrentQuestion(nextQuestion);
    setCurrentQuestionNumber((prev) => prev + 1);
    setSelectedOption(null);
    setTextAnswer("");
    setIsSubmitting(false);
  };

  const finalizeExam = (finalHistory?: any[]) => {
    const history = finalHistory || answersHistory;
    const totalAttempted = history.length;
    const correctCount = history.filter((h) => h.isCorrect).length;
    const scorePercentage = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

    const report = {
      categoryTitle: category.title,
      totalQuestions: category.questionsCount,
      attemptedCount: totalAttempted,
      correctCount,
      incorrectCount: totalAttempted - correctCount,
      scorePercentage,
      timeTakenMinutes: Math.round((category.durationMinutes * 60 - timeLeftSeconds) / 60),
      strengthTopic: scorePercentage >= 70 ? "Solid Technical Fundamentals" : "Requires Practice",
      weaknessTopic: scorePercentage < 70 ? "Edge Case Handling & Complexity" : "None Detected",
      history
    };

    setEvaluationReport(report);
    setIsCompleted(true);

    try {
      recordActivity("technical_assessment");
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-cardBg p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-6">
            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Examination Finalized
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-2">{evaluationReport.categoryTitle} Report</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-purple-400">{evaluationReport.scorePercentage}%</div>
              <span className="text-xs text-mutedText">Adaptive Score</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-secondaryBg border border-gray-800">
              <span className="text-xs text-mutedText block">Passed</span>
              <span className="text-xl font-bold text-green-400 mt-1 block">{evaluationReport.correctCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondaryBg border border-gray-800">
              <span className="text-xs text-mutedText block">Failed</span>
              <span className="text-xl font-bold text-red-400 mt-1 block">{evaluationReport.incorrectCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondaryBg border border-gray-800">
              <span className="text-xs text-mutedText block">Total Questions</span>
              <span className="text-xl font-bold text-white mt-1 block">{evaluationReport.totalQuestions}</span>
            </div>
            <div className="p-4 rounded-2xl bg-secondaryBg border border-gray-800">
              <span className="text-xs text-mutedText block">Time Taken</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{evaluationReport.timeTakenMinutes} Mins</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800/80">
            <h3 className="text-base font-bold text-white">Question Review & AI Feedback</h3>
            {evaluationReport.history.map((h: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-secondaryBg border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Q{idx + 1}: {h.question.topic} ({h.difficultySubmitted})</span>
                  {h.isCorrect ? (
                    <span className="text-green-400 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> PASSED</span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> FAILED</span>
                  )}
                </div>
                <p className="text-xs text-gray-300">{h.question.questionText}</p>
                <p className="text-xs text-blue-300 bg-blue-500/10 p-2.5 rounded border border-blue-500/20">
                  <strong>Explanation:</strong> {h.question.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/assessments" className="bg-primaryAccent hover:bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl transition">
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-cardBg p-5 rounded-2xl border border-gray-800 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white">{category.title}</h1>
          <div className="flex items-center gap-3 text-xs text-mutedText mt-1">
            <span>Adaptive AI Exam Session</span> •
            <span className="text-amber-400 font-bold">Current Difficulty: {difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
            <Clock className="w-4 h-4" /> {formatTime(timeLeftSeconds)}
          </div>
          <button
            onClick={() => finalizeExam()}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            End Exam
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Main Question & Answer Panel */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-6 min-h-[460px] flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Question {currentQuestionNumber} of {category.questionsCount}
                </span>
                <span className="text-xs text-mutedText font-mono">{currentQuestion.topic}</span>
              </div>

              <h2 className="text-lg font-bold text-white leading-relaxed">{currentQuestion.questionText}</h2>

              {currentQuestion.codeSnippet && (
                <pre className="p-4 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-blue-200 overflow-x-auto">
                  {currentQuestion.codeSnippet}
                </pre>
              )}

              {/* Options selection for MCQ / Output Prediction */}
              {currentQuestion.options && (
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition ${
                        selectedOption === i
                          ? "bg-blue-500/10 border-blue-500 text-white font-semibold shadow-md shadow-blue-500/10"
                          : "bg-secondaryBg border-gray-800 text-mutedText hover:border-gray-700 hover:text-white"
                      }`}
                    >
                      <span className="font-bold mr-2 text-blue-400">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Short Answer input */}
              {!currentQuestion.options && (
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your technical answer & reasoning here..."
                  className="w-full bg-black/60 border border-gray-800 rounded-xl p-4 text-xs font-mono text-blue-200 focus:outline-none focus:border-blue-500 h-32 resize-none"
                />
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || (selectedOption === null && textAnswer.trim().length === 0)}
                className="bg-primaryAccent hover:bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? "Generating Next Question..." : "Submit Answer & Next"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel: Exam Progress Tracker */}
        <div className="md:col-span-4 bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-5 h-[460px] flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-mutedText uppercase tracking-wider">Exam Progress</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-mutedText">
                <span>Attempted:</span>
                <span className="text-white font-bold">{currentQuestionNumber - 1} / {category.questionsCount}</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${((currentQuestionNumber - 1) / category.questionsCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondaryBg border border-gray-800 text-xs text-mutedText leading-relaxed space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-purple-400" /> Adaptive Rules Active
              </div>
              <p>Answering correctly increases question difficulty. Answering incorrectly downgrades difficulty to isolate weak topics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
