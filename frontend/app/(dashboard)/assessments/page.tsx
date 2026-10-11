"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileCheck2, Clock, HelpCircle, ArrowRight, Play, CheckCircle2, ShieldCheck, Sparkles, BrainCircuit } from "lucide-react";

export interface AssessmentCategory {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  startingDifficulty: "Easy" | "Medium" | "Hard";
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: "cat-001",
    slug: "dsa",
    title: "Data Structures & Algorithms",
    category: "Algorithms",
    description: "Arrays, Hash Maps, Binary Trees, Dynamic Programming, & Time Complexity Analysis.",
    questionsCount: 10,
    durationMinutes: 20,
    startingDifficulty: "Medium"
  },
  {
    id: "cat-002",
    slug: "dbms",
    title: "Database Management & SQL",
    category: "Databases",
    description: "Relational Algebra, INNER/LEFT JOINs, Subqueries, Indexing, & ACID Transactions.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium"
  },
  {
    id: "cat-003",
    slug: "os-networks",
    title: "Operating Systems & Networking",
    category: "Core Computer Science",
    description: "Processes vs. Threads, Virtual Memory, TCP/IP Stack, HTTP/3, & Socket I/O.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium"
  }
];

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileCheck2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  BrainCircuit,
  Award,
  Layers,
  Zap,
  BarChart2
} from "lucide-react";

export interface AssessmentCategory {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  startingDifficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: "cat-001",
    slug: "dsa",
    title: "Data Structures & Algorithms",
    category: "Algorithms",
    description: "Arrays, Hash Maps, Binary Trees, Dynamic Programming, and asymptotic time/space complexity.",
    questionsCount: 10,
    durationMinutes: 20,
    startingDifficulty: "Medium",
    topics: ["Binary Trees", "Dynamic Programming", "Hash Tables", "Sorting"]
  },
  {
    id: "cat-002",
    slug: "dbms",
    title: "Database Management & SQL",
    category: "Databases",
    description: "Relational Algebra, Complex JOINs, Subqueries, B-Tree Indexing, and ACID Transaction Isolation.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium",
    topics: ["B-Tree Indexes", "ACID Semantics", "JOIN Optimization", "Normalization"]
  },
  {
    id: "cat-003",
    slug: "os-networks",
    title: "Operating Systems & Networking",
    category: "Core Computer Science",
    description: "Processes vs. Threads, Virtual Memory Paging, TCP 3-Way Handshake, HTTP/3, and Socket Multiplexing.",
    questionsCount: 10,
    durationMinutes: 15,
    startingDifficulty: "Medium",
    topics: ["Process Scheduling", "Virtual Memory", "TCP/IP Protocol", "Socket I/O"]
  }
];

export default function AssessmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const filteredCategories = selectedFilter === "All" 
    ? ASSESSMENT_CATEGORIES 
    : ASSESSMENT_CATEGORIES.filter(c => c.category.toLowerCase().includes(selectedFilter.toLowerCase()) || c.title.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#101426] to-blue-950/30 border border-purple-500/20 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Adaptive Question Engine • Anti-Cheat Proctoring Enabled</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-8 h-8 text-purple-400" /> Adaptive Technical Examinations
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time adaptive testing powered by item response calibration. Questions dynamically scale in difficulty as you answer correctly, reflecting tier-1 company hiring rubrics.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-[#0B0F1B]/90 border border-purple-500/20 flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Verified Credentials</p>
              <p className="text-slate-400 text-[11px]">Instant score breakdown & percentile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {["All", "Algorithms", "Databases", "Core Computer Science"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === filter
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="group relative p-6 rounded-2xl bg-[#121829] border border-[#1E273E] hover:border-purple-500/40 hover:bg-[#151D33] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {cat.category}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-amber-500/30 text-amber-400">
                  {cat.startingDifficulty}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {cat.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  {cat.description}
                </p>
              </div>

              {/* Topic Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#0D1220] border border-slate-800 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> {cat.questionsCount} Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {cat.durationMinutes} Minutes
                </span>
              </div>

              <Link
                href={`/assessments/exam?slug=${cat.slug}`}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20 group-hover:scale-[1.01]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Adaptive Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

