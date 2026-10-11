import { NextRequest, NextResponse } from "next/server";
import { normalizeQuestionText, ExamQuestion } from "@/app/(dashboard)/assessments/examEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categorySlug, difficulty, topic, attemptedFingerprints = [] } = body;

    const safeSlug = typeof categorySlug === "string" ? categorySlug.toLowerCase() : "dsa";
    const safeDiff = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
    const safeTopic = typeof topic === "string" ? topic : "Core Concepts";

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";
    const mistralApiUrl = process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1/chat/completions";

    if (mistralApiKey && mistralApiKey !== "your-mistral-api-key" && mistralApiKey.length > 10) {
      const categoryNames: Record<string, string> = {
        dsa: "Data Structures & Algorithms",
        dbms: "Database Management Systems & SQL",
        "os-networks": "Operating Systems & Computer Networking"
      };
      const catDisplayName = categoryNames[safeSlug] || "Computer Science";

      const prompt = `You are a Principal Technical Examiner at PrepPilot AI.
Generate EXACTLY ONE original, non-trivial multiple-choice question (MCQ) for technical assessment.

Category: ${catDisplayName} (${safeSlug})
Topic: ${safeTopic}
Target Difficulty: ${safeDiff}

CRITICAL RULES:
1. Provide exactly 4 options.
2. The options must be mutually exclusive, clear, and unambiguous.
3. Indicate the zero-based index of the correct answer (0, 1, 2, or 3).
4. Provide a clear technical explanation.
5. Return ONLY a valid JSON object matching this schema:
{
  "topic": "${safeTopic}",
  "questionText": "Clear technical question text",
  "codeSnippet": "",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Concise technical explanation"
}`;

      // Controlled retry with 6s timeout
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(mistralApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${mistralApiKey}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              model: mistralModel,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              max_tokens: 500,
              response_format: { type: "json_object" },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            let content = data?.choices?.[0]?.message?.content || "";
            content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

            const parsed = JSON.parse(content);
            if (
              parsed.questionText &&
              Array.isArray(parsed.options) &&
              parsed.options.length === 4 &&
              typeof parsed.correctAnswer === "number" &&
              parsed.correctAnswer >= 0 &&
              parsed.correctAnswer <= 3
            ) {
              const fp = normalizeQuestionText(parsed.questionText);
              // Verify question is not in attempted fingerprints
              if (!attemptedFingerprints.includes(fp)) {
                const generatedQuestion: ExamQuestion = {
                  id: `${safeSlug}-mistral-${Date.now()}`,
                  categorySlug: safeSlug,
                  topic: parsed.topic || safeTopic,
                  difficulty: safeDiff,
                  type: "mcq",
                  questionText: parsed.questionText,
                  normalizedFingerprint: fp,
                  codeSnippet: parsed.codeSnippet || undefined,
                  options: parsed.options,
                  correctAnswer: parsed.correctAnswer,
                  explanation: parsed.explanation || "Correct technical principle verified."
                };
                return NextResponse.json({ success: true, question: generatedQuestion, provider: "mistral-ai" });
              }
            }
          }
        } catch (attemptErr) {
          // Retry on first attempt failure
          if (attempt === 1) {
            console.error("Mistral AI question generation failed after retries:", attemptErr);
          }
        }
      }
    }

    return NextResponse.json({ success: false, error: "AI question generation unavailable" }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
