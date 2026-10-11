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

export default function AssessmentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" /> Adaptive AI Technical Examinations
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Real-time adaptive testing that adjusts question difficulty and topic selection based on your evaluated performance.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSESSMENT_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-cardBg p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {cat.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {cat.startingDifficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {cat.title}
              </h2>
              <p className="text-xs text-mutedText leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-mutedText font-mono">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> {cat.questionsCount} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {cat.durationMinutes} Mins
                </span>
              </div>

              <Link
                href={`/assessments/exam?slug=${cat.slug}`}
                className="w-full bg-primaryAccent hover:bg-blue-600 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Adaptive Assessment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
