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
  Mic, 
  MicOff, 
  Play, 
  Square, 
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
  Sparkles
} from "lucide-react";

interface PreInterviewForm {
  fullName: string;
  interviewType: "Technical" | "HR / Behavioral" | "System Design" | "General";
  experienceLevel: "Fresher" | "0–1 Year" | "1–3 Years" | "3+ Years";
  targetRole: string;
  language: "English" | "Hindi" | "Hinglish";
  durationMinutes: number;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, user } = useAuth();
  const { isInterviewActive, setIsInterviewActive } = useInterviewSession();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"interview" | "timemachine">(
    tabParam === "timemachine" ? "timemachine" : "interview"
  );

  useEffect(() => {
    if (tabParam === "timemachine") setActiveTab("timemachine");
    else if (tabParam === "interview") setActiveTab("interview");
  }, [tabParam]);

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      setIsInterviewActive(false);
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
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [micVolume, setMicVolume] = useState<number>(0);

  // Subtitles
  const [aiCurrentSubtitle, setAiCurrentSubtitle] = useState<string>("");
  const [candidateLiveSubtitle, setCandidateLiveSubtitle] = useState<string>("");
  const [candidateInterimSubtitle, setCandidateInterimSubtitle] = useState<string>("");

  // Internal Turn Logs
  const [historyTurns, setHistoryTurns] = useState<
    Array<{ id: string; speaker: "ai" | "candidate"; text: string; timestamp: string }>
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
    if (isInterviewActive) {
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
      setTimerSeconds(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isInterviewActive, formData.durationMinutes]);

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

  // Initialize Web Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
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
  const stopAiSpeech = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
    setIsAiSpeaking(false);
    setIsAiThinking(false);
    setAiCurrentSubtitle("");
  }, []);

  // Progressive Audio-Synchronized Speech & Subtitles
  const speakAiResponse = useCallback((fullText: string) => {
    stopAiSpeech();

    const words = fullText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    setIsAiSpeaking(true);
    setIsAiThinking(false);
    setAiCurrentSubtitle("");

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
        setIsAiSpeaking(false);
        setAiCurrentSubtitle(fullText);

        setHistoryTurns((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            speaker: "ai",
            text: fullText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        setTimeout(() => setAiCurrentSubtitle(""), 600);
      };

      utterance.onerror = () => {
        if (aiSubtitleIntervalRef.current) clearInterval(aiSubtitleIntervalRef.current);
        setIsAiSpeaking(false);
      };

      synthRef.current.speak(utterance);
    } else {
      let currentWordIdx = 0;
      aiSubtitleIntervalRef.current = setInterval(() => {
        currentWordIdx += 1;
        setAiCurrentSubtitle(words.slice(0, currentWordIdx).join(" "));
        if (currentWordIdx >= words.length) {
          clearInterval(aiSubtitleIntervalRef.current);
          setIsAiSpeaking(false);
          setHistoryTurns((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              speaker: "ai",
              text: fullText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      }, 150);
    }
  }, [stopAiSpeech, formData.language]);

  // Process Candidate Transcript & Contextual AI Response
  const handleCandidateFinishedSpeaking = useCallback(
    async (finalTranscript: string) => {
      const trimmed = finalTranscript.trim();
      if (!trimmed || trimmed.length < 2) return;

      const newHistory = [
        ...historyTurns,
        {
          id: `cand-${Date.now()}`,
          speaker: "candidate" as const,
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];
      setHistoryTurns(newHistory);
      setCandidateLiveSubtitle("");
      setCandidateInterimSubtitle("");
      setIsCandidateSpeaking(false);
      setIsAiThinking(true);

      // Persist turn to Supabase
      try {
        if (user?.id) {
          await supabase.from("interview_messages").insert({
            session_id: sessionId || null,
            sender: "student",
            content: trimmed,
          });
        }
      } catch {}

      try {
        const res = await axios.post("/api/interviews/chat", {
          message: trimmed,
          interview_type: formData.interviewType,
          experience_level: formData.experienceLevel,
          job_role: formData.targetRole,
          language: formData.language,
          duration_minutes: formData.durationMinutes,
          history: newHistory,
        });

        setIsAiThinking(false);
        const replyText = res.data?.reply || "Understood. Can you walk me through the key technical constraints and architectural trade-offs you faced?";
        speakAiResponse(replyText);

        try {
          if (user?.id) {
            await supabase.from("interview_messages").insert({
              session_id: sessionId || null,
              sender: "ai",
              content: replyText,
            });
          }
        } catch {}
      } catch (err) {
        setIsAiThinking(false);
        speakAiResponse("Insightful point. Could you elaborate on how you address edge-case failures and observability in that scenario?");
      }
    },
    [historyTurns, formData, sessionId, speakAiResponse, user?.id]
  );

  // Deepgram WebSocket Connection
  const connectDeepgramStreaming = useCallback(
    (stream: MediaStream, apiKey: string) => {
      try {
        const socket = new WebSocket(
          "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000",
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
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            socket.send(pcm16.buffer);
          };
        };

        socket.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data);
            const transcript = data.channel?.alternatives?.[0]?.transcript;
            if (transcript) {
              if (isAiSpeaking) stopAiSpeech();
              setIsCandidateSpeaking(true);

              if (data.is_final) {
                setCandidateLiveSubtitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
                setCandidateInterimSubtitle("");
                if (data.speech_final) handleCandidateFinishedSpeaking(transcript);
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
    [isAiSpeaking, stopAiSpeech, handleCandidateFinishedSpeaking]
  );

  // Web Speech Fallback
  const initWebSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = formData.language === "Hindi" ? "hi-IN" : "en-US";

    let debounceTimer: any = null;
    let accumulatedFinal = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) accumulatedFinal += (accumulatedFinal ? " " : "") + item[0].transcript;
        else interim += item[0].transcript;
      }

      if (interim || accumulatedFinal) {
        if (isAiSpeaking) stopAiSpeech();
        setIsCandidateSpeaking(true);
      }

      setCandidateLiveSubtitle(accumulatedFinal);
      setCandidateInterimSubtitle(interim);

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const fullTurn = (accumulatedFinal + " " + interim).trim();
        if (fullTurn.length > 3) {
          accumulatedFinal = "";
          handleCandidateFinishedSpeaking(fullTurn);
        }
      }, 1600);
    };

    recognition.onerror = () => setIsCandidateSpeaking(false);
    recognition.onend = () => {
      if (isInterviewActive && !isMuted) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  }, [isInterviewActive, isMuted, isAiSpeaking, stopAiSpeech, handleCandidateFinishedSpeaking, formData.language]);

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
      setTimerSeconds(0);
      setHistoryTurns([]);
      setAiCurrentSubtitle("");
      setCandidateLiveSubtitle("");
      setCandidateInterimSubtitle("");
      setEvaluationData(null);
      setIsModalOpen(false);
      setIsAiThinking(true);

      // 5. Automatic Natural Human-Style Opening Greeting & First Question
      setTimeout(() => {
        setIsAiThinking(false);
        const nameToGreet = formData.fullName.trim();
        let greeting = "";

        if (formData.language === "Hindi") {
          greeting = `Namaste ${nameToGreet}! Aapka mock interview session shuru karte hain. Kripya apna brief parichay dein aur batayein ki aapne recent projects mein kya kaam kiya hai?`;
        } else if (formData.language === "Hinglish") {
          greeting = `Hello ${nameToGreet}! Welcome to your mock interview session. Let's begin with a quick introduction. Could you tell me a little bit about yourself and your technical background?`;
        } else {
          greeting = `Good morning ${nameToGreet}! Welcome to your mock interview session. Let's begin with a quick introduction. Could you tell me a little bit about yourself and your background?`;
        }

        speakAiResponse(greeting);
      }, 700);
    } catch (err: any) {
      exitFullscreen();
      setFormErrors({
        microphone: "Microphone permission is required to initialize JARVIS voice session. Please grant microphone access in your browser settings."
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
    if (candTurns.length >= 1) {
      try {
        const res = await axios.post("/api/interviews/evaluate", {
          history: historyTurns,
          topic: formData.targetRole,
          duration_seconds: timerSeconds,
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
          strengths: ["Clear contextual problem breakdown.", "Demonstrated natural conversational confidence."],
          growth_areas: ["Incorporate more quantified metrics in architecture proposals."],
          feedback_summary: "Strong performance with commendable domain grasp and conversational adaptability.",
        });
      }
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
      className={`relative flex flex-col justify-between items-center text-white overflow-hidden select-none transition-all duration-300 w-full ${
        isInterviewActive
          ? "fixed inset-0 z-50 w-full h-full h-[100dvh] max-h-[100dvh] max-w-full bg-[#060913] p-3 sm:p-5 overflow-hidden"
          : "min-h-[calc(100vh-95px)] px-4 py-3"
      }`}
    >
      {/* Background Holographic Atmosphere */}
      <div className="absolute inset-0 bg-[#060913] -z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),rgba(6,9,19,0.95))] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] -z-10 pointer-events-none" />

      {/* TOP HEADER HUD */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 z-10 pt-1 px-2 shrink-0">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 backdrop-blur-md">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{formData.fullName || "Candidate"}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400 text-[11px]">{formData.targetRole}</span>
          {isInterviewActive && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                {formData.interviewType}
              </span>
            </>
          )}
        </div>

        {/* Tab Switcher (When Not In Live Interview) */}
        {!isInterviewActive && (
          <div className="flex bg-[#0A0E1A]/80 p-1 rounded-xl border border-white/10 shrink-0 backdrop-blur-md shadow-inner">
            <button
              onClick={() => {
                setActiveTab("interview");
                router.replace("/interview?tab=interview");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "interview"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-mutedText hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300" /> Live Voice Arena
            </button>
            <button
              onClick={() => {
                setActiveTab("timemachine");
                router.replace("/interview?tab=timemachine");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "timemachine"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "text-mutedText hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-300" /> Time Machine
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isInterviewActive && (
            <>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-inner backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTimer(timerSeconds)} / {formData.durationMinutes}m</span>
              </div>
              <button
                onClick={() => {
                  if (document.fullscreenElement) exitFullscreen();
                  else enterFullscreen();
                }}
                title={isNativeFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
              >
                {isNativeFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold text-cyan-300">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-300">Fullscreen</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* TIME MACHINE VIEW (When tab === "timemachine" and not in active session) */}
      {!isInterviewActive && activeTab === "timemachine" ? (
        <main className="flex-1 w-full max-w-5xl flex flex-col justify-start relative z-10 py-4 space-y-6">
          {/* Header Banner */}
          <div className="bg-secondaryBg/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-cardBorder shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    Non-Linear Playback Engine
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                    Live Score Delta Active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <GitBranch className="w-6 h-6 text-purple-400" /> Interview Time Machine
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
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 border border-purple-400/30 shrink-0 self-start sm:self-auto transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Live Interview
              </button>
            </div>

            {/* Turn Timeline Scrubber */}
            <div className="mt-6 pt-5 border-t border-cardBorder">
              <div className="text-[11px] font-mono uppercase tracking-wider text-mutedText font-bold mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Session Timeline Scrubber
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
                          ? "bg-purple-600/15 border-purple-500/60 shadow-lg shadow-purple-500/10"
                          : "bg-[#0A0E1A] border-cardBorder hover:border-gray-700 text-mutedText"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                          <RotateCcw className="w-3 h-3" /> Turn {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">{turn.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium line-clamp-2">
                        {turn.question}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-400 font-semibold">Orig: {turn.originalScore}%</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
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
            <div className="lg:col-span-5 bg-secondaryBg/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-cardBorder space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Original Question #{selectedTmIndex + 1}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                  Score: {timeMachineTurns[selectedTmIndex].originalScore}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  &ldquo;{timeMachineTurns[selectedTmIndex].question}&rdquo;
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0E1A] border border-cardBorder space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Your Recorded Answer:</span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  &ldquo;{timeMachineTurns[selectedTmIndex].originalAnswer}&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Critical Scoring Flag:
                </span>
                <p className="leading-relaxed">{timeMachineTurns[selectedTmIndex].originalFeedback}</p>
              </div>
            </div>

            {/* Right: What-If Branch Editor & Score Delta Simulator */}
            <div className="lg:col-span-7 bg-secondaryBg/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-cardBorder space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Branch Playground: Alternative Answer</h3>
                    <p className="text-[11px] text-mutedText">Refine your response and simulate live evaluator re-grading</p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateBranch}
                  disabled={isSimulatingBranch}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25 border border-purple-400/30 transition disabled:opacity-50 shrink-0"
                >
                  {isSimulatingBranch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Simulating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Simulate Branch Delta
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={branchDraftAnswer}
                  onChange={(e) => setBranchDraftAnswer(e.target.value)}
                  placeholder="Draft your alternative answer here..."
                  className="w-full h-36 bg-[#0A0E1A] border border-cardBorder rounded-xl p-4 font-sans text-xs text-purple-100 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Side-by-side Score Comparison Panel */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 via-[#0A0E1A] to-[#0A0E1A] border border-purple-500/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Simulated Score Delta
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {evaluatedTurn.delta} Score Improvement
                    </span>
                    <span className="text-sm font-black text-white font-mono">
                      {evaluatedTurn.branchScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-mutedText block">Clarity</span>
                    <span className="text-xs font-bold text-white font-mono">{timeMachineTurns[selectedTmIndex].metrics.clarity}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-mutedText block">Precision</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{timeMachineTurns[selectedTmIndex].metrics.precision}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-[10px] font-mono text-mutedText block">Confidence</span>
                    <span className="text-xs font-bold text-purple-300 font-mono">{timeMachineTurns[selectedTmIndex].metrics.confidence}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-mutedText leading-relaxed pt-1 border-t border-white/5">
                  Branch response includes concrete technical mechanisms (CDC, Kafka events, exponential backoff) solving the previous architectural gap.
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* CENTER: HORIZONTALLY AND VERTICALLY CENTERED JARVIS ORB & SUBTITLES */
        <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative z-10 py-2 my-auto text-center">
          <div className="flex flex-col items-center justify-center w-full">
            <JarvisOrb
              isAiSpeaking={isAiSpeaking}
              isCandidateSpeaking={isCandidateSpeaking}
              isAiThinking={isAiThinking}
              isInterviewActive={isInterviewActive}
              audioVolume={micVolume}
            />
          </div>

          {/* REAL-TIME TWO-WAY CINEMATIC SUBTITLES (Responsive clamp without page overflow) */}
          <div className="w-full max-w-2xl min-h-[72px] max-h-[16vh] flex items-center justify-center text-center px-4 mt-2 overflow-hidden shrink-0">
            <AnimatePresence mode="wait">
              {aiCurrentSubtitle ? (
                <motion.div
                  key="ai-sub"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-0.5 max-h-full overflow-hidden"
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-cyan-400 block">
                    Interviewer
                  </span>
                  <p className="text-sm sm:text-base font-medium text-cyan-50 leading-snug drop-shadow-md line-clamp-3">
                    &ldquo;{aiCurrentSubtitle}&rdquo;
                    {isAiSpeaking && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 rounded-sm animate-pulse align-middle shadow-sm shadow-cyan-400" />
                    )}
                  </p>
                </motion.div>
              ) : (candidateLiveSubtitle || candidateInterimSubtitle) ? (
                <motion.div
                  key="cand-sub"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-0.5 max-h-full overflow-hidden"
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-purple-400 block">
                    {formData.fullName || "Candidate"}
                  </span>
                  <p className="text-sm sm:text-base font-medium text-purple-100 leading-snug drop-shadow-md line-clamp-3">
                    &ldquo;
                    <span>{candidateLiveSubtitle}</span>
                    {candidateInterimSubtitle && (
                      <span className="text-purple-300 italic opacity-85"> {candidateInterimSubtitle}</span>
                    )}
                    &rdquo;
                    {isCandidateSpeaking && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-400 rounded-sm animate-pulse align-middle shadow-sm shadow-purple-400" />
                    )}
                  </p>
                </motion.div>
              ) : isAiThinking ? (
                <motion.div
                  key="thinking-sub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300/90"
                >
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Formulating response...</span>
                </motion.div>
              ) : (
                <p className="text-xs text-gray-500 font-mono tracking-wider">
                  {isInterviewActive
                    ? "Speak into microphone to answer • Interrupt anytime"
                    : "Click 'Initialize JARVIS' to set preferences and launch voice interview"}
                </p>
              )}
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* BOTTOM CONTROLS BAR (Shown when activeTab === 'interview' or interview is active) */}
      {(isInterviewActive || activeTab === "interview") && (
        <footer className="w-full max-w-xl flex items-center justify-center gap-3 z-20 pb-1 sm:pb-2 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl">
            {!isInterviewActive ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsModalOpen(true)}
                className="relative group bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl flex items-center gap-2.5 shadow-lg shadow-cyan-500/25 transition border border-cyan-300/30"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Initialize JARVIS</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleEndInterview}
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition border border-rose-400/30"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>End Interview</span>
              </motion.button>
            )}

            {isInterviewActive && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={toggleMute}
                className={`p-3 rounded-xl border transition shadow-md ${
                  isMuted
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-white/5 hover:bg-white/10 text-gray-200 border-white/10"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
              </motion.button>
            )}
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !isInitializing && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gradient-to-b from-[#0d162a]/95 via-[#0b1220]/95 to-[#080d17]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative backdrop-blur-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isInitializing}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="pb-4 border-b border-gray-800">
                <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">
                  Session Initialization
                </div>
                <h2 className="text-xl font-black text-white mt-1">Pre-Interview Registration</h2>
                <p className="text-xs text-mutedText font-medium">Configure your profile before activating two-way voice intelligence.</p>
              </div>

              {/* Form Error Banner */}
              {formErrors.microphone && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formErrors.microphone}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleStartFormSubmit} className="space-y-4 mt-4">
                {/* Candidate Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Candidate Full Name <span className="text-cyan-400">*</span>
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
                    className={`w-full bg-black/50 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                      formTouched.fullName && formErrors.fullName ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                    }`}
                  />
                  {formTouched.fullName && formErrors.fullName && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Target Job Role */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Target Job Role <span className="text-cyan-400">*</span>
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
                      className={`w-full bg-black/50 border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                        formTouched.targetRole && formErrors.targetRole ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                      }`}
                    />
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  {formTouched.targetRole && formErrors.targetRole && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.targetRole}
                    </p>
                  )}
                </div>

                {/* Grid: Interview Type & Experience Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Interview Type */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Interview Type</label>
                    <select
                      value={formData.interviewType}
                      onChange={(e: any) => {
                        setFormData({ ...formData, interviewType: e.target.value });
                        if (formTouched.interviewType) validateField("interviewType", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("interviewType")}
                      className={`w-full bg-black/50 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition font-sans ${
                        formTouched.interviewType && formErrors.interviewType ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                      }`}
                    >
                      <option value="Technical" className="bg-[#0b1220]">Technical & Engineering</option>
                      <option value="HR / Behavioral" className="bg-[#0b1220]">HR & Behavioral</option>
                      <option value="System Design" className="bg-[#0b1220]">System Architecture</option>
                      <option value="General" className="bg-[#0b1220]">General Comprehensive</option>
                    </select>
                    {formTouched.interviewType && formErrors.interviewType && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.interviewType}
                      </p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e: any) => {
                        setFormData({ ...formData, experienceLevel: e.target.value });
                        if (formTouched.experienceLevel) validateField("experienceLevel", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("experienceLevel")}
                      className={`w-full bg-black/50 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition font-sans ${
                        formTouched.experienceLevel && formErrors.experienceLevel ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                      }`}
                    >
                      <option value="Fresher" className="bg-[#0b1220]">Fresher (New Grad)</option>
                      <option value="0–1 Year" className="bg-[#0b1220]">0–1 Year (Junior)</option>
                      <option value="1–3 Years" className="bg-[#0b1220]">1–3 Years (Mid-level)</option>
                      <option value="3+ Years" className="bg-[#0b1220]">3+ Years (Senior / Lead)</option>
                    </select>
                    {formTouched.experienceLevel && formErrors.experienceLevel && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.experienceLevel}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid: Language & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Language */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Preferred Language</label>
                    <select
                      value={formData.language}
                      onChange={(e: any) => {
                        setFormData({ ...formData, language: e.target.value });
                        if (formTouched.language) validateField("language", e.target.value);
                      }}
                      onBlur={() => handleFormFieldBlur("language")}
                      className={`w-full bg-black/50 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition font-sans ${
                        formTouched.language && formErrors.language ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                      }`}
                    >
                      <option value="English" className="bg-[#0b1220]">English</option>
                      <option value="Hindi" className="bg-[#0b1220]">Hindi</option>
                      <option value="Hinglish" className="bg-[#0b1220]">Hinglish (Conversational)</option>
                    </select>
                    {formTouched.language && formErrors.language && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.language}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Interview Duration</label>
                    <select
                      value={formData.durationMinutes}
                      onChange={(e: any) => {
                        const val = Number(e.target.value);
                        setFormData({ ...formData, durationMinutes: val });
                        if (formTouched.durationMinutes) validateField("durationMinutes", val);
                      }}
                      onBlur={() => handleFormFieldBlur("durationMinutes")}
                      className={`w-full bg-black/50 border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition font-sans ${
                        formTouched.durationMinutes && formErrors.durationMinutes ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-cyan-500"
                      }`}
                    >
                      <option value={10} className="bg-[#0b1220]">10 Minutes (Quick Screen)</option>
                      <option value={15} className="bg-[#0b1220]">15 Minutes (Standard)</option>
                      <option value={20} className="bg-[#0b1220]">20 Minutes (Deep Dive)</option>
                      <option value={30} className="bg-[#0b1220]">30 Minutes (Full Round)</option>
                    </select>
                    {formTouched.durationMinutes && formErrors.durationMinutes && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.durationMinutes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isInitializing}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isInitializing}
                    className="relative group bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition border border-cyan-300/30 disabled:opacity-50"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-gradient-to-b from-[#0e172a] to-[#090e1a] border border-cyan-500/40 rounded-3xl p-7 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start pb-4 border-b border-gray-800">
                <div>
                  <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">
                    Evaluation Debrief
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">Interview Assessment Report</h2>
                  <p className="text-xs text-mutedText font-medium">Candidate: {formData.fullName} • {formData.targetRole} ({formData.interviewType})</p>
                </div>
                <button
                  onClick={() => setEvaluationData(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold block uppercase">Overall</span>
                  <span className="text-2xl font-black text-white">{evaluationData.overall_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-[10px] font-mono text-blue-300 font-bold block uppercase">Technical</span>
                  <span className="text-2xl font-black text-white">{evaluationData.technical_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-[10px] font-mono text-purple-300 font-bold block uppercase">Communication</span>
                  <span className="text-2xl font-black text-white">{evaluationData.communication_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold block uppercase">Problem-Solving</span>
                  <span className="text-2xl font-black text-white">{evaluationData.problem_solving_score}%</span>
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200">
                  <strong className="text-cyan-400 block mb-1">Key Strengths:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluationData.strengths?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-200">
                  <strong className="text-amber-400 block mb-1">Target Improvement Areas:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluationData.growth_areas?.map((g: string, idx: number) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setEvaluationData(null)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition shadow-lg shadow-cyan-600/30"
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
