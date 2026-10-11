"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { 
  BarChart3, 
  BrainCircuit, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"performance" | "mistakes">(
    tabParam === "mistakes" ? "mistakes" : "performance"
  );

  useEffect(() => {
    if (tabParam === "mistakes") {
      setActiveTab("mistakes");
    } else if (tabParam === "performance") {
      setActiveTab("performance");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "performance" | "mistakes") => {
    setActiveTab(tab);
    router.replace(`/analytics?tab=${tab}`);
  };

  // Performance data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [mistakeData, setMistakeData] = useState<any>(null);

  useEffect(() => {
    // Fetch live dashboard & analytics data
    axios.get("http://localhost:8000/api/dashboard/demo-candidate")
      .then((res) => setDashboardData(res.data))
      .catch(() => {
        setDashboardData({
          interviews_completed: 8,
          coding_problems_solved: 24,
          assessments_completed: 5,
          average_interview_score: 84.5,
          readiness_index: 82,
        });
      });

    // Fetch mistake pattern data
    axios.get("http://localhost:8000/api/innovations/patterns/demo-candidate")
      .then((res) => setMistakeData(res.data))
      .catch(() => {
        setMistakeData({
          total_mistakes: 14,
          recurring_patterns: [
            {
              id: "pat-01",
              category: "Data Structures & Algorithms",
              skill_slug: "dsa-hashmap",
              pattern_name: "Off-by-one errors & Outer Loop Boundary Inefficiencies",
              frequency: 4,
              severity: "High",
              status: "active"
            },
            {
              id: "pat-02",
              category: "SQL & Databases",
              skill_slug: "sql-joins",
              pattern_name: "Missing Aggregation Groupings in Complex JOINs",
              frequency: 3,
              severity: "Medium",
              status: "improving"
            }
          ]
        });
      });
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-blue-400" /> Performance Analytics & Telemetry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track technical interview score trajectory, coding accuracy, and AI-identified recurring mistake patterns.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0D1220] p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => handleTabChange("performance")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "performance"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Performance Trends
          </button>
          <button
            onClick={() => handleTabChange("mistakes")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "mistakes"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> Mistake Intelligence
          </button>
        </div>
      </div>

      {/* TAB 1: PERFORMANCE ANALYTICS */}
      {activeTab === "performance" && (
        <div className="space-y-8">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-[#121829] p-5 rounded-2xl border border-[#1E273E] hover:border-blue-500/40 transition-all duration-300 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness Index</span>
              <h2 className="text-3xl font-extrabold text-blue-400 mt-2">
                {dashboardData?.readiness_index ?? 82}%
              </h2>
              <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> Top 15% Percentile
              </span>
            </div>

            <div className="bg-[#121829] p-5 rounded-2xl border border-[#1E273E] hover:border-emerald-500/40 transition-all duration-300 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Interview Score</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {dashboardData?.average_interview_score ?? 84.5}%
              </h2>
              <span className="text-xs text-slate-400 mt-2 block font-medium">8 Sessions Evaluated</span>
            </div>

            <div className="bg-[#121829] p-5 rounded-2xl border border-[#1E273E] hover:border-purple-500/40 transition-all duration-300 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problems Solved</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {dashboardData?.coding_problems_solved ?? 24}
              </h2>
              <span className="text-xs text-blue-400 mt-2 block font-medium">DSA & Bug Arena</span>
            </div>

            <div className="bg-[#121829] p-5 rounded-2xl border border-[#1E273E] hover:border-emerald-500/40 transition-all duration-300 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pattern Resolution</span>
              <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">68%</h2>
              <span className="text-xs text-slate-400 mt-2 block font-medium">+14% vs last week</span>
            </div>
          </div>

          {/* Graphical Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] h-80 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interview Score Trajectory (Last 6 Sessions)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scored by LangGraph multi-agent evaluator</p>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  +27% Gain
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 h-48 pt-6 border-b border-slate-800">
                {[65, 70, 75, 82, 88, 92].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-mono font-bold text-blue-300 group-hover:scale-110 transition-transform">
                      {val}%
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-700/40 via-blue-600 to-indigo-500 rounded-t-xl transition-all duration-300 group-hover:brightness-125 shadow-md shadow-blue-500/10"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">S{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] h-80 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Coding Accuracy & Bug Fix Rate (Weekly)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated test harness passing rate</p>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  95% Peak
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 h-48 pt-6 border-b border-slate-800">
                {[50, 60, 68, 85, 90, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-mono font-bold text-purple-300 group-hover:scale-110 transition-transform">
                      {val}%
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-purple-700/40 via-purple-600 to-pink-500 rounded-t-xl transition-all duration-300 group-hover:brightness-125 shadow-md shadow-purple-500/10"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">W{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISTAKE INTELLIGENCE */}
      {activeTab === "mistakes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] shadow-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Identified Mistakes</p>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {mistakeData?.total_mistakes ?? 14}
              </h2>
              <p className="text-xs text-slate-500 mt-2">Tracked across all test harnesses</p>
            </div>
            <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] shadow-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Recurring Patterns</p>
              <h2 className="text-3xl font-extrabold text-purple-400 mt-2">
                {mistakeData?.recurring_patterns?.length ?? 2}
              </h2>
              <p className="text-xs text-purple-400/80 mt-2">Targeted remediation available</p>
            </div>
            <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] shadow-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pattern Resolution Rate</p>
              <h2 className="text-3xl font-extrabold text-emerald-400 mt-2">68%</h2>
              <p className="text-xs text-emerald-400/80 mt-2">Above industry benchmark</p>
            </div>
          </div>

          <div className="bg-[#121829] p-6 rounded-2xl border border-[#1E273E] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Detected Recurring Mistake Patterns
              </h2>
              <span className="text-xs text-slate-400">Core Innovation 4: Mistake Telemetry</span>
            </div>

            <div className="space-y-3">
              {mistakeData?.recurring_patterns?.map((pat: any) => (
                <div 
                  key={pat.id} 
                  className="p-5 rounded-2xl bg-[#0F1424] border border-slate-800 hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {pat.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Frequency: {pat.frequency}x</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
                        pat.severity === 'High' ? 'text-red-400 bg-red-500/10 border border-red-500/30' : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                      }`}>
                        {pat.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{pat.pattern_name}</h3>
                  </div>

                  <button 
                    onClick={() => router.push("/coding?tab=bugs")}
                    className="bg-[#141B2D] hover:bg-blue-600 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 hover:border-blue-500 text-slate-200 transition-all shrink-0 flex items-center gap-2 shadow-sm"
                  >
                    <span>Start Targeted Fix</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

