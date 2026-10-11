"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileCheck2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  BrainCircuit,
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
    <div className="space-y-8 animate-fadeIn text-[#1F2937]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F0FDF4] via-white to-[#DCFCE7]/40 border border-[#D1FAE5] p-8 shadow-soft-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D1FAE5] text-[#16A34A] text-xs font-semibold shadow-xs">
              <BrainCircuit className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Adaptive Question Engine • Anti-Cheat Proctoring Enabled</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-8 h-8 text-[#16A34A]" /> Adaptive Technical Examinations
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Real-time adaptive testing powered by item response calibration. Questions dynamically scale in difficulty as you answer correctly, reflecting tier-1 company hiring rubrics.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-white border border-[#D1FAE5] flex items-center gap-4 text-xs font-medium text-[#1F2937] shadow-soft-card">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#1F2937] text-sm">Verified Credentials</p>
              <p className="text-[#6B7280] text-[11px]">Instant score breakdown & percentile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D1FAE5] pb-3">
        {["All", "Algorithms", "Databases", "Core Computer Science"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === filter
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/20"
                : "text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F0FDF4]"
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
            className="group relative p-6 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1 shadow-soft-card flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#D1FAE5]">
                  {cat.category}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
                  {cat.startingDifficulty}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#1F2937] group-hover:text-[#16A34A] transition-colors">
                  {cat.title}
                </h2>
                <p className="text-xs text-[#6B7280] leading-relaxed mt-2">
                  {cat.description}
                </p>
              </div>

              {/* Topic Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAFDFA] border border-[#D1FAE5] text-[#4B5563]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0FDF4] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-mono">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#16A34A]" /> {cat.questionsCount} Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" /> {cat.durationMinutes} Minutes
                </span>
              </div>

              <Link
                href={`/assessments/exam?slug=${cat.slug}`}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-button-primary group-hover:scale-[1.01]"
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
