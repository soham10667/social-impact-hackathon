import { NextRequest, NextResponse } from "next/server";

interface MessageTurn {
  sender: "ai" | "candidate";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      interview_type, 
      experience_level, 
      job_role, 
      language, 
      duration_minutes,
      history 
    } = body;

    const userText = (message || "").trim();
    const targetRole = job_role || "Software Engineer";
    const intType = interview_type || "Technical";
    const expLevel = experience_level || "Fresher / 0–1 Year";
    const prefLang = language || "English";
    const historyTurns: MessageTurn[] = Array.isArray(history) ? history : [];

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey !== "your-gemini-api-key" && geminiApiKey.length > 10) {
      try {
        const conversationContext = historyTurns
          .slice(-6)
          .map((h) => `${h.sender === "ai" ? "Interviewer" : "Candidate"}: ${h.text}`)
          .join("\n");

        const prompt = `You are a senior, highly experienced hiring manager and technical interviewer conducting a live mock interview at PrepPilot AI.
Candidate Persona & Interview Context:
- Interview Type: ${intType}
- Target Job Role: ${targetRole}
- Experience Level: ${expLevel}
- Target Language: ${prefLang} (respond naturally in this language: if Hinglish, use natural Indian conversational Hinglish; if Hindi, use Hindi; if English, use English)
- Duration: ${duration_minutes || 15} minutes

Candidate said: "${userText}"

Conversation History:
${conversationContext}

CRITICAL CONVERSATIONAL RULES:
1. Speak as a natural, encouraging human interviewer. Never use robotic phrases like "I am an AI", "Welcome to JARVIS", "Neural core initialized", or system jargon.
2. Keep your response concise: 2 to 3 natural sentences optimized for real-time speech.
3. Acknowledge the candidate's answer naturally, then ask ONE clear, thoughtful follow-up question. Never ask multiple questions simultaneously.
4. Calibrate the depth to their Experience Level (${expLevel}). For entry-level, explore foundational trade-offs and concepts; for experienced candidates, explore production incidents, edge-case scalability, and design trade-offs.
5. If the candidate asks a question or asks for clarification, explain it succinctly and naturally, then seamlessly proceed with a relevant follow-up.
6. Do NOT use markdown asterisks (*, **, #), bullet points, numbers, or lists. Output plain conversational spoken text only.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const geminiResp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 160,
              temperature: 0.7,
            },
          }),
        });

        if (geminiResp.ok) {
          const data = await geminiResp.json();
          const generatedReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedReply && generatedReply.trim().length > 5) {
            const cleanSpeech = generatedReply
              .replace(/[*#`_]/g, "")
              .replace(/\n+/g, " ")
              .trim();
            return NextResponse.json({ reply: cleanSpeech });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, using intelligent fallback engine:", geminiErr);
      }
    }

    // Dynamic Context-Aware Fallback Engine calibrated to Candidate Form Inputs
    const reply = generateAdaptiveResponse(userText, intType, expLevel, targetRole, prefLang, historyTurns);
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({
      reply: "Understood. Could you dive deeper into the architectural trade-offs and performance implications of that approach?",
    });
  }
}

function generateAdaptiveResponse(
  userText: string,
  intType: string,
  expLevel: string,
  jobRole: string,
  language: string,
  history: MessageTurn[]
): string {
  const textLower = userText.toLowerCase();
  const isHinglish = language.toLowerCase().includes("hinglish");
  const isHindi = language.toLowerCase().includes("hindi");

  // 1. Topic Switching Requests
  if (textLower.includes("switch topic") || textLower.includes("change topic") || textLower.includes("can we talk about") || textLower.includes("let's discuss")) {
    if (isHinglish) {
      return "Zaroor! Hum topic switch kar sakte hain. Aap batayein kis particular domain ya project pe focus karna chahenge?";
    }
    return "Certainly! We can pivot smoothly. Which specific domain, architecture, or project would you like to explore next?";
  }

  // 2. Candidate Inquiries & Explanations
  if (textLower.startsWith("what is") || textLower.startsWith("can you explain") || textLower.startsWith("how does") || textLower.endsWith("?")) {
    if (textLower.includes("jwt") || textLower.includes("auth")) {
      return "JSON Web Tokens are stateless credentials signed cryptographically with a secret or public key. In high-concurrency systems, revocation is managed using short expiry times with refresh token rotation. How do you personally implement secure token invalidation upon user logout?";
    }
    if (textLower.includes("acid") || textLower.includes("database")) {
      return "ACID guarantees Atomicity, Consistency, Isolation, and Durability in database transactions. High isolation levels prevent concurrency anomalies like dirty reads and phantom reads at the expense of throughput. How do you decide the right balance between isolation and latency in high-traffic APIs?";
    }
    return `Great question. That concept fundamentally balances abstraction with execution efficiency. Given that foundation, how would you design a fault-tolerant pattern around it in a live production system?`;
  }

  // 3. Behavioral / HR Specific Flow
  if (intType.toLowerCase().includes("hr") || intType.toLowerCase().includes("behavioral")) {
    const hrQuestions = [
      "Could you tell me about a time when you had to meet a tight engineering deadline with incomplete requirements? How did you prioritize your deliverables?",
      "Can you describe a situation where you had a strong technical disagreement with a teammate or lead? How did you navigate the conversation to reach an agreement?",
      "Tell me about a project that did not go according to plan. What went wrong, and what key lesson did you take away from that experience?",
      "How do you handle situations where product requirements shift midway through a sprint?",
      "What motivates you most in engineering teams, and what kind of engineering culture helps you perform at your highest potential?"
    ];
    return hrQuestions[history.length % hrQuestions.length];
  }

  // 4. Calibrated Technical Questions by Experience Level
  if (expLevel.includes("Fresher") || expLevel.includes("0–1")) {
    const fresherQuestions = [
      `As someone starting your career in ${jobRole}, how do you approach debugging an unfamiliar codebase when an unexpected runtime exception occurs?`,
      "Can you explain the core differences between synchronous and asynchronous execution, and when you would use asynchronous processing in web services?",
      "In relational databases, how do primary keys differ from foreign keys, and why are indexes crucial for query performance?",
      "Could you walk me through the lifecycle of an API request from the client browser to the backend server?",
      "What best practices do you follow for writing clean, testable, and maintainable code in your personal or academic projects?"
    ];
    return fresherQuestions[history.length % fresherQuestions.length];
  }

  // 5. Senior / Experienced Technical Questions
  const experiencedQuestions = [
    `In your experience with ${jobRole}, how do you architect systems to handle horizontal autoscaling and database connection pool saturation under spike traffic?`,
    "How do you approach distributed caching strategies like Cache-Aside versus Write-Through, and how do you prevent cache thundering herd problems?",
    "When designing event-driven microservices, how do you ensure idempotent message processing and data consistency without heavy distributed transactions?",
    "Suppose a high-throughput API endpoint experiences sudden p99 latency spikes in production. Walk me through your step-by-step diagnostic and mitigation process.",
    "How do you balance technical debt against urgent feature delivery when leading a critical engineering initiative?"
  ];
  return experiencedQuestions[history.length % experiencedQuestions.length];
}
