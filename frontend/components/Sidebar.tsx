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
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "PREPARATION ARENAS",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Mock Interview", href: "/interview", icon: Bot },
      { name: "Coding Arena", href: "/coding", icon: Code },
      { name: "Crisis Simulator", href: "/crisis", icon: ShieldAlert },
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
    <aside className="w-72 bg-white border-r border-[#D1FAE5] flex flex-col min-h-screen shrink-0 select-none z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#D1FAE5] flex items-center justify-between bg-white">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white shadow-md shadow-green-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-white" title="AI Engine Online" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[#1F2937] tracking-tight group-hover:text-[#22C55E] transition-colors">
                PrepPilot AI
              </span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-[#16A34A] uppercase flex items-center gap-1">
              <span>Placement Engine</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto bg-white">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
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
                      ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25 font-semibold"
                      : "text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F0FDF4]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-[#6B7280] group-hover:text-[#22C55E]"
                    }`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile Mini Card & Logout */}
      <div className="p-4 border-t border-[#D1FAE5] bg-[#F0FDF4]/50">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] shadow-xs transition-colors">
          <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center font-bold text-[#15803D] text-xs shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {initials || <User className="w-4 h-4 text-[#15803D]" />}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#22C55E] transition-colors">
                {displayName || "Candidate"}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate">Active Student</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out of PrepPilot"
            className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
