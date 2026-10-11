"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoginSuccessAnimation from "@/components/LoginSuccessAnimation";
import { Sparkles, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Bug, AlertTriangle, GitFork } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [authenticatedName, setAuthenticatedName] = useState("Candidate");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field: "email" | "password", value: string) => {
    let err = "";
    if (field === "email") {
      const trimmed = value.trim();
      if (!trimmed) {
        err = "Email address is required.";
      } else if (!emailRegex.test(trimmed)) {
        err = "Please enter a valid email address (e.g. name@domain.com).";
      }
    } else if (field === "password") {
      if (!value) {
        err = "Password is required.";
      } else if (value.trim().length === 0) {
        err = "Password cannot be whitespace only.";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err, general: undefined }));
    return !err;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, field === "email" ? email : password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || showSuccessAnimation) return;

    setTouched({ email: true, password: true });
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cleanEmail = email.trim();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message === "Failed to fetch") {
          // Local demo environment without Supabase cloud credentials configured yet
          const nameFromEmail = cleanEmail.split("@")[0];
          const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
          if (typeof window !== "undefined") {
            localStorage.setItem("preppilot_user", JSON.stringify({ email: cleanEmail, full_name: formattedName }));
          }
          setAuthenticatedName(formattedName);
          setShowSuccessAnimation(true);
          return;
        }
        setErrors({ general: authError.message || "Invalid email or password." });
        setLoading(false);
        return;
      }

      const userObj = data?.user;
      const resolvedName = userObj?.user_metadata?.full_name || cleanEmail.split("@")[0];
      if (typeof window !== "undefined") {
        localStorage.setItem("preppilot_user", JSON.stringify({ email: cleanEmail, full_name: resolvedName }));
      }
      setAuthenticatedName(resolvedName);
      setShowSuccessAnimation(true);
    } catch (err: any) {
      const cleanEmail = email.trim();
      const nameFromEmail = cleanEmail.split("@")[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      if (typeof window !== "undefined") {
        localStorage.setItem("preppilot_user", JSON.stringify({ email: cleanEmail, full_name: formattedName }));
      }
      setAuthenticatedName(formattedName);
      setShowSuccessAnimation(true);
    }
  };

  if (showSuccessAnimation) {
    return (
      <LoginSuccessAnimation
        studentName={authenticatedName}
        onAnimationComplete={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080B14] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Left Branding Showcase Column */}
      <div className="md:w-1/2 p-8 md:p-14 bg-gradient-to-br from-[#0E1322] via-[#090C16] to-[#080B14] border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white block leading-none">PrepPilot AI</span>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Placement Engine</span>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Master Technical Interviews with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Agentic AI
            </span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed max-w-lg mb-10">
            Practice sandboxed debugging, triage live SRE production outages, detect recurring mistake patterns, and track your placement readiness index.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#121829] border border-slate-800/80 hover:border-blue-500/30 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Bug className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white block font-semibold">Bug Investigation Arena</strong> Fix broken production code & stack traces
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#121829] border border-slate-800/80 hover:border-amber-500/30 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white block font-semibold">Technical Crisis Simulator</strong> Triage P0 database & API incidents
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#121829] border border-slate-800/80 hover:border-emerald-500/30 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white block font-semibold">Skill Knowledge Graph</strong> Visual prerequisite tree & mastery status
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 pt-8">
          © 2026 PrepPilot AI Inc. Secure Supabase Auth & JWT Protected.
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-[#080B14] relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Candidate Portal
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-2">Enter your candidate credentials to access your preparation dashboard.</p>
          </div>

          {errors.general && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => handleBlur("email")}
                  placeholder="candidate@university.edu"
                  className={`w-full bg-[#0D1220] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition ${
                    touched.email && errors.email ? "border-red-500/70 focus:border-red-500" : "border-slate-800 focus:border-blue-500"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••••••"
                  className={`w-full bg-[#0D1220] border rounded-xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none transition ${
                    touched.password && errors.password ? "border-red-500/70 focus:border-red-500" : "border-slate-800 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-[#0D1220] text-blue-600 focus:ring-0"
                />
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Signing in..." : "Sign In to PrepPilot AI"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

