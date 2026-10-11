"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Bot, 
  Code, 
  Bug, 
  ArrowUpRight, 
  Trophy, 
  Flame, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  ShieldAlert,
  Activity,
  GitFork
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_URL } from "@/lib/api";

export default function DashboardPage() {
  const { streak } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Python FastAPI Backend
    const apiUrl = BACKEND_URL;
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
        <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#16A34A] animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-[#6B7280]">Loading PrepPilot Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-[#1F2937]">
      {/* 1. HERO COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F0FDF4] via-white to-[#DCFCE7]/40 border border-[#D1FAE5] p-8 shadow-soft-card">
        {/* Soft Organic Green Blobs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-green-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D1FAE5] text-[#16A34A] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>AI Placement Preparation Platform • Target Role: Full-Stack Engineer</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
              {data.welcome_message || "Welcome to PrepPilot AI"}
            </h1>
            <p className="text-[#4B5563] text-sm md:text-base leading-relaxed font-normal">
              Your autonomous interview copilot. Accelerate readiness across agentic voice interviews, sandboxed coding challenges, live bug triage, and simulated production outages.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold shadow-button-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-white" />
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/coding?tab=bugs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F0FDF4] text-[#166534] text-sm font-semibold border border-[#D1FAE5] hover:border-[#86EFAC] transition-all"
              >
                <Bug className="w-4 h-4 text-[#22C55E]" />
                <span>Open Bug Arena</span>
              </Link>
            </div>
          </div>

          {/* Placement Readiness Arc Card */}
          <div className="shrink-0 flex items-center gap-5 p-5 rounded-2xl bg-white border border-[#D1FAE5] shadow-soft-card">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-[#DCFCE7] flex items-center justify-center relative">
                <div 
                  className="w-24 h-24 rounded-full border-4 border-transparent border-t-[#22C55E] border-r-[#16A34A] absolute animate-spin"
                  style={{ animationDuration: '6s' }}
                />
                <div className="text-center">
                  <span className="text-2xl font-black text-[#1F2937]">{data.readiness_index}%</span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#6B7280] font-bold">Index</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                <ShieldCheck className="w-4 h-4" />
                <span>Placement Tier: Tier 1</span>
              </div>
              <p className="text-xs text-[#1F2937] font-semibold">85th percentile candidate</p>
              <p className="text-[11px] text-[#6B7280]">Targeting FAANG & High-Growth Unicorns</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KEY METRICS ROW (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/30 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Interviews Completed</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{data.interviews_completed}</span>
            <span className="text-xs text-[#16A34A] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +2 this week
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#F0FDF4]">
            <span>Average Score</span>
            <span className="text-[#16A34A] font-bold">{data.average_interview_score}%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/30 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Coding Solved</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{data.coding_problems_solved}</span>
            <span className="text-xs text-[#16A34A] font-semibold">18 DSA / 6 Bug Fixes</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#F0FDF4]">
            <span>Sandbox Engines</span>
            <span className="text-[#1F2937] font-semibold">Python • JS • C++</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/30 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Assessments Passed</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{data.assessments_completed}</span>
            <span className="text-xs text-[#16A34A] font-semibold">100% Pass Rate</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#F0FDF4]">
            <span>Topics Tested</span>
            <span className="text-[#1F2937] font-semibold">DSA, DBMS, Networks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/30 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Daily Practice Streak</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] group-hover:scale-110 transition-transform">
              <Flame className={`w-4 h-4 fill-[#F59E0B] text-[#F59E0B] ${(streak?.current_streak ?? 0) > 0 ? "scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "opacity-60"}`} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#D97706] tracking-tight">
              {(streak?.current_streak ?? 0) === 1 ? "1 Day" : `${streak?.current_streak ?? 0} Days`}
            </span>
            <span className="text-xs text-[#B45309] font-semibold">
              {(streak?.current_streak ?? 0) > 0 ? "Active Streak" : "Start Today"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#F0FDF4]">
            <span>All-time Best</span>
            <span className="text-[#D97706] font-bold">
              {streak?.longest_streak ? `${streak.longest_streak} ${streak.longest_streak === 1 ? "Day" : "Days"}` : "0 Days"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CORE INNOVATIONS QUICK LAUNCH ARENAS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#22C55E]" /> Core Innovation Arenas
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Explore the 5 agentic modules built for placement readiness</p>
          </div>
          <span className="text-xs font-medium text-[#9CA3AF] hidden sm:inline">Click to launch sandbox</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Bug Investigation Arena */}
          <Link 
            href="/coding?tab=bugs" 
            className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/40 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#22C55E] group-hover:scale-110 group-hover:bg-[#DCFCE7] transition-all">
                  <Bug className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#D1FAE5] text-[#16A34A]">
                  Innovation 1
                </span>
              </div>
              <h3 className="font-bold text-[#1F2937] text-base group-hover:text-[#16A34A] transition-colors">
                Bug Investigation Arena
              </h3>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                Triage realistic production bugs, diagnose stack traces, and write patches executed in OneCompiler sandbox.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0FDF4] flex items-center justify-between text-xs font-semibold text-[#16A34A] group-hover:text-[#22C55E]">
              <span>Start Debugging</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Card 2: Skill Knowledge Graph */}
          <Link 
            href="/roadmap" 
            className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/40 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#22C55E] group-hover:scale-110 group-hover:bg-[#DCFCE7] transition-all">
                  <GitFork className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#D1FAE5] text-[#16A34A]">
                  Innovation 2
                </span>
              </div>
              <h3 className="font-bold text-[#1F2937] text-base group-hover:text-[#16A34A] transition-colors">
                Skill Knowledge Graph
              </h3>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                Visual prerequisite dependency tree powered by React Flow with mastery tracking across 12 core placement competencies.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0FDF4] flex items-center justify-between text-xs font-semibold text-[#16A34A] group-hover:text-[#22C55E]">
              <span>View Prerequisite Tree</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          {/* Card 3: Crisis Outage Simulator */}
          <Link 
            href="/crisis" 
            className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4]/40 transition-all duration-300 hover:-translate-y-1 shadow-soft-card hover:shadow-soft-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] group-hover:scale-110 group-hover:bg-[#FEF3C7] transition-all">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
                  Innovation 5
                </span>
              </div>
              <h3 className="font-bold text-[#1F2937] text-base group-hover:text-[#D97706] transition-colors">
                Technical Crisis Simulator
              </h3>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                Triage live P0 production outages as an SRE/Tech Lead, manage connection saturation, and track live telemetry.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0FDF4] flex items-center justify-between text-xs font-semibold text-[#D97706] group-hover:text-[#B45309]">
              <span>Resolve Outage</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY & AI RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#D1FAE5] shadow-soft-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1F2937] text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#22C55E]" /> Recent Activity & Evidence Log
            </h3>
            <Link href="/analytics" className="text-xs text-[#16A34A] hover:text-[#22C55E] font-semibold flex items-center gap-1">
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recent_activity?.map((act: any, idx: number) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFDFA] border border-[#D1FAE5] hover:border-[#86EFAC] hover:bg-[#F0FDF4] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                    {act.type === "bug" ? <Bug className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1F2937] truncate">{act.title}</p>
                    <p className="text-[11px] text-[#6B7280]">{act.date} • {act.status || "Completed"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#DCFCE7] border border-[#86EFAC] text-[#166534]">
                    {act.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Daily Path */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-[#F0FDF4] to-white border border-[#D1FAE5] shadow-soft-card space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#16A34A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#1F2937] text-sm">AI Agentic Daily Preparation</h3>
              <p className="text-[11px] text-[#6B7280]">Recommended focus for maximum placement impact</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-[#D1FAE5] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2937]">
                <span className="flex items-center gap-1.5 text-[#16A34A]">
                  <Target className="w-3.5 h-3.5 text-[#22C55E]" /> 1. System Design Follow-Up
                </span>
                <span className="text-[10px] text-[#D97706] font-bold bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded">High Priority</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Review database caching strategies. Previous mock interview noted missing redis cluster explanations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D1FAE5] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2937]">
                <span className="flex items-center gap-1.5 text-[#16A34A]">
                  <Code className="w-3.5 h-3.5 text-[#22C55E]" /> 2. Complete 2 Dynamic Programming Tasks
                </span>
                <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded">In Progress</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Solve Coin Change and Longest Increasing Subsequence to solidify state-transition formulation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D1FAE5] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2937]">
                <span className="flex items-center gap-1.5 text-[#16A34A]">
                  <Clock className="w-3.5 h-3.5 text-[#22C55E]" /> 3. Retry Turn in Interview Time Machine
                </span>
                <span className="text-[10px] text-[#4B5563] font-bold bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded">Branching</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Fork the CAP Theorem behavioral question to achieve a higher system architecture score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
