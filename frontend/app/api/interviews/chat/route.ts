import { NextRequest, NextResponse } from "next/server";

interface MessageTurn {
  speaker?: "ai" | "candidate" | "student" | "interviewer";
  sender?: string;
  text?: string;
  content?: string;
  topic?: string;
  difficulty?: string;
}

export type AgentAction = "FOLLOW_UP" | "NEXT_QUESTION" | "END_INTERVIEW";

export interface AgentDecision {
  action: AgentAction;
  question: string;
  topic: string;
  difficulty: "basic" | "intermediate" | "advanced";
  round: string;
  evaluation: string;
  reason: string;
  clarification_attempt?: boolean;
}

// Canonical interview topic tracks
const INTERVIEW_AGENDAS: Record<string, string[]> = {
  Technical: [
    "Core Fundamentals & Principles",
    "Data Structures, Algorithms & Problem Solving",
    "System Architecture & API Design",
    "Concurrency, Performance & Optimization",
    "Production Debugging & Trade-offs",
  ],
  HR: [
    "Introduction, Career Trajectory & Motivation",
    "Team Dynamics, Culture & Collaboration",
    "Conflict Resolution & Managing Disagreement",
    "Work Ethic, Prioritization & Ownership",
    "Career Goals & Company Alignment",
  ],
  Behavioral: [
    "Initiative & Overcoming Ambiguity (STAR)",
    "Crisis & Critical Incident Management (STAR)",
    "Leadership & Mentoring Others (STAR)",
    "Constructive Feedback & Resilience (STAR)",
    "Cross-Functional Stakeholder Alignment (STAR)",
  ],
  Mixed: [
    "Round 1 (HR): Motivation, Background & Culture Fit",
    "Round 2 (Technical): Core Architecture & Engineering Principles",
    "Round 3 (Technical): Deep Dive & Trade-offs",
    "Round 4 (Behavioral): Handling High-Stakes Production Challenges",
    "Round 5 (Closing): Leadership, Growth & Aspirations",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      interview_type = "Technical", 
      experience_level = "Fresher", 
      job_role = "Software Engineer", 
      language = "English", 
      duration_minutes = 15,
      job_description = "",
      history = [],
      current_topic_index = 0,
      follow_up_count = 0,
      is_first_question = false,
      is_closing_question = false,
    } = body;

    const userText = (message || "").trim();
    const candidateName = (body.candidate_name || "Candidate").trim();
    const historyTurns: MessageTurn[] = Array.isArray(history) ? history : [];
    
    // Resolve agenda for interview type
    const normalizedType = interview_type === "HR / Behavioral" ? "HR" : interview_type;
    const agenda = INTERVIEW_AGENDAS[normalizedType] || INTERVIEW_AGENDAS.Technical;
    const currentTopic = agenda[Math.min(current_topic_index, agenda.length - 1)];

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";
    const mistralApiUrl = process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1/chat/completions";

    // Enforce guardrail: if already 2 follow-ups on this topic, force NEXT_QUESTION or END_INTERVIEW
    const mustAdvanceTopic = follow_up_count >= 2;
    const isLastTopic = current_topic_index >= agenda.length - 1;

    // Build Mistral Prompt
    if (mistralApiKey && mistralApiKey !== "your_mistral_api_key" && mistralApiKey.length > 10) {
      try {
        const systemPrompt = `You are a Senior Principal Interviewer and Hiring Committee Lead at PrepPilot AI conducting a professional, human-like voice interview.
CANDIDATE CONFIGURATION:
- Name: ${candidateName}
- Target Role: ${job_role}
- Interview Type: ${interview_type} (Agenda: ${JSON.stringify(agenda)})
- Experience Level: ${experience_level}
- Spoken Language: ${language} (Speak natural conversational ${language}. If Hindi, speak Hindi; if English, speak natural English).
${job_description ? `- Job Description Context: ${job_description}\n` : ""}
CURRENT INTERVIEW STATE:
- Current Topic (${current_topic_index + 1}/${agenda.length}): "${currentTopic}"
- Consecutive Follow-ups asked on this topic so far: ${follow_up_count} / max 2
- Force Topic Progression: ${mustAdvanceTopic ? "YES (Must advance to NEXT_QUESTION or END_INTERVIEW)" : "NO"}
- Is Last Topic: ${isLastTopic ? "YES" : "NO"}
- Is First Question: ${is_first_question ? "YES" : "NO"}
- Is Final Closing: ${is_closing_question ? "YES" : "NO"}

INTERVIEW AGENT RULES:
1. OUTPUT JSON ONLY matching this exact structure:
{
  "action": "FOLLOW_UP" | "NEXT_QUESTION" | "END_INTERVIEW",
  "question": "<exactly 1 to 2 spoken sentences, natural, direct, under 40 words>",
  "topic": "<name of the topic>",
  "difficulty": "basic" | "intermediate" | "advanced",
  "round": "<interview round label>",
  "evaluation": "<brief 1-sentence assessment of candidate's prior answer, or 'Initial greeting' if start>",
  "reason": "<reason for deciding action>"
}
2. FOLLOW-UP LOGIC:
   - If candidate's answer was incomplete or mentioned an intriguing detail/trade-off, and follow_up_count < 2, action can be "FOLLOW_UP".
   - If candidate answered sufficiently, or follow_up_count >= 2, action MUST be "NEXT_QUESTION" on the next topic from the agenda.
   - If all topics are completed or time has concluded, action MUST be "END_INTERVIEW".
3. TONE & VOCAL DELIVERY:
   - Speak conversationally, warmly, and clearly as if on a real audio call.
   - Do NOT use markdown (*, **, #, bullets). Only clean spoken words.
   - Keep questions tight and crisp so TTS plays instantly. Never ask two questions at once.
4. CALIBRATION:
   - Fresher: Fundamentals, clean abstractions, learning mindset.
   - Intermediate: Edge-case trade-offs, architecture decisions, resilience.
   - Experienced: Scale, failure modes, consensus, mentorship, leadership.`;

        const recentTurns = historyTurns.slice(-8).map((t) => {
          const role = (t.speaker === "ai" || t.speaker === "interviewer" || t.sender === "ai") ? "assistant" : "user";
          return {
            role: role as "assistant" | "user",
            content: t.text || t.content || "",
          };
        });

        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
          ...recentTurns,
        ];

        if (is_first_question) {
          messages.push({
            role: "user",
            content: `The interview is starting now. Greet ${candidateName} warmly, introduce the ${interview_type} round for ${job_role}, and ask the first foundational question on topic "${agenda[0]}". Output JSON.`,
          });
        } else if (is_closing_question) {
          messages.push({
            role: "user",
            content: `Candidate said: "${userText}". All rounds are concluded. Thank them professionally, deliver a warm closing statement, and set action to END_INTERVIEW. Output JSON.`,
          });
        } else {
          messages.push({
            role: "user",
            content: `Candidate answered: "${userText}". Analyze this response against topic "${currentTopic}". Follow-ups so far: ${follow_up_count}. Decide whether to FOLLOW_UP (if count < 2 and candidate omitted key detail or mentioned something worth digging into), or NEXT_QUESTION (if answer was sufficient or count >= 2), or END_INTERVIEW (if last topic). Output JSON.`,
          });
        }

        const mistralRes = await fetch(mistralApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mistralApiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            model: mistralModel,
            messages,
            temperature: 0.5,
            response_format: { type: "json_object" },
            max_tokens: 280,
          }),
        });

        if (mistralRes.ok) {
          const data = await mistralRes.json();
          const raw = data?.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(raw) as AgentDecision;

          // Enforce hard programmatic guardrails on LLM output
          let sanitizedAction = parsed.action || "NEXT_QUESTION";
          if (mustAdvanceTopic && sanitizedAction === "FOLLOW_UP") {
            sanitizedAction = isLastTopic ? "END_INTERVIEW" : "NEXT_QUESTION";
          }
          if (is_closing_question) {
            sanitizedAction = "END_INTERVIEW";
          }

          const cleanQuestion = (parsed.question || "")
            .replace(/[*#`_]/g, "")
            .replace(/\n+/g, " ")
            .trim();

          return NextResponse.json({
            action: sanitizedAction,
            question: cleanQuestion || "Could you walk me through your engineering design choices?",
            topic: parsed.topic || currentTopic,
            difficulty: parsed.difficulty || (experience_level === "Experienced" ? "advanced" : "intermediate"),
            round: parsed.round || interview_type,
            evaluation: parsed.evaluation || "Answer recorded.",
            reason: parsed.reason || "Contextual progression.",
            provider: "mistral-ai",
          });
        } else {
          console.error("Mistral returned error status:", mistralRes.status, await mistralRes.text());
        }
      } catch (err) {
        console.error("Mistral Agent Reasoning error:", err);
      }
    }

    // Dynamic Intelligent Fallback Engine
    const fallbackDecision = generateDeterministicAgentDecision({
      userText,
      candidateName,
      interviewType: normalizedType,
      agenda,
      currentTopicIndex: current_topic_index,
      followUpCount: follow_up_count,
      experienceLevel: experience_level,
      jobRole: job_role,
      language,
      isFirstQuestion: is_first_question,
      isClosing: is_closing_question,
    });

    return NextResponse.json({
      ...fallbackDecision,
      provider: "intelligent-rule-engine",
    });
  } catch (err: any) {
    console.error("Chat route critical error:", err);
    return NextResponse.json({
      action: "NEXT_QUESTION",
      question: "Understood. Moving forward, how do you approach performance monitoring and troubleshooting in production?",
      topic: "System Observability",
      difficulty: "intermediate",
      round: "Technical",
      evaluation: "Acknowledged candidate response.",
      reason: "Graceful recovery fallback.",
      provider: "fallback",
    });
  }
}

