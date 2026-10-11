"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  Flame, 
  Search, 
  Bell, 
  Bot, 
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function TopNavbar() {
  const pathname = usePathname();
  const { user, profile, streak } = useAuth();
  const currentDays = streak?.current_streak ?? 0;
  const streakLabel = `${currentDays}-Day Streak`;

  // Get human friendly title based on route
  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard")) return { title: "Executive Dashboard", category: "Placement Command Center" };
    if (path.includes("/interview")) return { title: "Live Voice Arena", category: "AI Mock Interview" };
    if (path.includes("/coding")) return { title: "Interactive Coding Arena", category: "Sandboxed Compiler & Bug Triage" };
    if (path.includes("/crisis")) return { title: "Production Crisis Simulator", category: "SRE P0 Outage Resolution" };
    if (path.includes("/assessments")) return { title: "Technical Examinations", category: "Adaptive MCQ Assessment" };
    if (path.includes("/roadmap")) return { title: "Learning Roadmap & Skill Graph", category: "Competency Tree" };
    if (path.includes("/analytics")) return { title: "Performance Analytics", category: "Mistake Pattern Telemetry" };
    if (path.includes("/profile")) return { title: "Profile & Settings", category: "Candidate Preferences" };
    return { title: "Placement Portal", category: "PrepPilot AI" };
  };

  const pageInfo = getPageTitle(pathname);

  return (
    <header className="h-16 border-b border-[#1C253B] bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {pageInfo.category}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-medium">{pageInfo.title}</span>
          </div>
        </div>
      </div>

      {/* Right: Dynamic Streak and Actions */}
      <div className="flex items-center gap-3">
        {/* Practice Streak Badge */}
        <div 
          title={streak?.longest_streak ? `Best: ${streak.longest_streak} days` : "Complete an activity today to build your streak"}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold transition-all shadow-sm shadow-amber-500/5 hover:border-amber-500/40"
        >
          <Flame className={`w-4 h-4 fill-amber-400 text-amber-400 ${currentDays > 0 ? "animate-pulse scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "opacity-60"}`} />
          <span>{streakLabel}</span>
        </div>

        {/* Start Interview CTA button */}
        {pathname !== "/interview" && (
          <Link
            href="/interview"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 border border-blue-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Launch Mock Interview</span>
          </Link>
        )}
      </div>
    </header>
  );
}
