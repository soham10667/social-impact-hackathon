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
    <div className="space-y-6">
      {/* Header Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-400" /> Analytics & Intelligence
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Track technical interview score trends, coding accuracy, and AI-identified recurring mistake patterns.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-secondaryBg p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => handleTabChange("performance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "performance"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Performance Analytics
          </button>
          <button
            onClick={() => handleTabChange("mistakes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "mistakes"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> Mistake Intelligence
          </button>
        </div>
      </div>

      {/* TAB 1: PERFORMANCE ANALYTICS */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Readiness Index</span>
              <h2 className="text-2xl font-extrabold text-blue-400 mt-1">
                {dashboardData?.readiness_index ?? 82}%
              </h2>
              <span className="text-[11px] text-green-400 flex items-center gap-1 mt-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> Top 15% Percentile
              </span>
            </div>

            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Avg Interview Score</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {dashboardData?.average_interview_score ?? 84.5}%
              </h2>
              <span className="text-[11px] text-mutedText mt-1 block">8 Sessions Evaluated</span>
            </div>

            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Problems Solved</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {dashboardData?.coding_problems_solved ?? 24}
              </h2>
              <span className="text-[11px] text-blue-400 mt-1 block">DSA & Python Arena</span>
            </div>

            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Pattern Resolution</span>
              <h2 className="text-2xl font-extrabold text-green-400 mt-1">68%</h2>
              <span className="text-[11px] text-mutedText mt-1 block">Improving week over week</span>
            </div>
          </div>

          {/* Graphical Trends */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 h-72 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-mutedText uppercase tracking-wider">
                  Technical Interview Score Trends (Last 6 Sessions)
                </h3>
                <span className="text-xs font-semibold text-blue-400">+27% Improvement</span>
              </div>
              <div className="flex items-end justify-between gap-3 h-44 pt-4 border-b border-gray-800">
                {[65, 70, 75, 82, 88, 92].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-blue-300">{val}%</span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-t-lg transition-all hover:brightness-125"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-mutedText font-mono">S{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 h-72 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-mutedText uppercase tracking-wider">
                  Coding Accuracy & Debug Fix Rate
                </h3>
                <span className="text-xs font-semibold text-purple-400">95% Peak</span>
              </div>
              <div className="flex items-end justify-between gap-3 h-44 pt-4 border-b border-gray-800">
                {[50, 60, 68, 85, 90, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-purple-300">{val}%</span>
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600/30 to-purple-500 rounded-t-lg transition-all hover:brightness-125"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-mutedText font-mono">W{i + 1}</span>
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
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <p className="text-xs text-mutedText">Total Identified Mistakes</p>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                {mistakeData?.total_mistakes ?? 14}
              </h2>
            </div>
            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <p className="text-xs text-mutedText">Active Recurring Patterns</p>
              <h2 className="text-3xl font-extrabold text-purple-400 mt-2">
                {mistakeData?.recurring_patterns?.length ?? 2}
              </h2>
            </div>
            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <p className="text-xs text-mutedText">Pattern Resolution Rate</p>
              <h2 className="text-3xl font-extrabold text-green-400 mt-2">68%</h2>
            </div>
          </div>

          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Detected Recurring Mistake Patterns
            </h2>
            <div className="space-y-4">
              {mistakeData?.recurring_patterns?.map((pat: any) => (
                <div key={pat.id} className="p-4 rounded-xl bg-secondaryBg border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {pat.category}
                      </span>
                      <span className="text-xs text-mutedText font-mono">Frequency: {pat.frequency}x</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        pat.severity === 'High' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {pat.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{pat.pattern_name}</h3>
                  </div>
                  <button 
                    onClick={() => router.push("/coding?tab=bugs")}
                    className="bg-cardBg hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-700 text-white transition shrink-0 flex items-center gap-1.5"
                  >
                    Start Targeted Practice <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
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
