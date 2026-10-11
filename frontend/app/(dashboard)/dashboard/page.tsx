"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Bot, 
  Code, 
  Bug, 
  AlertTriangle, 
  GitFork, 
  ArrowUpRight, 
  Trophy, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  ShieldAlert,
  History,
  Activity,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { streak } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Python FastAPI Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    axios.get(`${apiUrl}/api/dashboard/demo-candidate`)
      .then((res) => setData(res.data))
      .catch(() => {
        // Fallback default structure if backend server starting up
        setData({
          welcome_message: "Welcome back, Candidate!",
          candidate_name: "Candidate",
          target_role: "Full-Stack Software Engineer",
          interviews_completed: 8,
          coding_problems_solved: 24,
          assessments_completed: 5,
          average_interview_score: 84.5,
          readiness_index: 82,
          recent_activity: [
            { title: "Bug Arena — Python KeyError In Auth Flow", score: "100%", date: "Today", type: "bug", status: "Resolved" },
            { title: "Mock Interview — Full Stack System Design", score: "88%", date: "Yesterday", type: "interview", status: "Evaluated" },
            { title: "Crisis Triage — P0 Database Pool Saturation", score: "94%", date: "2 days ago", type: "crisis", status: "Mitigated" },
            { title: "Technical Exam — DBMS & Relational SQL", score: "90%", date: "3 days ago", type: "assessment", status: "Passed" }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading PrepPilot Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/50 via-[#0F162A] to-purple-950/40 border border-blue-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Placement Preparation Platform • Target Role: Full-Stack Engineer</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {data.welcome_message || "Welcome to PrepPilot AI"}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Your autonomous interview copilot. Accelerate readiness across agentic voice interviews, sandboxed coding challenges, live bug triage, and simulated production outages.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/coding?tab=bugs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141B2D] hover:bg-[#1C253B] text-slate-200 hover:text-white text-sm font-semibold border border-slate-700/60 transition-all hover:border-blue-500/40"
              >
                <Bug className="w-4 h-4 text-emerald-400" />
                <span>Open Bug Arena</span>
              </Link>
            </div>
          </div>

          {/* Placement Readiness Arc Card */}
          <div className="shrink-0 flex items-center gap-5 p-5 rounded-2xl bg-[#0B0F1B]/90 border border-blue-500/20 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center relative">
                <div 
                  className="w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500 absolute animate-spin"
                  style={{ animationDuration: '6s' }}
                />
                <div className="text-center">
                  <span className="text-2xl font-black text-white">{data.readiness_index}%</span>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Index</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Placement Tier: Tier 1</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">85th percentile candidate</p>
              <p className="text-[11px] text-slate-400">Targeting FAANG & High-Growth Unicorns</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KEY METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews Completed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.interviews_completed}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +2 this week
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Average Score</span>
            <span className="text-emerald-400 font-bold">{data.average_interview_score}%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coding Solved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.coding_problems_solved}</span>
            <span className="text-xs text-blue-400 font-semibold">18 DSA / 6 Bug Fixes</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Sandbox Engines</span>
            <span className="text-slate-200 font-semibold">Python • JS • C++</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessments Passed</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.assessments_completed}</span>
            <span className="text-xs text-purple-400 font-semibold">100% Pass Rate</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Topics Tested</span>
            <span className="text-slate-200 font-semibold">DSA, DBMS, Networks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Practice Streak</span>
            <div className={`w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform ${streak?.current_streak > 0 ? "animate-pulse" : ""}`}>
              <Flame className={`w-4 h-4 fill-amber-400 text-amber-400 ${(streak?.current_streak ?? 0) > 0 ? "scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "opacity-60"}`} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {(streak?.current_streak ?? 0) === 1 ? "1 Day" : `${streak?.current_streak ?? 0} Days`}
            </span>
            <span className="text-xs text-amber-300/80 font-semibold">
              {(streak?.current_streak ?? 0) > 0 ? "Active Streak" : "Start Today"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>All-time Best</span>
            <span className="text-amber-400 font-bold">
              {streak?.longest_streak ? `${streak.longest_streak} ${streak.longest_streak === 1 ? "Day" : "Days"}` : "0 Days"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CORE INNOVATIONS QUICK LAUNCH ARENAS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" /> Core Innovation Arenas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore the 5 agentic modules built for placement readiness</p>
          </div>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Click to launch sandbox</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Bug Investigation Arena */}
          <Link 
            href="/coding?tab=bugs" 
            className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-blue-500/50 hover:bg-[#151D33] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                  <Bug className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  Innovation 1
                </span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                Bug Investigation Arena
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Triage realistic production bugs, diagnose stack traces, and write patches executed in OneCompiler sandbox.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>Start Debugging</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Card 2: Skill Knowledge Graph */}
          <Link 
            href="/roadmap" 
            className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-emerald-500/50 hover:bg-[#151D33] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <GitFork className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Innovation 2
                </span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                Skill Knowledge Graph
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Visual prerequisite dependency tree powered by React Flow with mastery tracking across 12 core placement competencies.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>View Prerequisite Tree</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Card 3: Crisis Outage Simulator */}
          <Link 
            href="/crisis" 
            className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-amber-500/50 hover:bg-[#151D33] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Innovation 5
                </span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                Technical Crisis Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Triage live P0 production outages as an SRE/Tech Lead, manage connection saturation, and track live telemetry.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Resolve Outage</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY & AI RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121829] border border-[#1E273E] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Recent Activity & Evidence Log
            </h3>
            <Link href="/analytics" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recent_activity?.map((act: any, idx: number) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F1424] border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    {act.type === "bug" ? <Bug className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.date} • {act.status || "Completed"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {act.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Daily Path */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-[#131B30] to-[#0E1424] border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Agentic Daily Preparation</h3>
              <p className="text-[11px] text-slate-400">Recommended focus for maximum placement impact</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-[#0B0F1B]/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Target className="w-3.5 h-3.5" /> 1. System Design Follow-Up
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">High Priority</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Review database caching strategies. Previous mock interview noted missing redis cluster explanations.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F1B]/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Code className="w-3.5 h-3.5" /> 2. Complete 2 Dynamic Programming Tasks
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">In Progress</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Solve Coin Change and Longest Increasing Subsequence to solidify state-transition formulation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F1B]/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Clock className="w-3.5 h-3.5" /> 3. Retry Turn in Interview Time Machine
                </span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">Branching</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fork the CAP Theorem behavioral question to achieve a higher system architecture score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

