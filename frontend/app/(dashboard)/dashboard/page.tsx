"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bot, Code, Bug, AlertTriangle, GitFork, ArrowUpRight, Trophy, Flame } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Python FastAPI Backend
    axios.get("http://localhost:8000/api/dashboard/demo-candidate")
      .then((res) => setData(res.data))
      .catch(() => {
        // Fallback default structure if backend server starting up
        setData({
          welcome_message: "Welcome to PrepPilot AI",
          interviews_completed: 8,
          coding_problems_solved: 24,
          assessments_completed: 5,
          average_interview_score: 84.5,
          practice_streak: 7,
          readiness_index: 82,
          recent_activity: [
            { title: "Bug Arena - Python KeyError", score: "100%", date: "Today" },
            { title: "Mock Interview - Full Stack Role", score: "88%", date: "Yesterday" }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-mutedText">Loading Student Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{data.welcome_message}</h1>
          <p className="text-mutedText text-sm mt-1">Track your progress across technical interviews, bugs, and incident simulations.</p>
        </div>
        <div className="flex items-center gap-3 bg-cardBg border border-gray-800 px-4 py-2 rounded-xl">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div>
            <div className="text-xs text-mutedText">Streak</div>
            <div className="text-sm font-bold text-white">{data.practice_streak} Days</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid md:grid-cols-4 gap-5">
        <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
          <p className="text-xs text-mutedText font-medium">Interviews Completed</p>
          <h2 className="text-3xl font-extrabold text-white mt-2">{data.interviews_completed}</h2>
          <span className="text-xs text-success flex items-center gap-1 mt-2">Avg. Score {data.average_interview_score}%</span>
        </div>
        <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
          <p className="text-xs text-mutedText font-medium">Coding Problems Solved</p>
          <h2 className="text-3xl font-extrabold text-white mt-2">{data.coding_problems_solved}</h2>
          <span className="text-xs text-blue-400 mt-2 block">Python & JavaScript</span>
        </div>
        <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
          <p className="text-xs text-mutedText font-medium">Assessments Done</p>
          <h2 className="text-3xl font-extrabold text-white mt-2">{data.assessments_completed}</h2>
          <span className="text-xs text-purple-400 mt-2 block">DSA, DBMS, OS</span>
        </div>
        <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
          <p className="text-xs text-mutedText font-medium">Placement Readiness Index</p>
          <h2 className="text-3xl font-extrabold text-blue-400 mt-2">{data.readiness_index}%</h2>
          <span className="text-xs text-mutedText mt-2 block">Strong Candidate Match</span>
        </div>
      </div>

      {/* Quick Launchers for Core Modules */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Core Modules Quick Launch</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Link href="/coding?tab=bugs" className="p-5 bg-cardBg rounded-2xl border border-gray-800 hover:border-blue-500/50 transition group flex items-start justify-between">
            <div>
              <Bug className="w-7 h-7 text-blue-400 mb-3" />
              <h3 className="font-bold text-white group-hover:text-blue-400 transition">Bug Investigation</h3>
              <p className="text-xs text-mutedText mt-1">Debug broken production code & stack traces.</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-mutedText group-hover:text-white" />
          </Link>

          <Link href="/roadmap?tab=graph" className="p-5 bg-cardBg rounded-2xl border border-gray-800 hover:border-green-500/50 transition group flex items-start justify-between">
            <div>
              <GitFork className="w-7 h-7 text-green-400 mb-3" />
              <h3 className="font-bold text-white group-hover:text-green-400 transition">Skill Knowledge Graph</h3>
              <p className="text-xs text-mutedText mt-1">Visual prerequisite tree & mastery status.</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-mutedText group-hover:text-white" />
          </Link>

          <Link href="/interview?tab=timemachine" className="p-5 bg-cardBg rounded-2xl border border-gray-800 hover:border-purple-500/50 transition group flex items-start justify-between">
            <div>
              <Bot className="w-7 h-7 text-purple-400 mb-3" />
              <h3 className="font-bold text-white group-hover:text-purple-400 transition">Interview Time Machine</h3>
              <p className="text-xs text-mutedText mt-1">Review & retry previous interview attempts.</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-mutedText group-hover:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
