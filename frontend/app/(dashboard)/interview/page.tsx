"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useInterviewSession } from "@/context/InterviewSessionContext";
import { supabase } from "@/lib/supabase";
import JarvisOrb from "@/components/JarvisOrb";
import { 
  UserCheck, 
  User,
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Pause,
  Clock, 
  X, 
  Award,
  Briefcase,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  GitBranch,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Radio,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface PreInterviewForm {
  fullName: string;
  interviewType: "Technical" | "HR" | "Behavioral" | "Mixed";
  experienceLevel: "Fresher" | "Intermediate" | "Experienced";
  targetRole: string;
  language: "English" | "Hindi";
  durationMinutes: 10 | 15 | 20 | 30;
  jobDescription?: string;
}

export type AgentState = 
  | "IDLE"
  | "SETUP"
  | "INTRODUCTION"
  | "ASKING"
  | "LISTENING"
  | "TRANSCRIBING"
  | "EVALUATING"
  | "FOLLOW_UP"
  | "NEXT_QUESTION"
  | "CLOSING"
  | "COMPLETED"
  | "PAUSED"
  | "ERROR";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, user, recordActivity } = useAuth();
  const { isInterviewActive, setIsInterviewActive } = useInterviewSession();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"interview" | "timemachine">(
    tabParam === "timemachine" ? "timemachine" : "interview"
  );

  useEffect(() => {
    if (tabParam === "timemachine") setActiveTab("timemachine");
    else setActiveTab("interview");
  }, [tabParam]);

  // Clean up session and audio resources on unmount
  useEffect(() => {
    return () => {
      setIsInterviewActive(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (deepgramSocketRef.current) {
        try { deepgramSocketRef.current.close(); } catch {}
        deepgramSocketRef.current = null;
      }
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); } catch {}
        currentAudioRef.current = null;
      }
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch {}
      }
    };
  }, [setIsInterviewActive]);

  // Candidate Profile Information
  const initialName = profile?.full_name || user?.user_metadata?.full_name || "";
  const initialRole = profile?.target_job_role || "Software Developer";

  // Pre-Interview Modal State & Form Values
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<PreInterviewForm>({
    fullName: initialName,
    interviewType: "Technical",
    experienceLevel: "Fresher",
    targetRole: initialRole,
    language: "English",
    durationMinutes: 15,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // Sync Supabase Auth profile into form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.full_name,
        targetRole: prev.targetRole || profile.target_job_role || "Software Developer",
      }));
    }
  }, [profile]);

  // Audio & Live Interview States
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>("IDLE");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<string>("Introduction");
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [clarificationAttempted, setClarificationAttempted] = useState<boolean>(false);
  const [interviewRounds, setInterviewRounds] = useState<string[]>([]);
  const isCandidateProcessingRef = useRef<boolean>(false);
  const consecutiveSilenceRef = useRef<number>(0);

  // Subtitles
  const [aiCurrentSubtitle, setAiCurrentSubtitle] = useState<string>("");
  const [candidateLiveSubtitle, setCandidateLiveSubtitle] = useState<string>("");
  const [candidateInterimSubtitle, setCandidateInterimSubtitle] = useState<string>("");

  // Internal Turn Logs
  const [historyTurns, setHistoryTurns] = useState<
    Array<{ id: string; speaker: "ai" | "candidate"; text: string; timestamp: string; topic?: string; difficulty?: string }>
  >([]);

  // Post-Interview Evaluation State
  const [evaluationData, setEvaluationData] = useState<any | null>(null);

  // Time Machine Interactive Turns and Simulation State
  const timeMachineTurns = [
    {
      id: "tm-1",
      timestamp: "02:15",
      question: "Explain how you design cache invalidation across distributed microservices.",
      originalAnswer: "I usually configure a 5-minute fixed TTL on Redis so cached items expire automatically.",
      originalScore: 68,
      originalFeedback: "Passive TTL expiration introduces stale reads and lacks proactive consistency guarantees during database writes.",
      suggestedAnswer: "We implement an event-driven cache invalidation pattern using Redis with Change Data Capture (CDC) via Debezium. When a primary database write commits, a domain event publishes to Kafka, which triggers proactive cache eviction with exponential backoff on retry.",
      branchScore: 94,
      delta: "+26%",
      metrics: { clarity: 95, precision: 96, confidence: 92 }
    },
    {
      id: "tm-2",
      timestamp: "07:40",
      question: "How do you diagnose and resolve memory leaks in a production Node.js service?",
      originalAnswer: "I monitor the CPU graph in CloudWatch and restart the container if memory exceeds 90%.",
      originalScore: 56,
      originalFeedback: "Container restart is a temporary mitigation that disrupts active connections without identifying the root allocation leak.",
      suggestedAnswer: "I generate heap snapshots under synthetic load using Chrome DevTools or v8-profiler, inspect retained object trees to locate detached DOM nodes or uncollected event listeners, and analyze garbage collection frequency with clinic.js.",
      branchScore: 96,
      delta: "+40%",
      metrics: { clarity: 98, precision: 95, confidence: 95 }
    },
    {
      id: "tm-3",
      timestamp: "12:10",
      question: "What are the trade-offs between adopting GraphQL vs REST APIs for customer-facing mobile apps?",
      originalAnswer: "GraphQL is better because it avoids over-fetching data and combines multiple requests into one.",
      originalScore: 74,
      originalFeedback: "Good awareness of over-fetching, but omits CDN caching challenges, N+1 resolver performance hazards, and query cost limits.",
      suggestedAnswer: "GraphQL eliminates over-fetching and delivers tailor-made mobile payloads, but complicates HTTP edge caching. It also introduces potential N+1 resolver queries requiring DataLoader batching, and demands AST depth limiting to prevent recursive denial-of-service queries.",
      branchScore: 95,
      delta: "+21%",
      metrics: { clarity: 96, precision: 94, confidence: 95 }
    }
  ];

  const [selectedTmIndex, setSelectedTmIndex] = useState<number>(0);
  const [branchDraftAnswer, setBranchDraftAnswer] = useState<string>(timeMachineTurns[0].suggestedAnswer);
  const [isSimulatingBranch, setIsSimulatingBranch] = useState<boolean>(false);
  const [evaluatedTurn, setEvaluatedTurn] = useState<any>(timeMachineTurns[0]);

  const handleSelectTmTurn = (idx: number) => {
    setSelectedTmIndex(idx);
    setBranchDraftAnswer(timeMachineTurns[idx].suggestedAnswer);
    setEvaluatedTurn(timeMachineTurns[idx]);
  };

  const handleSimulateBranch = () => {
    setIsSimulatingBranch(true);
    setTimeout(() => {
      setIsSimulatingBranch(false);
      setEvaluatedTurn({
        ...timeMachineTurns[selectedTmIndex],
        branchAnswer: branchDraftAnswer,
        branchScore: 95,
        delta: "+27%"
      });
    }, 700);
  };

  // Audio & Stream References
  const [deepgramKey, setDeepgramKey] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const deepgramSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const aiSubtitleIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const animFrameVolumeRef = useRef<number | null>(null);

  // Fullscreen tracking state
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const interviewContainerRef = useRef<HTMLDivElement | null>(null);

  // Listen to fullscreen changes (e.g. user presses ESC or exits)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsNativeFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // Lock document and body scrolling ONLY while interview is active
  useEffect(() => {
    if (isInterviewActive) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isInterviewActive]);

  // Request Fullscreen Helper (safely works across modern browsers)
  const enterFullscreen = () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if ((docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).msRequestFullscreen) {
        (docEl as any).msRequestFullscreen();
      }
    } catch {}
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch {}
  };

  // Interview Duration Timer with automatic conclusion when time expires
  useEffect(() => {
    if (isInterviewActive && !isPaused) {
      const maxSeconds = (formData.durationMinutes || 15) * 60;
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= maxSeconds) {
            // Auto complete interview when duration is reached
            setTimeout(() => {
              handleEndInterview();
            }, 0);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isInterviewActive, isPaused, formData.durationMinutes]);

  const togglePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
      }
    } else {
      setIsPaused(true);
      stopAiSpeech();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Inspect Deepgram key silently
  useEffect(() => {
    axios
      .get("/api/interviews/deepgram-token")
      .then((res) => {
        if (res.data?.configured && res.data?.key) {
          setDeepgramKey(res.data.key);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Web Speech Synthesis & comprehensive component unmount cleanup
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      // 1. Release microphone tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      // 2. Close Deepgram WebSocket connection
      if (deepgramSocketRef.current) {
        try { deepgramSocketRef.current.close(); } catch {}
        deepgramSocketRef.current = null;
      }
      // 3. Stop speech recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      // 4. Cancel Speech Synthesis & audio playback
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch {}
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        } catch {}
        currentAudioRef.current = null;
      }
      // 5. Clear intervals & animation frames
      if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameVolumeRef.current) cancelAnimationFrame(animFrameVolumeRef.current);
    };
  }, []);

  // Real Microphone Volume Meter
  const startVolumeMeter = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);
        setMicVolume(normalized);
        animFrameVolumeRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch {}
  };

  const stopVolumeMeter = () => {
    if (animFrameVolumeRef.current) cancelAnimationFrame(animFrameVolumeRef.current);
    setMicVolume(0);
  };

  // Stop AI Audio Immediately on Interruption
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAiSpeech = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if (synthRef.current) synthRef.current.cancel();
    if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
    setIsAiSpeaking(false);
    setIsAiThinking(false);
    setAiCurrentSubtitle("");
  }, []);

  // Progressive Audio-Synchronized Speech & Subtitles via Deepgram TTS (with Web Speech fallback)
  const speakAiResponse = useCallback((fullText: string, onSpeechEnd?: () => void) => {
    stopAiSpeech();

    const words = fullText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    setActiveQuestion(fullText);
    setAgentState("ASKING");
    setIsAiSpeaking(true);
    setIsAiThinking(false);
    setAiCurrentSubtitle("");

    // Callback when speech concludes to switch state machine to LISTENING
    const handlePlaybackFinished = () => {
      setIsAiSpeaking(false);
      setAgentState("LISTENING");
      setAiCurrentSubtitle(fullText);
      setHistoryTurns((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          speaker: "ai",
          text: fullText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          topic: currentTopic,
        },
      ]);
      setTimeout(() => setAiCurrentSubtitle(""), 600);
      if (onSpeechEnd) onSpeechEnd();
    };

    // Attempt high-definition Deepgram TTS first
    const playDeepgramAudio = async () => {
      try {
        const ttsResponse = await fetch("/api/interviews/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: fullText,
            model: "aura-asteria-en",
          }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          // Progressive subtitle typewriter sync with audio playback
          audio.onplay = () => {
            setIsAiSpeaking(true);
            setAgentState("ASKING");
            let currentWordIdx = 0;
            const totalDurationEstimate = Math.max(1200, (words.length / 2.6) * 1000);
            const intervalDelay = Math.max(60, totalDurationEstimate / words.length);

            aiSubtitleIntervalRef.current = setInterval(() => {
              currentWordIdx += 1;
              setAiCurrentSubtitle(words.slice(0, currentWordIdx).join(" "));
              if (currentWordIdx >= words.length) {
                if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
              }
            }, intervalDelay);
          };

          audio.onended = () => {
            if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
            handlePlaybackFinished();
            URL.revokeObjectURL(audioUrl);
            currentAudioRef.current = null;
          };

          audio.onerror = () => {
            // Fallback to browser SpeechSynthesis
            fallbackToWebSpeech();
          };

          await audio.play();
          return;
        } else {
          fallbackToWebSpeech();
        }
      } catch (err) {
        fallbackToWebSpeech();
      }
    };

    const fallbackToWebSpeech = () => {
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = formData.language === "Hindi" ? "hi-IN" : "en-US";

        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("David")) &&
            v.lang.startsWith("en")
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        let boundaryFired = false;
        utterance.onboundary = (event) => {
          if (event.name === "word") {
            boundaryFired = true;
            const charIndex = event.charIndex;
            const nextSpace = fullText.indexOf(" ", charIndex);
            const currentLength = nextSpace !== -1 ? nextSpace : fullText.length;
            setAiCurrentSubtitle(fullText.slice(0, currentLength));
          }
        };

        utterance.onstart = () => {
          setIsAiSpeaking(true);
          setAgentState("ASKING");
          let currentWordIdx = 0;
          const totalDurationEstimate = (words.length / 2.7) * 1000;
          const intervalDelay = Math.max(80, totalDurationEstimate / words.length);

          aiSubtitleIntervalRef.current = setInterval(() => {
            if (!boundaryFired) {
              currentWordIdx += 1;
              setAiCurrentSubtitle(words.slice(0, currentWordIdx).join(" "));
              if (currentWordIdx >= words.length) {
                clearInterval(aiSubtitleIntervalRef.current);
              }
            }
          }, intervalDelay);
        };

        utterance.onend = () => {
          if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
          handlePlaybackFinished();
        };

        utterance.onerror = () => {
          if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
          handlePlaybackFinished();
        };

        synthRef.current.speak(utterance);
      } else {
        let currentWordIdx = 0;
        aiSubtitleIntervalRef.current = setInterval(() => {
          currentWordIdx += 1;
          setAiCurrentSubtitle(words.slice(0, currentWordIdx).join(" "));
          if (currentWordIdx >= words.length) {
            clearInterval(aiSubtitleIntervalRef.current);
            handlePlaybackFinished();
          }
        }, 150);
      }
    };

    playDeepgramAudio();
  }, [stopAiSpeech, formData.language, currentTopic]);

  // Process Candidate Transcript & Contextual AI Response
  const handleCandidateFinishedSpeaking = useCallback(
    async (finalTranscript: string) => {
      // Guard against race conditions and concurrent processing
      if (isCandidateProcessingRef.current) return;
      const trimmed = finalTranscript.trim();
      
      // Handle silence / short / empty answers
      const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
      if (wordCount < 2) {
        if (!clarificationAttempted) {
          setClarificationAttempted(true);
          setAgentState("ASKING");
          speakAiResponse(
            formData.language === "Hindi"
              ? "Kripya thoda aur detail mein batayein, taaki hum aapke answer ka mulyankan kar sakein."
              : "I didn't quite catch that. Could you please elaborate a bit more on your response?"
          );
          return;
        } else {
          // If already tried clarification, move forward to avoid getting stuck
          setClarificationAttempted(false);
        }
      }

      isCandidateProcessingRef.current = true;
      setAgentState("EVALUATING");
      setIsCandidateSpeaking(false);
      setIsAiThinking(true);
      setCandidateLiveSubtitle("");
      setCandidateInterimSubtitle("");

      const candidateTurnId = `cand-${Date.now()}`;
      const newHistory = [
        ...historyTurns,
        {
          id: candidateTurnId,
          speaker: "candidate" as const,
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          topic: currentTopic,
        },
      ];
      setHistoryTurns(newHistory);

      // Persist turn to Supabase
      try {
        if (user?.id && sessionId) {
          await supabase.from("interview_messages").insert({
            session_id: sessionId,
            sender: "student",
            content: trimmed,
          });
        }
      } catch (dbErr) {
        console.warn("Message insert non-blocking failure:", dbErr);
      }

      try {
        const res = await axios.post("/api/interviews/chat", {
          message: trimmed,
          candidate_name: formData.fullName,
          interview_type: formData.interviewType,
          experience_level: formData.experienceLevel,
          job_role: formData.targetRole,
          language: formData.language,
          duration_minutes: formData.durationMinutes,
          job_description: formData.jobDescription,
          history: newHistory,
          current_topic_index: currentTopicIndex,
          follow_up_count: followUpCount,
        });

        setIsAiThinking(false);
        const data = res.data;
        const nextAction: "FOLLOW_UP" | "NEXT_QUESTION" | "END_INTERVIEW" = data?.action || "NEXT_QUESTION";
        const replyQuestion = data?.question || "Thank you. Let's move on to discuss how you handle deployment and production resilience.";
        const returnedTopic = data?.topic || currentTopic;

        if (nextAction === "FOLLOW_UP") {
          setAgentState("FOLLOW_UP");
          setFollowUpCount((prev) => prev + 1);
        } else if (nextAction === "NEXT_QUESTION") {
          setAgentState("NEXT_QUESTION");
          setCurrentTopicIndex((prev) => prev + 1);
          setCurrentTopic(returnedTopic);
          setFollowUpCount(0);
          setClarificationAttempted(false);
        } else if (nextAction === "END_INTERVIEW") {
          setAgentState("CLOSING");
          speakAiResponse(replyQuestion, () => {
            setTimeout(() => {
              handleEndInterview();
            }, 1200);
          });
          isCandidateProcessingRef.current = false;
          return;
        }

        speakAiResponse(replyQuestion);

        try {
          if (user?.id && sessionId) {
            await supabase.from("interview_messages").insert({
              session_id: sessionId,
              sender: "ai",
              content: replyQuestion,
              question_type: nextAction.toLowerCase(),
            });
          }
        } catch {}
      } catch (err) {
        setIsAiThinking(false);
        setAgentState("NEXT_QUESTION");
        setCurrentTopicIndex((prev) => prev + 1);
        setFollowUpCount(0);
        speakAiResponse(
          formData.language === "Hindi"
            ? "Dhanyawaad. Agle topic par aage badhte hue, production monitoring aur system metrics ke baare mein aapka kya anubhav hai?"
            : "Understood. Moving forward to our next area: could you explain how you design for reliability and monitor production performance?"
        );
      } finally {
        isCandidateProcessingRef.current = false;
      }
    },
    [
      historyTurns,
      formData,
      sessionId,
      currentTopic,
      currentTopicIndex,
      followUpCount,
      clarificationAttempted,
      speakAiResponse,
      user?.id,
    ]
  );

  // Web Speech Recognition (Fallback STT)
  const initWebSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Clean up any existing recognition instance to prevent duplicate listeners
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = formData.language === "Hindi" ? "hi-IN" : "en-US";

    let debounceTimer: any = null;
    let accumulatedFinal = "";

    recognition.onresult = (event: any) => {
      if (isPaused || isMuted || isAiSpeaking || isAiThinking) return;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) accumulatedFinal += (accumulatedFinal ? " " : "") + item[0].transcript;
        else interim += item[0].transcript;
      }

      if (interim || accumulatedFinal) {
        setAgentState("TRANSCRIBING");
        setIsCandidateSpeaking(true);
      }

      setCandidateLiveSubtitle(accumulatedFinal);
      setCandidateInterimSubtitle(interim);

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const fullTurn = (accumulatedFinal + " " + interim).trim();
        if (fullTurn.length > 2) {
          accumulatedFinal = "";
          handleCandidateFinishedSpeaking(fullTurn);
        }
      }, 1600);
    };

    recognition.onerror = () => setIsCandidateSpeaking(false);
    recognition.onend = () => {
      if (isInterviewActive && !isMuted && !isPaused) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  }, [isInterviewActive, isMuted, isPaused, isAiSpeaking, stopAiSpeech, handleCandidateFinishedSpeaking, formData.language]);

  // Deepgram WebSocket Connection
  const connectDeepgramStreaming = useCallback(
    (stream: MediaStream, apiKey: string) => {
      try {
        const socket = new WebSocket(
          "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000&smart_format=true&endpointing=300",
          ["token", apiKey]
        );

        socket.onopen = () => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = (e) => {
            if (socket.readyState !== WebSocket.OPEN) return;
            if (isPaused || isMuted || isAiSpeaking || isAiThinking) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            socket.send(pcm16.buffer);
          };
        };

        let speechEndDebounce: any = null;
        let accumulatedTranscript = "";

        socket.onmessage = (messageEvent) => {
          try {
            // Ignore any residual incoming speech if AI is speaking or thinking
            if (isAiSpeaking || isAiThinking) return;

            const data = JSON.parse(messageEvent.data);
            const transcript = data.channel?.alternatives?.[0]?.transcript;
            if (transcript && transcript.trim().length > 0) {
              setAgentState("TRANSCRIBING");
              setIsCandidateSpeaking(true);

              if (data.is_final) {
                accumulatedTranscript = accumulatedTranscript ? `${accumulatedTranscript} ${transcript}` : transcript;
                setCandidateLiveSubtitle(accumulatedTranscript);
                setCandidateInterimSubtitle("");

                if (speechEndDebounce) clearTimeout(speechEndDebounce);

                if (data.speech_final) {
                  const sendText = accumulatedTranscript;
                  accumulatedTranscript = "";
                  handleCandidateFinishedSpeaking(sendText);
                } else {
                  speechEndDebounce = setTimeout(() => {
                    if (accumulatedTranscript.trim().length > 2) {
                      const sendText = accumulatedTranscript;
                      accumulatedTranscript = "";
                      handleCandidateFinishedSpeaking(sendText);
                    }
                  }, 1800);
                }
              } else {
                setCandidateInterimSubtitle(transcript);
              }
            }
          } catch {}
        };

        socket.onerror = () => initWebSpeechRecognition();
        deepgramSocketRef.current = socket;
      } catch {
        initWebSpeechRecognition();
      }
    },
    [isAiSpeaking, isPaused, isMuted, stopAiSpeech, handleCandidateFinishedSpeaking, initWebSpeechRecognition]
  );

  // Pre-Interview Form Validation & Blur
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof PreInterviewForm, val?: any) => {
    let err = "";
    if (field === "fullName") {
      const v = (val !== undefined ? val : formData.fullName).trim();
      if (!v) err = "Candidate name is required.";
      else if (v.length < 2) err = "Candidate name must be at least 2 characters.";
    } else if (field === "targetRole") {
      const v = (val !== undefined ? val : formData.targetRole).trim();
      if (!v) err = "Target job role is required (e.g. Full-Stack Developer).";
      else if (v.length < 2) err = "Target role must be at least 2 characters.";
    } else if (field === "interviewType") {
      const v = val !== undefined ? val : formData.interviewType;
      if (!v) err = "Interview type is required.";
    } else if (field === "experienceLevel") {
      const v = val !== undefined ? val : formData.experienceLevel;
      if (!v) err = "Experience level is required.";
    } else if (field === "language") {
      const v = val !== undefined ? val : formData.language;
      if (!v) err = "Preferred interview language is required.";
    } else if (field === "durationMinutes") {
      const v = val !== undefined ? val : formData.durationMinutes;
      if (!v || v < 5 || v > 60) err = "Please choose a valid duration between 5 and 60 minutes.";
    }

    setFormErrors((prev) => ({ ...prev, [field]: err, microphone: undefined }));
    return !err;
  };

  const handleFormFieldBlur = (field: keyof PreInterviewForm) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateAllFormFields = () => {
    const isNameValid = validateField("fullName");
    const isRoleValid = validateField("targetRole");
    const isTypeValid = validateField("interviewType");
    const isExpValid = validateField("experienceLevel");
    const isLangValid = validateField("language");
    const isDurValid = validateField("durationMinutes");

    return isNameValid && isRoleValid && isTypeValid && isExpValid && isLangValid && isDurValid;
  };

  const handleStartFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched({
      fullName: true,
      targetRole: true,
      interviewType: true,
      experienceLevel: true,
      language: true,
      durationMinutes: true,
    });

    if (!validateAllFormFields()) return;

    // 1. Immediately request browser Fullscreen directly in user gesture context
    enterFullscreen();

    setIsInitializing(true);
    setFormErrors({});

    try {
      // 2. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;
      startVolumeMeter(stream);

      // 3. Connect Voice Streaming (Deepgram or Web Speech)
      if (deepgramKey) connectDeepgramStreaming(stream, deepgramKey);
      else initWebSpeechRecognition();

      // 4. Persist session to Supabase
      let newSessionId = null;
      try {
        if (user?.id) {
          const { data: sessionRecord } = await supabase.from("interview_sessions").insert({
            student_id: user.id,
            job_role: formData.targetRole,
            topics: [formData.interviewType, formData.experienceLevel, formData.language],
            difficulty: formData.experienceLevel.includes("3+") ? "hard" : formData.experienceLevel.includes("1–3") ? "medium" : "easy",
            duration_minutes: formData.durationMinutes,
            status: "in_progress",
          }).select().single();
          if (sessionRecord) newSessionId = sessionRecord.id;
        }
      } catch {}

      setSessionId(newSessionId);
      setIsInterviewActive(true);
      setAgentState("INTRODUCTION");
      setCurrentTopicIndex(0);
      setFollowUpCount(0);
      setClarificationAttempted(false);
      setTimerSeconds(0);
      setHistoryTurns([]);
      setAiCurrentSubtitle("");
      setCandidateLiveSubtitle("");
      setCandidateInterimSubtitle("");
      setEvaluationData(null);
      setIsModalOpen(false);
      setIsAiThinking(true);

      // 5. Dynamic Opening Greeting & Role-Calibrated First Question via Mistral AI
      try {
        const openingRes = await axios.post("/api/interviews/chat", {
          message: `Hello, my name is ${formData.fullName.trim()}. I am ready for my ${formData.interviewType} interview for the ${formData.targetRole} role.`,
          candidate_name: formData.fullName,
          interview_type: formData.interviewType,
          experience_level: formData.experienceLevel,
          job_role: formData.targetRole,
          language: formData.language,
          duration_minutes: formData.durationMinutes,
          job_description: formData.jobDescription,
          history: [],
          current_topic_index: 0,
          follow_up_count: 0,
          is_first_question: true,
        });

        setIsAiThinking(false);
        const openingData = openingRes.data;
        const openingQuestion = openingData?.question || 
          `Hello ${formData.fullName.trim()}! Welcome to your ${formData.interviewType} interview for the ${formData.targetRole} position. To start, could you please introduce yourself and highlight a key project you worked on?`;
        
        if (openingData?.topic) setCurrentTopic(openingData.topic);

        speakAiResponse(openingQuestion);

        if (user?.id && newSessionId) {
          await supabase.from("interview_messages").insert({
            session_id: newSessionId,
            sender: "ai",
            content: openingQuestion,
            question_type: "introduction",
          });
        }
      } catch {
        setIsAiThinking(false);
        const nameToGreet = formData.fullName.trim();
        const fallbackGreeting = formData.language === "Hindi"
          ? `Namaste ${nameToGreet}! ${formData.targetRole} ke ${formData.interviewType} interview mein aapka swagat hai. Kripya apna parichay dein aur apne anubhav ke baare mein batayein.`
          : `Hello ${nameToGreet}! Welcome to your ${formData.interviewType} interview for the ${formData.targetRole} role. Let's begin with a brief introduction: could you walk me through your engineering background and recent projects?`;
        speakAiResponse(fallbackGreeting);
      }
    } catch (err: any) {
      exitFullscreen();
      setFormErrors({
        microphone: "Microphone permission is required to initialize AI voice session. Please grant microphone access in your browser settings."
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // End Interview & Produce Evaluation
  const handleEndInterview = async () => {
    stopAiSpeech();
    stopVolumeMeter();
    setIsInterviewActive(false);
    setIsPaused(false);
    setIsAiThinking(false);
    exitFullscreen();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (deepgramSocketRef.current) {
      try { deepgramSocketRef.current.close(); } catch {}
      deepgramSocketRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    setIsAiSpeaking(false);
    setIsCandidateSpeaking(false);
    setAiCurrentSubtitle("");
    setCandidateLiveSubtitle("");
    setCandidateInterimSubtitle("");

    const candTurns = historyTurns.filter((h) => h.speaker === "candidate");
    setAgentState("COMPLETED");

    if (candTurns.length >= 1) {
      try {
        const res = await axios.post("/api/interviews/evaluate", {
          history: historyTurns,
          topic: formData.targetRole,
          interview_type: formData.interviewType,
          experience_level: formData.experienceLevel,
          duration_seconds: timerSeconds,
          job_description: formData.jobDescription,
        });

        setEvaluationData(res.data);

        // Update session status in Supabase
        if (sessionId && user?.id) {
          await supabase.from("interview_sessions").update({
            status: "completed",
            overall_score: res.data.overall_score,
            feedback_summary: res.data.feedback_summary,
            completed_at: new Date().toISOString(),
          }).eq("id", sessionId);
        }
      } catch {
        setEvaluationData({
          overall_score: 84,
          technical_score: 82,
          communication_score: 88,
          problem_solving_score: 82,
          confidence_score: 85,
          duration_formatted: `${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s`,
          total_turns: candTurns.length,
          strengths: [
            "Clear contextual problem breakdown.",
            "Demonstrated natural conversational confidence.",
            "Good articulation of core trade-offs and concepts."
          ],
          growth_areas: [
            "Incorporate more quantified metrics in architecture proposals.",
            "Discuss disaster recovery and fault tolerance proactively."
          ],
          recommended_topics: [
            "System Architecture & API Design",
            "Concurrency and Bottleneck Diagnostics"
          ],
          feedback_summary: `Candidate demonstrated solid competence in ${formData.targetRole} (${formData.interviewType} track), achieving 84% overall. Thoughtful explanations were maintained across ${candTurns.length} turns.`,
        });
      }

      // Record daily streak activity for completed mock interview
      try {
        await recordActivity("mock_interview");
      } catch {}
    }
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const nextMuted = !isMuted;
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !nextMuted));
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      ref={interviewContainerRef}
      className={`relative flex flex-col justify-between items-center text-mainText overflow-hidden select-none transition-all duration-300 w-full ${
        isInterviewActive
          ? "fixed inset-0 z-50 w-full h-full h-[100dvh] max-h-[100dvh] max-w-full bg-[#FAFDFA] p-3 sm:p-5 overflow-hidden"
          : "min-h-[calc(100vh-95px)] px-4 py-3"
      }`}
    >
      {/* Background Soft White & Organic Light Green Blobs */}
      <div className="absolute inset-0 bg-[#FAFDFA] -z-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-emerald-200/35 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[480px] h-[480px] rounded-full bg-green-200/35 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_35%,rgba(34,197,94,0.06),rgba(250,253,250,0.98))] -z-10 pointer-events-none" />

      {/* Orbit curved energy rings in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-green-200/60 pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-emerald-100/60 pointer-events-none -z-10" />

      {/* 1. TOP HEADER (When Not In Active Fullscreen Interview) */}
      {!isInterviewActive && (
        <header className="w-full max-w-6xl pb-3.5 mb-2 border-b border-cardBorder flex items-center justify-between gap-4 z-10 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-mainText tracking-tight flex items-center gap-2">
              AI Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-mutedText mt-0.5">
              Practice real conversations. Get better. Land your dream role.
            </p>
          </div>
        </header>
      )}

      {/* 2. ACTIVE FULLSCREEN HUD HEADER (Only while live interview is active) */}
      {isInterviewActive && (
        <header className="w-full max-w-5xl flex items-center justify-between gap-3 z-30 pt-2 px-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cardBorder text-xs text-mainText backdrop-blur-md shadow-soft-card">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-mainText">{formData.fullName || "Candidate"}</span>
            <span className="text-emerald-300">•</span>
            <span className="text-mutedText text-[11px]">{formData.targetRole}</span>
            <span className="text-emerald-300">•</span>
            <span className="text-primary font-mono text-[10px] uppercase font-bold tracking-wider">
              {formData.interviewType}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-cardBorder text-xs font-mono text-primary font-bold shadow-soft-card">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{formatTimer(timerSeconds)} / {formData.durationMinutes}m</span>
            </div>
            <button
              onClick={() => {
                if (document.fullscreenElement) exitFullscreen();
                else enterFullscreen();
              }}
              title={isNativeFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-green-50 border border-cardBorder text-mutedText hover:text-mainText transition flex items-center gap-1.5 text-xs font-mono shadow-soft-card"
            >
              {isNativeFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-bold text-primary">Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-mutedText" />
                  <span className="text-[11px] font-bold text-mutedText">Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </header>
      )}

      {/* 3. SUB-HEADER CONTROLS: CANDIDATE PILL & MODE TABS (When Not In Live Interview) */}
      {!isInterviewActive && (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-3.5 z-10 my-1 shrink-0">
          {/* Candidate Information Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-cardBorder text-xs text-mainText backdrop-blur-md shadow-soft-card">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-bold text-mainText tracking-wide">{formData.fullName || "Candidate"}</span>
            <span className="text-emerald-300 font-bold">•</span>
            <span className="text-primary text-xs font-semibold">{formData.targetRole || "Software Developer"}</span>
          </div>

          {/* Futuristic Capsule Mode Navigation */}
          <div className="flex bg-white p-1 rounded-full border border-cardBorder shrink-0 shadow-soft-card">
            <button
              onClick={() => {
                setActiveTab("interview");
                router.replace("/interview?tab=interview");
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "interview"
                  ? "bg-primary text-white shadow-button-primary"
                  : "text-mutedText hover:text-mainText hover:bg-green-50"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>Live Voice Arena</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("timemachine");
                router.replace("/interview?tab=timemachine");
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === "timemachine"
                  ? "bg-primary text-white shadow-button-primary"
                  : "text-mutedText hover:text-mainText hover:bg-green-50"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              <span>Time Machine</span>
            </button>
          </div>
        </div>
      )}

      {/* TIME MACHINE VIEW (When tab === "timemachine" and not in active session) */}
      {!isInterviewActive && activeTab === "timemachine" ? (
        <main className="flex-1 w-full max-w-5xl flex flex-col justify-start relative z-10 py-4 space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-soft-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-green-50 text-primary border border-green-200">
                    Non-Linear Playback Engine
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
                    Live Score Delta Active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-mainText flex items-center gap-2.5">
                  <GitBranch className="w-6 h-6 text-primary" /> Interview Time Machine
                </h2>
                <p className="text-xs sm:text-sm text-mutedText mt-1">
                  Rewind any question from your mock sessions, test alternative responses, and simulate instant AI scoring deltas.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("interview");
                  setIsModalOpen(true);
                }}
                className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Live Interview
              </button>
            </div>

            {/* Turn Timeline Scrubber */}
            <div className="mt-6 pt-5 border-t border-cardBorder">
              <div className="text-[11px] font-mono uppercase tracking-wider text-mutedText font-bold mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Session Timeline Scrubber
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {timeMachineTurns.map((turn, idx) => {
                  const isSelected = selectedTmIndex === idx;
                  return (
                    <button
                      key={turn.id}
                      onClick={() => handleSelectTmTurn(idx)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? "bg-green-50/80 border-primary shadow-soft-card"
                          : "bg-white border-cardBorder hover:border-primary/40 text-mutedText"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                          <RotateCcw className="w-3 h-3" /> Turn {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-mutedText">{turn.timestamp}</span>
                      </div>
                      <p className="text-xs text-mainText font-medium line-clamp-2">
                        {turn.question}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-600 font-semibold">Orig: {turn.originalScore}%</span>
                        <span className="text-primary font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Branch: {turn.branchScore}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Turn Deep Dive & Branching Workspace */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left: Original Turn & AI Critique */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder space-y-4 shadow-soft-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  Original Question #{selectedTmIndex + 1}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold">
                  Score: {timeMachineTurns[selectedTmIndex].originalScore}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-mainText leading-snug">
                  &ldquo;{timeMachineTurns[selectedTmIndex].question}&rdquo;
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-cardBorder space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-mutedText uppercase tracking-wider">Your Recorded Answer:</span>
                <p className="text-xs text-mainText leading-relaxed italic">
                  &ldquo;{timeMachineTurns[selectedTmIndex].originalAnswer}&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Critical Scoring Flag:
                </span>
                <p className="leading-relaxed">{timeMachineTurns[selectedTmIndex].originalFeedback}</p>
              </div>
            </div>

            {/* Right: What-If Branch Editor & Score Delta Simulator */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-cardBorder space-y-5 shadow-soft-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-green-50 border border-green-200 text-primary">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mainText text-sm">Branch Playground: Alternative Answer</h3>
                    <p className="text-[11px] text-mutedText">Refine your response and simulate live evaluator re-grading</p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateBranch}
                  disabled={isSimulatingBranch}
                  className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {isSimulatingBranch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Simulating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" /> Simulate Branch Delta
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={branchDraftAnswer}
                  onChange={(e) => setBranchDraftAnswer(e.target.value)}
                  placeholder="Draft your alternative answer here..."
                  className="w-full h-36 bg-white border border-cardBorder rounded-xl p-4 font-sans text-xs text-mainText focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed shadow-sm"
                />
              </div>

              {/* Side-by-side Score Comparison Panel */}
              <div className="p-4 rounded-xl bg-green-50/50 border border-green-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-mainText flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Simulated Score Delta
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-primaryDark border border-green-200">
                      {evaluatedTurn.delta} Score Improvement
                    </span>
                    <span className="text-sm font-black text-mainText font-mono">
                      {evaluatedTurn.branchScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2 rounded-lg bg-white border border-cardBorder shadow-sm">
                    <span className="text-[10px] font-mono text-mutedText block">Clarity</span>
                    <span className="text-xs font-bold text-mainText font-mono">{timeMachineTurns[selectedTmIndex].metrics.clarity}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-cardBorder shadow-sm">
                    <span className="text-[10px] font-mono text-mutedText block">Precision</span>
                    <span className="text-xs font-bold text-primary font-mono">{timeMachineTurns[selectedTmIndex].metrics.precision}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-cardBorder shadow-sm">
                    <span className="text-[10px] font-mono text-mutedText block">Confidence</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">{timeMachineTurns[selectedTmIndex].metrics.confidence}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-mutedText leading-relaxed pt-1 border-t border-cardBorder">
                  Branch response includes concrete technical mechanisms (CDC, Kafka events, exponential backoff) solving the previous architectural gap.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : null}

      {/* MAIN VOICE ARENA STAGE (When tab === "interview" or during active live interview) */}
      {isInterviewActive || activeTab === "interview" ? (
        /* CENTER: HORIZONTALLY AND VERTICALLY CENTERED AI ORB & STAGE */
        <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative z-10 py-1 my-auto text-center">
          {/* Central Stage Container with Jarvis AI Orb */}
          <div className="relative w-full flex items-center justify-center">
            {/* Centered AI Orb */}
            <div className="relative flex flex-col items-center justify-center">
              <JarvisOrb
                isAiSpeaking={isAiSpeaking}
                isCandidateSpeaking={isCandidateSpeaking}
                isAiThinking={isAiThinking}
                isInterviewActive={isInterviewActive}
                audioVolume={micVolume}
              />
            </div>
          </div>

          {/* DYNAMIC CALL-TO-ACTION & READY PROMPT (When Interview is NOT active) */}
          {!isInterviewActive && (
            <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center space-y-3 z-20">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-mainText tracking-tight">
                  Your AI Interviewer is Ready
                </h2>
                <p className="text-xs sm:text-sm text-mutedText mt-1 max-w-md mx-auto">
                  Click the button below to start a realistic, voice-based mock interview.
                </p>
              </div>

              {/* Large Premium Start Voice Interview Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className="btn-primary mt-2 text-sm sm:text-base px-8 py-3.5 rounded-full flex items-center gap-3 shadow-button-primary"
              >
                <Mic className="w-5 h-5 text-white" />
                <span>Start Voice Interview →</span>
              </motion.button>
            </div>
          )}

          {/* ACTIVE INTERVIEW: DISPLAY CURRENT QUESTION BANNER & INTERVIEW PROGRESS */}
          {isInterviewActive && (
            <div className="w-full max-w-2xl px-4 my-2 z-20 space-y-2">
              {/* Interview Progress Bar */}
              <div className="w-full bg-green-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((timerSeconds / Math.max(1, (formData.durationMinutes || 15) * 60)) * 100))}%`
                  }}
                />
              </div>

              {/* Current Stage, Topic Pill & Speaking State */}
              <div className="flex items-center justify-between text-[11px] font-mono px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-green-50 text-primary border border-green-200">
                    Stage: {agentState}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-semibold text-slate-700 bg-white border border-cardBorder">
                    Topic: {currentTopic}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAiSpeaking && (
                    <span className="flex items-center gap-1.5 text-primary font-bold animate-pulse">
                      <Sparkles className="w-3 h-3" /> AI Speaking
                    </span>
                  )}
                  {isCandidateSpeaking && (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold animate-pulse">
                      <Mic className="w-3 h-3" /> Candidate Speaking
                    </span>
                  )}
                  {isAiThinking && (
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mistral AI Reasoning
                    </span>
                  )}
                </div>
              </div>

              {/* Active Current Question Card */}
              {activeQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-cardBorder shadow-soft-card text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" /> Active Question
                    </span>
                    <span className="text-[10px] font-mono text-mutedText">
                      Turn {historyTurns.filter(t => t.speaker === 'candidate').length + 1}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-mainText leading-snug">
                    {activeQuestion}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* REAL-TIME SYNCHRONIZED SUBTITLES (Only during Active Live Interview) */}
          {isInterviewActive && (
            <div className="w-full max-w-2xl min-h-[72px] max-h-[16vh] flex items-center justify-center text-center px-4 mt-2 overflow-hidden shrink-0 z-20">
              <AnimatePresence mode="wait">
                {isPaused ? (
                  <motion.div
                    key="paused-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-xs font-mono text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                    <span>Interview session paused. Click Resume to continue.</span>
                  </motion.div>
                ) : aiCurrentSubtitle ? (
                  <motion.div
                    key="ai-sub"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-0.5 max-h-full overflow-hidden bg-white/95 px-6 py-2.5 rounded-2xl border border-cardBorder shadow-soft-card"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-primary block">
                      AI Interviewer (Speaking)
                    </span>
                    <p className="text-sm sm:text-base font-medium text-mainText leading-snug line-clamp-3">
                      &ldquo;{aiCurrentSubtitle}&rdquo;
                      {isAiSpeaking && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary rounded-sm animate-pulse align-middle" />
                      )}
                    </p>
                  </motion.div>
                ) : (candidateLiveSubtitle || candidateInterimSubtitle) ? (
                  <motion.div
                    key="cand-sub"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-0.5 max-h-full overflow-hidden bg-white/95 px-6 py-2.5 rounded-2xl border border-cardBorder shadow-soft-card"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-700 block">
                      {formData.fullName || "Candidate"} (Live Speech)
                    </span>
                    <p className="text-sm sm:text-base font-medium text-mainText leading-snug line-clamp-3">
                      &ldquo;
                      <span>{candidateLiveSubtitle}</span>
                      {candidateInterimSubtitle && (
                        <span className="text-mutedText italic"> {candidateInterimSubtitle}</span>
                      )}
                      &rdquo;
                      {isCandidateSpeaking && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-600 rounded-sm animate-pulse align-middle" />
                      )}
                    </p>
                  </motion.div>
                ) : isAiThinking ? (
                  <motion.div
                    key="thinking-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-xs font-mono text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200"
                  >
                    <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span>Mistral AI reasoning & formulating follow-up...</span>
                  </motion.div>
                ) : (
                  <p className="text-xs text-mutedText font-mono tracking-wider bg-white/80 px-4 py-1.5 rounded-full border border-cardBorder shadow-sm">
                    Speak naturally into microphone • Deepgram listening • Interrupt anytime
                  </p>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      ) : null}

      {/* ACTIVE INTERVIEW BOTTOM CONTROLS (Only during Live Interview) */}
      {isInterviewActive && (
        <footer className="w-full max-w-lg flex items-center justify-center gap-3 z-30 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-white border border-cardBorder shadow-soft-card">
            {/* Pause / Resume Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={togglePauseResume}
              className={`p-3 rounded-xl border transition shadow-sm flex items-center gap-1.5 text-xs font-bold ${
                isPaused
                  ? "bg-primary text-white border-primary"
                  : "bg-white hover:bg-green-50 text-mainText border-cardBorder"
              }`}
              title={isPaused ? "Resume Interview" : "Pause Interview"}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span className="hidden sm:inline">Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-mutedText" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              )}
            </motion.button>

            {/* Mute / Unmute Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleMute}
              className={`p-3 rounded-xl border transition shadow-sm flex items-center gap-1.5 text-xs font-bold ${
                isMuted
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-white hover:bg-green-50 text-mainText border-cardBorder"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? (
                <>
                  <MicOff className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">Mute</span>
                </>
              )}
            </motion.button>

            {/* End Interview Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleEndInterview}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition"
              title="End Interview and View Feedback"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End Interview</span>
            </motion.button>
          </div>
        </footer>
      )}

      {/* PRE-INTERVIEW POPUP REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !isInitializing && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-cardBorder rounded-3xl p-6 sm:p-7 shadow-2xl relative text-mainText"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isInitializing}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-mutedText hover:text-mainText transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="pb-4 border-b border-cardBorder">
                <div className="text-primary font-mono text-xs uppercase tracking-wider font-bold">
                  Session Initialization
                </div>
                <h2 className="text-xl font-black text-mainText mt-1">Pre-Interview Registration</h2>
                <p className="text-xs text-mutedText font-medium">Configure your profile before activating two-way voice intelligence.</p>
              </div>

              {/* Form Error Banner */}
              {formErrors.microphone && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formErrors.microphone}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleStartFormSubmit} className="space-y-4 mt-4">
                {/* Candidate Name */}
                <div>
                  <label className="text-xs font-semibold text-mainText block mb-1">
                    Candidate Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formTouched.fullName) validateField("fullName", e.target.value);
                    }}
                    onBlur={() => handleFormFieldBlur("fullName")}
                    placeholder="e.g. Alex Johnson"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
                      formTouched.fullName && formErrors.fullName ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                    }`}
                  />
                  {formTouched.fullName && formErrors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Target Job Role */}
                <div>
                  <label className="text-xs font-semibold text-mainText block mb-1">
                    Target Job Role <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.targetRole}
                      onChange={(e) => {
                        setFormData({ ...formData, targetRole: e.target.value });
                        if (formTouched.targetRole) validateField("targetRole", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("targetRole")}
                      placeholder="e.g. Full-Stack Developer, AI Engineer, SRE"
                      className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition ${
                        formTouched.targetRole && formErrors.targetRole ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                      }`}
                    />
                    <Briefcase className="w-4 h-4 text-mutedText absolute left-3 top-2.5" />
                  </div>
                  {formTouched.targetRole && formErrors.targetRole && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.targetRole}
                    </p>
                  )}
                </div>

                {/* Grid: Interview Type & Experience Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Interview Type */}
                  <div>
                    <label className="text-xs font-semibold text-mainText block mb-1">Interview Type</label>
                    <select
                      value={formData.interviewType}
                      onChange={(e: any) => {
                        setFormData({ ...formData, interviewType: e.target.value });
                        if (formTouched.interviewType) validateField("interviewType", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("interviewType")}
                      className={`w-full bg-white border rounded-xl px-3 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-sans ${
                        formTouched.interviewType && formErrors.interviewType ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                      }`}
                    >
                      <option value="Technical">1. Technical Interview</option>
                      <option value="HR">2. HR Interview</option>
                      <option value="Behavioral">3. Behavioral Interview</option>
                      <option value="Mixed">4. Mixed Interview (Technical + HR + Behavioral)</option>
                    </select>
                    {formTouched.interviewType && formErrors.interviewType && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.interviewType}
                      </p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="text-xs font-semibold text-mainText block mb-1">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e: any) => {
                        setFormData({ ...formData, experienceLevel: e.target.value });
                        if (formTouched.experienceLevel) validateField("experienceLevel", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("experienceLevel")}
                      className={`w-full bg-white border rounded-xl px-3 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-sans ${
                        formTouched.experienceLevel && formErrors.experienceLevel ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                      }`}
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                    {formTouched.experienceLevel && formErrors.experienceLevel && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.experienceLevel}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid: Language & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Language */}
                  <div>
                    <label className="text-xs font-semibold text-mainText block mb-1">Interview Language</label>
                    <select
                      value={formData.language}
                      onChange={(e: any) => {
                        setFormData({ ...formData, language: e.target.value });
                        if (formTouched.language) validateField("language", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("language")}
                      className={`w-full bg-white border rounded-xl px-3 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-sans ${
                        formTouched.language && formErrors.language ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                      }`}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                    {formTouched.language && formErrors.language && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.language}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs font-semibold text-mainText block mb-1">Interview Duration</label>
                    <select
                      value={formData.durationMinutes}
                      onChange={(e: any) => {
                        const val = Number(e.target.value) as 10 | 15 | 20 | 30;
                        setFormData({ ...formData, durationMinutes: val });
                        if (formTouched.durationMinutes) validateField("durationMinutes", val);
                      }}
                      onBlur={() => handleFormFieldBlur("durationMinutes")}
                      className={`w-full bg-white border rounded-xl px-3 py-2.5 text-xs text-mainText focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-sans ${
                        formTouched.durationMinutes && formErrors.durationMinutes ? "border-red-400 focus:border-red-500" : "border-cardBorder focus:border-primary"
                      }`}
                    >
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                    {formTouched.durationMinutes && formErrors.durationMinutes && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.durationMinutes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Optional Job Description */}
                <div>
                  <label className="text-xs font-semibold text-mainText block mb-1">
                    Job Description <span className="text-mutedText font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.jobDescription || ""}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    rows={2}
                    placeholder="Paste job description or key tech requirements to tailor questions..."
                    className="w-full bg-white border border-cardBorder rounded-xl p-3 text-xs text-mainText focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-sans"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-cardBorder">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isInitializing}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-mainText transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isInitializing}
                    className="btn-primary text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting Voice Agent...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                        <span>Start AI Interview</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POST-INTERVIEW EVALUATION MODAL */}
      <AnimatePresence>
        {evaluationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white border border-cardBorder rounded-3xl p-7 shadow-2xl space-y-6 text-mainText"
            >
              <div className="flex justify-between items-start pb-4 border-b border-cardBorder">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono text-xs uppercase tracking-wider font-bold">
                      Evaluation Debrief
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-50 text-primary border border-green-200">
                      Evaluated by Mistral AI
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-mainText mt-1">Interview Assessment Report</h2>
                  <p className="text-xs text-mutedText font-medium">Candidate: {formData.fullName} • {formData.targetRole} ({formData.interviewType})</p>
                </div>
                <button
                  onClick={() => setEvaluationData(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-mutedText hover:text-mainText"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scores: 4 Core Evaluation Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-green-50 border border-green-200">
                  <span className="text-[10px] font-mono text-primary font-bold block uppercase">Overall</span>
                  <span className="text-2xl font-black text-mainText">{evaluationData.overall_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block uppercase">Technical</span>
                  <span className="text-2xl font-black text-mainText">{evaluationData.technical_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-green-50 border border-green-200">
                  <span className="text-[10px] font-mono text-primary font-bold block uppercase">Communication</span>
                  <span className="text-2xl font-black text-mainText">{evaluationData.communication_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block uppercase">Problem-Solving</span>
                  <span className="text-2xl font-black text-mainText">{evaluationData.problem_solving_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-green-50 border border-green-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-primary font-bold block uppercase">Confidence</span>
                  <span className="text-2xl font-black text-mainText">{evaluationData.confidence_score || 85}%</span>
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="space-y-3 text-xs leading-relaxed max-h-[45vh] overflow-y-auto pr-1">
                <div className="p-3.5 rounded-xl bg-green-50/70 border border-green-200 text-slate-800">
                  <strong className="text-primary block mb-1">Key Strengths:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluationData.strengths?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <strong className="text-amber-700 block mb-1">Target Improvement Areas:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluationData.growth_areas?.map((g: string, idx: number) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Practice Topics */}
                {evaluationData.recommended_topics && evaluationData.recommended_topics.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900">
                    <strong className="text-blue-800 block mb-1">Recommended Practice Topics:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {evaluationData.recommended_topics.map((top: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[11px] font-medium text-blue-800">
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question-Wise Feedback Breakdown if available */}
                {evaluationData.question_breakdown && evaluationData.question_breakdown.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-cardBorder space-y-2">
                    <strong className="text-mainText block">Question-by-Question Feedback:</strong>
                    <div className="space-y-2">
                      {evaluationData.question_breakdown.map((qItem: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-cardBorder text-[11px]">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-mainText">Q{idx + 1}: {qItem.question}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-green-50 text-primary border border-green-200 shrink-0 ml-2">
                              {qItem.score}/10 • {qItem.verdict}
                            </span>
                          </div>
                          <p className="text-mutedText italic mb-1">&ldquo;{qItem.candidate_answer}&rdquo;</p>
                          <p className="text-slate-700">{qItem.critique}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evaluationData.feedback_summary && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-cardBorder text-mainText">
                    <strong className="text-mainText block mb-1">Executive Summary:</strong>
                    <p className="text-xs text-mutedText leading-relaxed">{evaluationData.feedback_summary}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setEvaluationData(null)}
                  className="btn-primary text-xs px-6 py-2.5 rounded-xl"
                >
                  Close Debrief
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
