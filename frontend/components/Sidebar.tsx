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
  LogOut
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Mock Interview", href: "/interview", icon: Bot },
  { name: "Coding Arena", href: "/coding", icon: Code },
  { name: "Technical Assessments", href: "/assessments", icon: FileCheck2 },
  { name: "Learning Roadmap", href: "/roadmap", icon: Map },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile & Settings", href: "/profile", icon: User },
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
    <div className="w-64 bg-secondaryBg border-r border-gray-800 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800 flex items-center gap-3">
        <div className="bg-primaryAccent p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-none">PrepPilot AI</h1>
          <span className="text-xs text-mutedText">Placement Engine</span>
        </div>
      </div>

      {/* 7 Main Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          // Highlight active sidebar item, including sub-tabs/child paths
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primaryAccent text-white shadow-md shadow-blue-500/20"
                  : "text-mutedText hover:bg-cardBg hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Mini Card & Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-cardBg">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-secondaryAccent flex items-center justify-center font-bold text-white text-xs shrink-0">
              {initials || <User className="w-4 h-4 text-white" />}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{displayName || "Candidate"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