function generateDeterministicAgentDecision({
  userText,
  candidateName,
  interviewType,
  agenda,
  currentTopicIndex,
  followUpCount,
  experienceLevel,
  jobRole,
  language,
  isFirstQuestion,
  isClosing,
}: {
  userText: string;
  candidateName: string;
  interviewType: string;
  agenda: string[];
  currentTopicIndex: number;
  followUpCount: number;
  experienceLevel: string;
  jobRole: string;
  language: string;
  isFirstQuestion: boolean;
  isClosing: boolean;
}): AgentDecision {
  const isHindi = language.toLowerCase().includes("hi");

  if (isFirstQuestion) {
    if (isHindi) {
      return {
        action: "NEXT_QUESTION",
        question: `Namaste ${candidateName}! ${jobRole} ke ${interviewType} interview mein aapka swagat hai. Kripya apna brief introduction dein aur batayein ki aapne is field mein kya seekha hai.`,
        topic: agenda[0] || "Introduction",
        difficulty: "basic",
        round: interviewType,
        evaluation: "Initial greeting",
        reason: "First interview question",
      };
    }
    return {
      action: "NEXT_QUESTION",
      question: `Hello ${candidateName}, welcome to your ${interviewType} interview for the ${jobRole} role. To get started, could you introduce yourself and describe a recent technical project you worked on?`,
      topic: agenda[0] || "Introduction",
      difficulty: "basic",
      round: interviewType,
      evaluation: "Initial greeting",
      reason: "First interview question",
    };
  }

  if (isClosing || currentTopicIndex >= agenda.length - 1 && followUpCount >= 1) {
    return {
      action: "END_INTERVIEW",
      question: isHindi
        ? `Shukriya ${candidateName}! Aapka interview yahan samapt hota hai. Hum aapke answers ka mulyankan karke report taiyar kar rahe hain.`
        : `Thank you, ${candidateName}. That concludes all sections of our interview today. I appreciate your thoughtful answers, and your comprehensive evaluation report is now ready.`,
      topic: "Closing & Evaluation",
      difficulty: "basic",
      round: "Wrap-up",
      evaluation: "Completed all planned agenda topics.",
      reason: "End of scheduled interview topics.",
    };
  }

  // Answer quality analysis
  const words = userText.split(/\s+/).filter(Boolean);
  const isShort = words.length < 8;

  // Decide if we should do 1 follow-up
  if (!isShort && followUpCount === 0) {
    const t = userText.toLowerCase();
    let followUpQ = `That's insightful. Could you dig deeper into the specific trade-offs or constraints you encountered while making that decision?`;
    if (t.includes("api") || t.includes("endpoint") || t.includes("service")) {
      followUpQ = "Good point. How would you handle rate limiting, token expiration, and caching for those services?";
    } else if (t.includes("team") || t.includes("conflict") || t.includes("disagree")) {
      followUpQ = "I see. If a teammate strongly disagreed with your proposed approach right before a release deadline, how did you reach alignment?";
    } else if (t.includes("db") || t.includes("database") || t.includes("sql") || t.includes("query")) {
      followUpQ = "Understood. When database queries start slowing down under high concurrency, what steps do you take to identify and optimize the bottleneck?";
    }

    return {
      action: "FOLLOW_UP",
      question: followUpQ,
      topic: agenda[currentTopicIndex] || "Deep Dive",
      difficulty: experienceLevel === "Experienced" ? "advanced" : "intermediate",
      round: interviewType,
      evaluation: "Strong preliminary response, probing depth.",
      reason: "Contextual follow-up to test reasoning depth.",
    };
  }

  // Next topic progression
  const nextTopicIdx = Math.min(currentTopicIndex + 1, agenda.length - 1);
  const nextTopic = agenda[nextTopicIdx];

  const questionsByTopic: Record<string, string> = {
    "Core Fundamentals & Principles": `Let's discuss ${jobRole} core fundamentals: How do you choose between synchronous and asynchronous communication patterns in your applications?`,
    "Data Structures, Algorithms & Problem Solving": `In terms of algorithmic efficiency, how would you optimize data lookups and memory consumption when processing large real-time datasets?`,
    "System Architecture & API Design": `Moving to architecture: How do you design APIs to maintain backward compatibility while evolving schemas rapidly?`,
    "Concurrency, Performance & Optimization": `How do you identify, measure, and eliminate concurrency bottlenecks or race conditions in production?`,
    "Production Debugging & Trade-offs": `When an unexpected production outage occurs with vague logs, what is your systematic incident triage and root cause analysis process?`,
    "Introduction, Career Trajectory & Motivation": `What drew you to this ${jobRole} role, and what engineering problem has fascinated you most recently?`,
    "Team Dynamics, Culture & Collaboration": `Tell me about a time you collaborated with cross-functional partners like Product or Design to ship a complex requirement.`,
    "Conflict Resolution & Managing Disagreement": `Describe a situation where a technical debate stalled progress. How did you facilitate consensus?`,
    "Work Ethic, Prioritization & Ownership": `When balancing conflicting deadlines across multiple high-priority tasks, how do you prioritize your focus?`,
    "Career Goals & Company Alignment": `Where do you envision your technical and leadership growth heading over the next two years?`,
  };

  const nextQuestion = questionsByTopic[nextTopic] || 
    `Moving to our next area, ${nextTopic}: Could you share your practical experience and best practices for this aspect of ${jobRole}?`;

  return {
    action: "NEXT_QUESTION",
    question: nextQuestion,
    topic: nextTopic,
    difficulty: experienceLevel === "Experienced" ? "advanced" : "intermediate",
    round: interviewType,
    evaluation: "Answer evaluated. Advancing to next structured topic in agenda.",
    reason: "Agenda topic progression.",
  };
}
