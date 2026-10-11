"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Code2,
  GitFork,
  Loader2,
} from "lucide-react";

type FormField =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "terms";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<FormField | "general", string>>
  >({});

  const [touched, setTouched] = useState<
    Partial<Record<FormField, boolean>>
  >({});

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateField = (
    field: FormField,
    value?: string | boolean
  ): string => {
    let error = "";

    switch (field) {
      case "fullName": {
        const v = String(value ?? fullName).trim();

        if (!v) error = "Full name is required.";
        else if (v.length < 2)
          error = "Name must be at least 2 characters.";
        break;
      }

      case "email": {
        const v = String(value ?? email).trim();

        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

        if (!v) error = "Email address is required.";
        else if (v.length > 254 || !emailRegex.test(v))
          error = "Please enter a valid email address.";
        break;
      }

      case "password": {
        const v = String(value ?? password);

        if (!v) error = "Password is required.";
        else if (v.length < 8)
          error = "Password must be at least 8 characters.";
        break;
      }

      case "confirmPassword": {
        const v = String(value ?? confirmPassword);

        if (!v) error = "Please confirm your password.";
        else if (v !== password) error = "Passwords do not match.";
        break;
      }

      case "terms": {
        const accepted = Boolean(value ?? termsAccepted);

        if (!accepted)
          error = "You must agree to the Terms of Service.";
        break;
      }
    }

    setErrors((previous) => ({
      ...previous,
      [field]: error || undefined,
    }));

    return error;
  };

  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleBlur = (field: FormField) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    validateField(field);
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Prevent duplicate simultaneous requests or requests during cooldown
    if (loading || isSubmittingRef.current || cooldownSeconds > 0) return;

    const allFields: FormField[] = [
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "terms",
    ];

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    const fieldValues: Record<FormField, string | boolean> = {
      fullName,
      email,
      password,
      confirmPassword,
      terms: termsAccepted,
    };

    const validationErrors: Partial<Record<FormField, string>> = {};

    for (const field of allFields) {
      const error = validateField(field, fieldValues[field]);
      if (error) validationErrors[field] = error;
    }

    if (Object.keys(validationErrors).length > 0) return;

    // Lock submission immediately synchronously
    isSubmittingRef.current = true;
    setLoading(true);
    setErrors({});
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
      const redirectOrigin = appUrl || (typeof window !== "undefined" ? window.location.origin : "");

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            target_role: targetRole,
          },
          emailRedirectTo: redirectOrigin ? `${redirectOrigin}/login` : undefined,
        },
      });

      if (error) {
        const errorMsg = (error.message || "").toLowerCase();
        const status = (error as any)?.status;

        // Check specifically for Supabase rate limit & HTTP 429
        if (
          status === 429 ||
          errorMsg.includes("rate limit") ||
          errorMsg.includes("too many requests") ||
          errorMsg.includes("over_email_send_rate_limit")
        ) {
          setCooldownSeconds(60);
          setErrors({
            general:
              "Email rate limit exceeded. Supabase limits automated confirmation emails on free tiers. Please wait 60 seconds before trying again, or contact the workspace administrator to configure custom SMTP."
          });
        } else if (errorMsg.includes("user already registered")) {
          setErrors({
            general: "An account with this email already exists. Please sign in instead."
          });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "preppilot_user",
          JSON.stringify({
            email: cleanEmail,
            full_name: cleanName,
            target_role: targetRole,
          })
        );
      }

      if (data?.session) {
        setSuccessMsg(
          "Account created successfully! Redirecting to your dashboard..."
        );
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setSuccessMsg(
          "Registration successful! Please check your email inbox to confirm your account before signing in."
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please check your network and try again.";

      if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("429")) {
        setCooldownSeconds(60);
        setErrors({
          general: "Email rate limit exceeded. Please wait 60 seconds before submitting again."
        });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFDFA] text-[#1F2937] flex flex-col md:flex-row font-sans selection:bg-green-100 selection:text-green-800">
      {/* Branding column */}
      <div className="md:w-1/2 p-8 md:p-14 bg-gradient-to-br from-[#F0FDF4] via-[#FFFFFF] to-[#DCFCE7]/40 border-r border-[#D1FAE5] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-green-200/40 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/30 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-tr from-[#22C55E] to-[#16A34A] p-2.5 rounded-xl text-white shadow-md shadow-green-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#1F2937] block leading-none">
                PrepPilot AI
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#16A34A] uppercase">
                Placement Engine
              </span>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F2937] leading-tight mb-6">
            Join Candidates Getting{" "}
            <span className="text-[#16A34A]">
              Placement Ready
            </span>
          </h1>

          <p className="text-base text-[#6B7280] leading-relaxed max-w-lg mb-10 font-normal">
            Create your account to start AI mock interviews, practice sandboxed
            debugging, and track your technical skill graph.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">
                  Supabase Auth Protection
                </strong>
                Secure JWT sessions & encrypted credentials
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A] shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">
                  Interactive Compiler & Sandboxes
                </strong>
                OneCompiler microservice integration
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#D1FAE5] hover:border-[#86EFAC] hover:shadow-soft-hover transition-all shadow-soft-card">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center text-[#16A34A] shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#6B7280]">
                <strong className="text-[#1F2937] block font-semibold text-sm">
                  Adaptive Learning Roadmap
                </strong>
                Dynamic competency trees and mistake tracking
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#9CA3AF] pt-8">
          © 2026 PrepPilot AI Inc. All rights reserved.
        </div>
      </div>

      {/* Registration form */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#D1FAE5] text-[#16A34A] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Start For Free
            </div>
            <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-[#6B7280] mt-2">
              Start your technical interview preparation journey today.
            </p>
          </div>

          {errors.general && (
            <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{errors.general}</div>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="text-xs font-semibold text-[#1F2937] block mb-1.5">
                Full Name <span className="text-[#16A34A]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    if (touched.fullName) validateField("fullName", event.target.value);
                  }}
                  onBlur={() => handleBlur("fullName")}
                  placeholder="Alex Johnson"
                  className={`w-full bg-white border rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                    touched.fullName && errors.fullName
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                  }`}
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-[#1F2937] block mb-1.5">
                Email Address <span className="text-[#16A34A]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (touched.email) validateField("email", event.target.value);
                  }}
                  onBlur={() => handleBlur("email")}
                  placeholder="alex@university.edu"
                  className={`w-full bg-white border rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                    touched.email && errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Target role */}
            <div>
              <label htmlFor="targetRole" className="text-xs font-semibold text-[#1F2937] block mb-1.5">
                Target Job Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5 pointer-events-none" />
                <select
                  id="targetRole"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="w-full bg-white border border-[#D1FAE5] rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#22C55E] focus:ring-3 focus:ring-green-100 transition appearance-none cursor-pointer"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="DevOps / SRE Engineer">DevOps / SRE Engineer</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="text-xs font-semibold text-[#1F2937] block mb-1.5">
                  Password <span className="text-[#16A34A]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (touched.password) validateField("password", event.target.value);
                      if (touched.confirmPassword) validateField("confirmPassword", confirmPassword);
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder="Min 8 chars"
                    className={`w-full bg-white border rounded-xl pl-10 pr-3 py-3.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                      touched.password && errors.password
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#D1FAE5] focus:border-[#22C55E]"
                    }`}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#1F2937] block mb-1.5">
                  Confirm Password <span className="text-[#16A34A]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (touched.confirmPassword) validateField("confirmPassword", event.target.value);
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Re-enter password"
                    className={`w-full bg-white border rounded-xl pl-10 pr-3 py-3.5 text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none transition ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#D1FAE5] focus:border-[#22C55E]"
                    }`}
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="text-xs text-[#16A34A] hover:text-[#22C55E] font-medium"
            >
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B7280] hover:text-[#1F2937]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    if (touched.terms) validateField("terms", event.target.checked);
                  }}
                  onBlur={() => handleBlur("terms")}
                  className="rounded border-[#D1FAE5] text-[#22C55E] focus:ring-[#22C55E]"
                />
                I agree to the Terms of Service & Privacy Policy
              </label>
              {touched.terms && errors.terms && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cooldownSeconds > 0}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3.5 rounded-xl shadow-button-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <span>Please wait {cooldownSeconds}s before retry</span>
                </>
              ) : (
                <>
                  <span>Create PrepPilot Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#6B7280] pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#16A34A] hover:text-[#22C55E]">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
