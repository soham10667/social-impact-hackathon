"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Sparkles, 
  Bot, 
  Bug, 
  GitFork, 
  AlertTriangle, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  BarChart3, 
  Layers, 
  Code2, 
  BrainCircuit, 
  ChevronRight,
  Play,
  Check,
  Flame,
  Award
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"bugs" | "crisis" | "graph" | "timemachine" | "mistakes">("bugs");

  return (
    <div className="min-h-screen bg-[#080B14] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Main Header / Navigation */}
      <header className="border-b border-[#1C253B] bg-[#080B14]/85 backdrop-blur-xl sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block leading-none">PrepPilot AI</span>
            <span className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase">Placement Engine</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#innovations" className="hover:text-white transition-colors">5 Core Innovations</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#tech-stack" className="hover:text-white transition-colors">Architecture</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition">
            Sign In
          </Link>
          <Link 
            href="/register"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-20 max-w-7xl mx-auto text-center flex flex-col items-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Agentic Technical Assessment & Placement Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8 max-w-5xl">
          Prepare Smarter. Think Deeper.<br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Get Technical Placement Ready.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
          The ultimate technical interview ecosystem. Practice live coding in sandboxed containers, triage real production outages, detect recurring mistake patterns, and master software engineering concepts with agentic AI feedback.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-500/30 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Student Portal <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#innovations"
            className="bg-[#121829] border border-slate-800 hover:border-slate-700 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all hover:bg-slate-800/50"
          >
            Explore Interactive Demo
          </a>
        </div>

        {/* Hero Interactive App Window Mockup */}
        <div className="w-full max-w-5xl bg-[#0F1424] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-left relative group">
          {/* Top Bar */}
          <div className="bg-[#141B2D] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">preppilot-ai // crisis-simulator // incident-P0-842</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              Incident Active • Telemetry Syncing
            </div>
          </div>

          {/* Body Preview */}
          <div className="p-6 grid md:grid-cols-12 gap-6 bg-[#080B14]">
            <div className="md:col-span-7 space-y-4">
              <div className="bg-[#121829] p-5 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">P0 CRITICAL</span>
                  <span className="text-xs text-slate-400">PostgreSQL Pool Exhaustion</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Production Checkout API Returning HTTP 500</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High traffic spike causing database connection slots to max out at 100/100 connections. Customer checkout failure rate spiked to 34%.
                </p>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-xs text-red-300">
                [CRITICAL LOG] psycopg2.OperationalError: FATAL: remaining connection slots reserved for superuser
              </div>
            </div>

            <div className="md:col-span-5 bg-[#121829] p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-xs font-semibold text-white font-sans uppercase tracking-wider mb-2">Simulated Outage Telemetry</div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B0F1B] border border-slate-800">
                <span className="text-slate-400">Error Rate:</span>
                <span className="text-red-400 font-bold">34.2%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B0F1B] border border-slate-800">
                <span className="text-slate-400">P99 Latency:</span>
                <span className="text-amber-400 font-bold">5800ms</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#0B0F1B] border border-slate-800">
                <span className="text-slate-400">Active DB Conns:</span>
                <span className="text-white font-bold">100/100 (Exhausted)</span>
              </div>
              <Link href="/crisis" className="block text-center w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-sans font-semibold py-2.5 rounded-xl text-xs hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/20">
                Execute Connection Pool Scale Fix
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Trust & Numbers Metric Bar */}
      <section className="border-y border-slate-800 bg-[#0F1424]/40 py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-white mb-1">5 Core</div>
            <div className="text-sm text-slate-400 font-medium">Patent-Style AI Innovations</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-blue-400 mb-1">100%</div>
            <div className="text-sm text-slate-400 font-medium">Sandboxed Execution</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-purple-400 mb-1">Real-time</div>
            <div className="text-sm text-slate-400 font-medium">LangGraph Agentic Orchestration</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-emerald-400 mb-1">PostgreSQL</div>
            <div className="text-sm text-slate-400 font-medium">Supabase Evidence Tracking</div>
          </div>
        </div>
      </section>

      {/* Core Innovations Interactive Showcase */}
      <section id="innovations" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Five Core Architectural Innovations
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            PrepPilot AI goes far beyond basic static Q&A chatbots by introducing practical engineering environments.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab("bugs")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "bugs"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-[#121829] text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <Bug className="w-4 h-4" /> 1. Bug Investigation Arena
          </button>
          <button
            onClick={() => setActiveTab("crisis")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "crisis"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-[#121829] text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> 2. Technical Crisis Simulator
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "graph"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                : "bg-[#121829] text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <GitFork className="w-4 h-4" /> 3. Skill Knowledge Graph
          </button>
          <button
            onClick={() => setActiveTab("timemachine")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "timemachine"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-[#121829] text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <History className="w-4 h-4" /> 4. Interview Time Machine
          </button>
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "mistakes"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-500/25"
                : "bg-[#121829] text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> 5. Mistake Pattern Telemetry
          </button>
        </div>


        {/* Tab Content Display */}
        <div className="bg-[#151D2E] rounded-3xl border border-gray-800 p-8 md:p-12 shadow-2xl">
          {activeTab === "bugs" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <Bug className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white">Bug Investigation Arena</h3>
                <p className="text-[#B6C2D2] leading-relaxed">
                  Real engineering placement rounds require debugging broken code under pressure. Candidates fix Python key errors, SQL N+1 query joins, React state race conditions, and API memory leaks directly in Monaco Editor.
                </p>
                <ul className="space-y-3 text-sm text-[#B6C2D2]">
                  <li className="flex items-center gap-2.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Isolated OneCompiler sandbox code execution
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Real-time stack trace log examination
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Automated test suite verification & AI fix analysis
                  </li>
                </ul>
                <Link href="/bugs" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300">
                  Try Bug Arena Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#080B14] p-6 rounded-2xl border border-gray-800 font-mono text-xs space-y-3">
                <div className="text-gray-400">// Broken Python Scenario</div>
                <div className="text-red-400">def calculate_user_discount(user_data, amount):</div>
                <div className="text-red-300 pl-4"># Bug: Key error when discount_code key is missing</div>
                <div className="text-red-300 pl-4">code = user_data['discount_code']</div>
                <div className="text-red-300 pl-4">return amount * 0.8 if code == 'VIP' else amount</div>
                <div className="pt-2 border-t border-gray-800 text-green-400">
                  + # Solution: code = user_data.get('discount_code')
                </div>
              </div>
            </div>
          )}

          {activeTab === "crisis" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white">AI Technical Crisis Simulator</h3>
                <p className="text-[#B6C2D2] leading-relaxed">
                  Candidates act as SREs/Tech Leads responding to production incidents (P0 connection saturation, HTTP 500 spikes, CPU 100% utilization). Deterministic state machine evaluates decision speed and root-cause accuracy.
                </p>
                <ul className="space-y-3 text-sm text-[#B6C2D2]">
                  <li className="flex items-center gap-2.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Predefined incident state machine transitions
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Real-time telemetry metric dashboards
                  </li>
                </ul>
                <Link href="/crisis" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300">
                  Launch Crisis Simulation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#080B14] p-6 rounded-2xl border border-gray-800 space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center text-amber-400 font-sans font-bold">
                  <span>SCENARIO: DB CONNECTION EXHAUSTION</span>
                  <span>STATUS: P0 CRITICAL</span>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
                  psycopg2.OperationalError: FATAL: remaining connection slots reserved
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-[#111827] rounded text-[#B6C2D2]">Latency: <span className="text-amber-400 font-bold">4800ms</span></div>
                  <div className="p-2 bg-[#111827] rounded text-[#B6C2D2]">DB Conns: <span className="text-red-400 font-bold">98/100</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "graph" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
                  <GitFork className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white">Interactive Skill Knowledge Graph</h3>
                <p className="text-[#B6C2D2] leading-relaxed">
                  Visual node network built with React Flow. Tracks actual candidate assessment evidence across prerequisite skill trees rather than fabricated mastery percentages.
                </p>
                <Link href="/skill-graph" className="inline-flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300">
                  View Skill Graph <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#080B14] p-6 rounded-2xl border border-gray-800 space-y-3">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Python Basics</span>
                  <span className="text-green-400 font-bold">92% (Mastered)</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex justify-between items-center text-sm ml-6">
                  <span className="font-bold text-white">Data Structures</span>
                  <span className="text-blue-400 font-bold">75% (In Progress)</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-sm ml-12">
                  <span className="font-bold text-white">System Design</span>
                  <span className="text-amber-400 font-bold">Needs Evidence</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timemachine" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white">Interview Time Machine</h3>
                <p className="text-[#B6C2D2] leading-relaxed">
                  Revisit previous interview responses and compare old answers against retry answers side-by-side with AI-driven growth analysis.
                </p>
                <Link href="/time-machine" className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300">
                  Explore Time Machine <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#080B14] p-6 rounded-2xl border border-gray-800 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-gray-300">
                  <span className="text-red-400 font-bold block mb-1">Previous Answer (Score: 40%)</span>
                  "A process is a program running and thread is smaller."
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-gray-300">
                  <span className="text-green-400 font-bold block mb-1">Retry Answer (Score: 95%)</span>
                  "A process is an isolated memory space, while threads are lightweight execution units sharing heap space."
                </div>
              </div>
            </div>
          )}

          {activeTab === "mistakes" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white">Mistake Pattern Telemetry</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our telemetry system analyzes candidate attempts across mock interviews and sandboxed code to discover recurring habits (e.g. boundary condition omissions, SQL missing groupings) and prescribes targeted drills.
                </p>
                <Link href="/analytics?tab=mistakes" className="inline-flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-pink-300">
                  Inspect Mistake Intelligence <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#080B14] p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-pink-400 font-bold">
                    <span>Pattern: Off-by-one Loop Boundary Inefficiencies</span>
                    <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-300">High Severity</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Identified in 4 consecutive array & sliding window challenges.</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-purple-400 font-bold">
                    <span>Pattern: Missing Aggregation Groupings</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">Medium Severity</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Identified in complex SQL JOIN & GROUP BY evaluations.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Technology & Architecture Stack */}
      <section id="tech-stack" className="px-8 py-20 bg-[#111827]/40 border-t border-gray-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Production Architecture</h2>
            <p className="text-[#B6C2D2]">Built with lightweight, ultra-scalable cloud technologies.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-[#151D2E] rounded-2xl border border-gray-800">
              <h3 className="font-bold text-white mb-2 text-base">Frontend</h3>
              <p className="text-xs text-[#B6C2D2] leading-relaxed">Next.js 14 App Router, TypeScript, React Flow, Monaco Editor, Tailwind CSS.</p>
            </div>
            <div className="p-6 bg-[#151D2E] rounded-2xl border border-gray-800">
              <h3 className="font-bold text-white mb-2 text-base">Backend & Agents</h3>
              <p className="text-xs text-[#B6C2D2] leading-relaxed">Python FastAPI, LangGraph Multi-Agent Workflows, Google Gemini API.</p>
            </div>
            <div className="p-6 bg-[#151D2E] rounded-2xl border border-gray-800">
              <h3 className="font-bold text-white mb-2 text-base">Database & Storage</h3>
              <p className="text-xs text-[#B6C2D2] leading-relaxed">Supabase Cloud PostgreSQL, Supabase Auth, & Supabase Storage.</p>
            </div>
            <div className="p-6 bg-[#151D2E] rounded-2xl border border-gray-800">
              <h3 className="font-bold text-white mb-2 text-base">Execution Sandbox</h3>
              <p className="text-xs text-[#B6C2D2] leading-relaxed">OneCompiler Code Execution Engine for Python, JS, Java, & C++.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 pt-16 pb-12 px-8 bg-[#060911] text-[#94A3B8]">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800/60">
            {/* Col 1: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-white block leading-none">PrepPilot AI</span>
                  <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase">Placement Engine</span>
                </div>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
                Empowering engineering graduates with agentic, real-world hiring simulations—featuring production bug debugging, live crisis management, and skill graph tracking.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All Systems Operational
                </span>
              </div>
            </div>

            {/* Col 2: Core Arenas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Arenas</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/coding?tab=practice" className="hover:text-white transition-colors">Coding Practice</Link></li>
                <li><Link href="/coding?tab=bugs" className="hover:text-white transition-colors">Bug Investigation</Link></li>
                <li><Link href="/interview" className="hover:text-white transition-colors">AI Mock Interview</Link></li>
                <li><Link href="/roadmap?tab=graph" className="hover:text-white transition-colors">Skill Knowledge Graph</Link></li>
                <li><Link href="/roadmap" className="hover:text-white transition-colors">Learning Roadmap</Link></li>
              </ul>
            </div>

            {/* Col 3: Student Tools */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Preparation</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
                <li><a href="#innovations" className="hover:text-white transition-colors">5 Innovations</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Roadmap & Method</a></li>
                <li><a href="#tech-stack" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked</a></li>
              </ul>
            </div>

            {/* Col 4: Platform & Community */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Account & Connect</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register Account</Link></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li><a href="#tech-stack" className="hover:text-white transition-colors">OneCompiler Sandbox</a></li>
                <li><span className="text-gray-500 text-xs">v1.0 (Hackathon Edition)</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              © 2026 PrepPilot AI. Built for Social Impact & Fair Hiring Access. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#faq" className="hover:text-white transition-colors">Privacy Notice</a>
              <a href="#faq" className="hover:text-white transition-colors">Terms of Fair Use</a>
              <a href="#faq" className="hover:text-white transition-colors">Open Source Notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
