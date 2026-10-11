"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Bot, 
  Code, 
  FileCheck2, 
  Map, 
  BarChart3, 
  User, 
  Sparkles,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Flame,
  Zap
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "PREPARATION ARENAS",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Mock Interview", href: "/interview", icon: Bot, badge: "Voice AI", badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      { name: "Coding Arena", href: "/coding", icon: Code, badge: "Sandbox", badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      { name: "Crisis Simulator", href: "/crisis", icon: ShieldAlert, badge: "P0 SRE", badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    ],
  },
  {
    title: "LEARNING & EVALUATION",
    items: [
      { name: "Technical Assessments", href: "/assessments", icon: FileCheck2 },
      { name: "Learning Roadmap", href: "/roadmap", icon: Map },
    ],
  },
  {
    title: "INSIGHTS & ACCOUNT",
    items: [
      { name: "Analytics & Trends", href: "/analytics", icon: BarChart3 },
      { name: "Profile & Settings", href: "/profile", icon: User },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const displayName = profile?.full_name || (user?.email ? user.email.split("@")[0] : "");
  
  // Calculate dynamic initials from the logged in user's name
  const initials = displayName
    ? displayName
        .trim()
        .split(/\s+/)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <aside className="w-72 bg-[#0C101D] border-r border-[#1C253B] flex flex-col min-h-screen shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1C253B] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0C101D]" title="AI Engine Online" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight group-hover:text-blue-400 transition-colors">
                PrepPilot AI
              </span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-blue-400/90 uppercase flex items-center gap-1">
              <span>Placement Engine</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-[#141B2E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                    }`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      isActive 
                        ? "bg-white/20 text-white border-white/30" 
                        : item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile Mini Card & Logout */}
      <div className="p-4 border-t border-[#1C253B] bg-[#0A0D18]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141B2D] border border-[#1E273E] hover:border-blue-500/40 transition-colors">
          <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              {initials || <User className="w-4 h-4 text-white" />}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {displayName || "Candidate"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[11px] text-emerald-400 font-medium truncate">Candidate Active</p>
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out of PrepPilot"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

