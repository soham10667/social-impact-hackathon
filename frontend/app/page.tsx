"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Sparkles, 
  Bug, 
  GitFork, 
  AlertTriangle, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  BrainCircuit, 
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"bugs" | "crisis" | "graph" | "timemachine" | "mistakes">("bugs");

  return (
    <div className="min-h-screen bg-[#FAFDFA] text-[#1F2937] flex flex-col font-sans selection:bg-green-100 selection:text-green-800">
      
      {/* Main Header / Navigation */}
      <header className="border-b border-[#D1FAE5] bg-white/90 backdrop-blur-xl sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#22C55E] to-[#16A34A] p-2.5 rounded-xl text-white shadow-md shadow-green-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#1F2937] block leading-none">PrepPilot AI</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#16A34A] uppercase">Placement Engine</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4B5563]">
          <a href="#features" className="hover:text-[#16A34A] transition-colors">Features</a>
          <a href="#innovations" className="hover:text-[#16A34A] transition-colors">5 Core Innovations</a>
          <a href="#tech-stack" className="hover:text-[#16A34A] transition-colors">Architecture</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-[#4B5563] hover:text-[#1F2937] px-4 py-2 transition">
            Sign In
          </Link>
          <Link 
            href="/register"
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-button-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-16 max-w-7xl mx-auto text-center flex flex-col items-center overflow-hidden">
        {/* Soft Organic Green Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-200/40 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-emerald-200/30 blur-[140px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#D1FAE5] text-[#16A34A] text-xs font-semibold mb-8 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Agentic Technical Assessment & Placement Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1F2937] leading-[1.1] mb-8 max-w-5xl">
          Prepare Smarter. Think Deeper.<br />
          <span className="text-[#16A34A]">
            Get Technical Placement Ready.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mb-10 leading-relaxed font-normal">
          The ultimate technical interview ecosystem. Practice live coding in sandboxed containers, triage real production outages, detect recurring mistake patterns, and master software engineering concepts with agentic AI feedback.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-base px-8 py-4 rounded-xl shadow-button-primary flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Student Portal <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#innovations"
            className="bg-white border border-[#D1FAE5] hover:border-[#86EFAC] text-[#166534] font-semibold text-base px-8 py-4 rounded-xl transition-all hover:bg-[#F0FDF4] shadow-xs"
          >
            Explore Interactive Demo
          </a>
        </div>

        {/* Hero Interactive App Window Mockup */}
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#D1FAE5] shadow-soft-card hover:shadow-soft-hover transition-all text-left relative group overflow-hidden">
          {/* Top Bar */}
          <div className="bg-[#F0FDF4] px-5 py-3.5 border-b border-[#D1FAE5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-[#6B7280] font-mono ml-2">preppilot-ai // crisis-simulator // incident-P0-842</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#16A34A] font-semibold bg-white px-3 py-1 rounded-md border border-[#D1FAE5]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              Incident Active • Telemetry Syncing
            </div>
          </div>

          {/* Body Preview */}
          <div className="p-6 grid md:grid-cols-12 gap-6 bg-white">
            <div className="md:col-span-7 space-y-4">
              <div className="bg-[#FFFBEB] p-5 rounded-2xl border border-[#FDE68A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-0.5 rounded border border-red-200">P0 CRITICAL</span>
                  <span className="text-xs text-[#6B7280]">PostgreSQL Pool Exhaustion</span>
                </div>
                <h3 className="text-base font-bold text-[#1F2937] mb-2">Production Checkout API Returning HTTP 500</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  High traffic spike causing database connection slots to max out at 100/100 connections. Customer checkout failure rate spiked to 34%.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200 font-mono text-xs text-red-700">
                [CRITICAL LOG] psycopg2.OperationalError: FATAL: remaining connection slots reserved for superuser
              </div>
            </div>

            <div className="md:col-span-5 bg-[#F0FDF4]/60 p-5 rounded-2xl border border-[#D1FAE5] space-y-3 font-mono text-xs">
              <div className="text-xs font-semibold text-[#1F2937] font-sans uppercase tracking-wider mb-2">Simulated Outage Telemetry</div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#D1FAE5]">
                <span className="text-[#6B7280]">Error Rate:</span>
                <span className="text-red-600 font-bold">34.2%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#D1FAE5]">
                <span className="text-[#6B7280]">P99 Latency:</span>
                <span className="text-[#D97706] font-bold">5800ms</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#D1FAE5]">
                <span className="text-[#6B7280]">Active DB Conns:</span>
                <span className="text-[#1F2937] font-bold">100/100 (Exhausted)</span>
              </div>
              <Link href="/crisis" className="block text-center w-full mt-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-sans font-semibold py-2.5 rounded-xl text-xs transition shadow-md shadow-green-500/20">
                Execute Connection Pool Scale Fix
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Trust & Numbers Metric Bar */}
      <section className="border-y border-[#D1FAE5] bg-white py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-[#1F2937] mb-1">5 Core</div>
            <div className="text-sm text-[#6B7280] font-medium">Patent-Style AI Innovations</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#16A34A] mb-1">100%</div>
            <div className="text-sm text-[#6B7280] font-medium">Sandboxed Execution</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#16A34A] mb-1">Real-time</div>
            <div className="text-sm text-[#6B7280] font-medium">LangGraph Agentic Orchestration</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#16A34A] mb-1">PostgreSQL</div>
            <div className="text-sm text-[#6B7280] font-medium">Supabase Evidence Tracking</div>
          </div>
        </div>
      </section>

      {/* Core Innovations Interactive Showcase */}
      <section id="innovations" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1F2937] mb-4 tracking-tight">
            Five Core Architectural Innovations
          </h2>
          <p className="text-[#6B7280] text-base md:text-lg">
            PrepPilot AI goes far beyond basic static Q&A chatbots by introducing practical engineering environments.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab("bugs")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "bugs"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "bg-white text-[#4B5563] hover:text-[#1F2937] border border-[#D1FAE5]"
            }`}
          >
            <Bug className="w-4 h-4" /> 1. Bug Investigation Arena
          </button>
          <button
            onClick={() => setActiveTab("crisis")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "crisis"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "bg-white text-[#4B5563] hover:text-[#1F2937] border border-[#D1FAE5]"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> 2. Technical Crisis Simulator
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "graph"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "bg-white text-[#4B5563] hover:text-[#1F2937] border border-[#D1FAE5]"
            }`}
          >
            <GitFork className="w-4 h-4" /> 3. Skill Knowledge Graph
          </button>
          <button
            onClick={() => setActiveTab("timemachine")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "timemachine"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "bg-white text-[#4B5563] hover:text-[#1F2937] border border-[#D1FAE5]"
            }`}
          >
            <History className="w-4 h-4" /> 4. Interview Time Machine
          </button>
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "mistakes"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "bg-white text-[#4B5563] hover:text-[#1F2937] border border-[#D1FAE5]"
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> 5. Mistake Pattern Telemetry
          </button>
        </div>

        {/* Tab Content Display (White Card) */}
        <div className="bg-white rounded-3xl border border-[#D1FAE5] p-8 md:p-12 shadow-soft-card">
          {activeTab === "bugs" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                  <Bug className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937]">Bug Investigation Arena</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Real engineering placement rounds require debugging broken code under pressure. Candidates fix Python key errors, SQL N+1 query joins, React state race conditions, and API memory leaks directly in Monaco Editor.
                </p>
                <ul className="space-y-3 text-sm text-[#4B5563]">
                  <li className="flex items-center gap-2.5 text-[#1F2937]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Isolated OneCompiler sandbox code execution
                  </li>
                  <li className="flex items-center gap-2.5 text-[#1F2937]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Real-time stack trace log examination
                  </li>
                  <li className="flex items-center gap-2.5 text-[#1F2937]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Automated test suite verification & AI fix analysis
                  </li>
                </ul>
                <Link href="/coding?tab=bugs" className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#22C55E]">
                  Try Bug Arena Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#FAFDFA] p-6 rounded-2xl border border-[#D1FAE5] font-mono text-xs space-y-3">
                <div className="text-[#6B7280]">// Broken Python Scenario</div>
                <div className="text-red-600 font-semibold">def calculate_user_discount(user_data, amount):</div>
                <div className="text-red-500 pl-4"># Bug: Key error when discount_code key is missing</div>
                <div className="text-red-500 pl-4">code = user_data['discount_code']</div>
                <div className="text-red-500 pl-4">return amount * 0.8 if code == 'VIP' else amount</div>
                <div className="pt-2 border-t border-[#D1FAE5] text-[#16A34A] font-semibold">
                  + # Solution: code = user_data.get('discount_code')
                </div>
              </div>
            </div>
          )}

          {activeTab === "crisis" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937]">AI Technical Crisis Simulator</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Candidates act as SREs/Tech Leads responding to production incidents (P0 connection saturation, HTTP 500 spikes, CPU 100% utilization). Deterministic state machine evaluates decision speed and root-cause accuracy.
                </p>
                <ul className="space-y-3 text-sm text-[#4B5563]">
                  <li className="flex items-center gap-2.5 text-[#1F2937]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Predefined incident state machine transitions
                  </li>
                  <li className="flex items-center gap-2.5 text-[#1F2937]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Real-time telemetry metric dashboards
                  </li>
                </ul>
                <Link href="/crisis" className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#22C55E]">
                  Launch Crisis Simulation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#FAFDFA] p-6 rounded-2xl border border-[#D1FAE5] space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center text-[#D97706] font-sans font-bold">
                  <span>SCENARIO: DB CONNECTION EXHAUSTION</span>
                  <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded">STATUS: P0 CRITICAL</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  psycopg2.OperationalError: FATAL: remaining connection slots reserved
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-white border border-[#D1FAE5] rounded text-[#4B5563]">Latency: <span className="text-[#D97706] font-bold">4800ms</span></div>
                  <div className="p-2 bg-white border border-[#D1FAE5] rounded text-[#4B5563]">DB Conns: <span className="text-red-600 font-bold">98/100</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "graph" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                  <GitFork className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937]">Interactive Skill Knowledge Graph</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Visual node network built with React Flow. Tracks actual candidate assessment evidence across prerequisite skill trees rather than fabricated mastery percentages.
                </p>
                <Link href="/roadmap" className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#22C55E]">
                  View Skill Graph <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#FAFDFA] p-6 rounded-2xl border border-[#D1FAE5] space-y-3">
                <div className="p-4 rounded-xl bg-white border border-[#D1FAE5] shadow-xs flex justify-between items-center text-sm">
                  <span className="font-bold text-[#1F2937]">Python Basics</span>
                  <span className="text-[#16A34A] font-bold">92% (Mastered)</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#D1FAE5] shadow-xs flex justify-between items-center text-sm ml-6">
                  <span className="font-bold text-[#1F2937]">Data Structures</span>
                  <span className="text-[#22C55E] font-bold">75% (In Progress)</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#D1FAE5] shadow-xs flex justify-between items-center text-sm ml-12">
                  <span className="font-bold text-[#1F2937]">System Design</span>
                  <span className="text-[#D97706] font-bold">Needs Evidence</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timemachine" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937]">Interview Time Machine</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Revisit previous interview responses and compare old answers against retry answers side-by-side with AI-driven growth analysis.
                </p>
                <Link href="/interview" className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#22C55E]">
                  Explore Time Machine <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#FAFDFA] p-6 rounded-2xl border border-[#D1FAE5] space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#4B5563]">
                  <span className="text-red-600 font-bold block mb-1">Previous Answer (Score: 40%)</span>
                  "A process is a program running and thread is smaller."
                </div>
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-[#166534]">
                  <span className="text-[#16A34A] font-bold block mb-1">Retry Answer (Score: 95%)</span>
                  "A process is an isolated memory space, while threads are lightweight execution units sharing heap space."
                </div>
              </div>
            </div>
          )}

          {activeTab === "mistakes" && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937]">Mistake Pattern Telemetry</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Our telemetry system analyzes candidate attempts across mock interviews and sandboxed code to discover recurring habits (e.g. boundary condition omissions, SQL missing groupings) and prescribes targeted drills.
                </p>
                <Link href="/analytics" className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#22C55E]">
                  Inspect Mistake Intelligence <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-[#FAFDFA] p-6 rounded-2xl border border-[#D1FAE5] space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-[#D1FAE5] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#1F2937] font-bold">
                    <span>Pattern: Off-by-one Loop Boundary Inefficiencies</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">High Severity</span>
                  </div>
                  <p className="text-[#6B7280] text-[11px]">Identified in 4 consecutive array & sliding window challenges.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#D1FAE5] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#1F2937] font-bold">
                    <span>Pattern: Missing Aggregation Groupings</span>
                    <span className="text-[10px] bg-amber-100 text-[#D97706] px-2 py-0.5 rounded font-semibold">Medium Severity</span>
                  </div>
                  <p className="text-[#6B7280] text-[11px]">Identified in complex SQL JOIN & GROUP BY evaluations.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Technology & Architecture Stack */}
      <section id="tech-stack" className="px-8 py-20 bg-white border-t border-[#D1FAE5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Enterprise Production Architecture</h2>
            <p className="text-[#6B7280]">Built with lightweight, ultra-scalable cloud technologies.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-[#FAFDFA] rounded-2xl border border-[#D1FAE5] shadow-xs">
              <h3 className="font-bold text-[#1F2937] mb-2 text-base">Frontend</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">Next.js 14 App Router, TypeScript, React Flow, Monaco Editor, Tailwind CSS.</p>
            </div>
            <div className="p-6 bg-[#FAFDFA] rounded-2xl border border-[#D1FAE5] shadow-xs">
              <h3 className="font-bold text-[#1F2937] mb-2 text-base">Backend & Agents</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">Python FastAPI, LangGraph Multi-Agent Workflows, Mistral AI Reasoning Engine.</p>
            </div>
            <div className="p-6 bg-[#FAFDFA] rounded-2xl border border-[#D1FAE5] shadow-xs">
              <h3 className="font-bold text-[#1F2937] mb-2 text-base">Database & Storage</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">Supabase Cloud PostgreSQL, Supabase Auth, & Supabase Storage.</p>
            </div>
            <div className="p-6 bg-[#FAFDFA] rounded-2xl border border-[#D1FAE5] shadow-xs">
              <h3 className="font-bold text-[#1F2937] mb-2 text-base">Execution Sandbox</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">OneCompiler Code Execution Engine for Python, JS, Java, & C++.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D1FAE5] pt-16 pb-12 px-8 bg-[#FAFDFA] text-[#6B7280]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#D1FAE5]">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-[#22C55E] to-[#16A34A] p-2.5 rounded-xl text-white shadow-md shadow-green-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-[#1F2937] block leading-none">PrepPilot AI</span>
                  <span className="text-[11px] font-semibold tracking-wider text-[#16A34A] uppercase">Placement Engine</span>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-sm">
                Empowering engineering graduates with agentic, real-world hiring simulations—featuring production bug debugging, live crisis management, and skill graph tracking.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-4">Core Arenas</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/coding?tab=practice" className="hover:text-[#16A34A] transition-colors">Coding Practice</Link></li>
                <li><Link href="/coding?tab=bugs" className="hover:text-[#16A34A] transition-colors">Bug Investigation</Link></li>
                <li><Link href="/interview" className="hover:text-[#16A34A] transition-colors">AI Mock Interview</Link></li>
                <li><Link href="/roadmap" className="hover:text-[#16A34A] transition-colors">Skill Knowledge Graph</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-4">Preparation</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/dashboard" className="hover:text-[#16A34A] transition-colors">Student Dashboard</Link></li>
                <li><a href="#innovations" className="hover:text-[#16A34A] transition-colors">5 Innovations</a></li>
                <li><a href="#tech-stack" className="hover:text-[#16A34A] transition-colors">Architecture</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-4">Account</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-[#16A34A] transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-[#16A34A] transition-colors">Register Account</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
            <div>
              © 2026 PrepPilot AI. Built for Social Impact & Fair Hiring Access. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
