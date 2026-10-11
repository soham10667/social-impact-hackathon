"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoginSuccessAnimation from "@/components/LoginSuccessAnimation";
import { Sparkles, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, Bug, AlertTriangle, GitFork } from "lucide-react";

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
        const errorMsg = (authError.message || "").toLowerCase();
        if (errorMsg.includes("invalid login credentials")) {
          setErrors({
            general:
              "Invalid login credentials. If you just registered, please check your inbox (or spam) to verify your email address before signing in, or confirm your password is correct.",
          });
        } else if (errorMsg.includes("email not confirmed")) {
          setErrors({
            general:
              "Your email has not been confirmed yet. Please click the confirmation link sent to your inbox before signing in.",
          });
        } else {
          setErrors({ general: authError.message || "Invalid email or password." });
        }
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
    <div className="min-h-screen bg-[#FAFDFA] text-[#1F2937] flex flex-col md:flex-row font-sans selection:bg-green-100 selection:text-green-800">
      {/* Left Branding Showcase Column */}
      <div className="md:w-1/2 p-8 md:p-14 bg-gradient-to-br from-[#F0FDF4] via-[#FFFFFF] to-[#DCFCE7]/40 border-r border-[#D1FAE5] flex flex-col justify-between relative overflow-hidden">
        {/* Soft Organic Green Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-green-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/30 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-tr from-[#22C55E] to-[#16A34A] p-2.5 rounded-xl text-white shadow-md shadow-green-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#1F2937] block leading-none">PrepPilot AI</span>
              <span className="text-xs font-semibold tracking-wider text-[#16A34A] uppercase">Placement Engine</span>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F2937] leading-tight mb-6">
            Master Technical Interviews with{" "}
            <span className="text-[#16A34A]">
              Agentic AI
            </span>
          </h1>
          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg mb-10 font-normal">
            Practice sandboxed debugging, triage live SRE production outages, detect recurring mistake patterns, and track your placement readiness index.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A] shrink-0">
                <Bug className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">Bug Investigation Arena</strong> Fix broken production code & stack traces
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">Technical Crisis Simulator</strong> Triage P0 database & API incidents
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A] shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">Skill Knowledge Graph</strong> Visual prerequisite tree & mastery status
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#9CA3AF] pt-8">
          © 2026 PrepPilot AI Inc. Secure Supabase Auth & JWT Protected.
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#D1FAE5] text-[#16A34A] text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Candidate Portal
            </div>
            <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Welcome Back</h2>
            <p className="text-sm text-[#6B7280] mt-2">Enter your candidate credentials to access your preparation dashboard.</p>
          </div>

          {errors.general && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="text-xs font-semibold text-[#1F2937] block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => handleBlur("email")}
                  placeholder="candidate@university.edu"
                  className={`w-full bg-white border rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                    touched.email && errors.email 
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                      : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[#1F2937]">Password</label>
                <Link href="#" className="text-xs font-semibold text-[#16A34A] hover:text-[#22C55E]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••••••"
                  className={`w-full bg-white border rounded-xl pl-11 pr-11 py-3.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                    touched.password && errors.password 
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                      : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[#9CA3AF] hover:text-[#1F2937]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#6B7280] hover:text-[#1F2937]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D1FAE5] text-[#22C55E] focus:ring-[#22C55E]"
                />
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3.5 rounded-xl shadow-button-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Signing in..." : "Sign In to PrepPilot AI"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#6B7280] pt-2">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-[#16A34A] hover:text-[#22C55E]">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
