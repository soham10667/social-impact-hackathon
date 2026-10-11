
"use client";

import { useState } from "react";
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

        // Validate the actual entered address, not a placeholder.
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

  const handleBlur = (field: FormField) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    validateField(field);
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

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

    setLoading(true);
    setErrors({});
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            target_role: targetRole,
          },
        },
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      // Store display information only; this is not authentication.
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

      if (data.session) {
        setSuccessMsg(
          "Account created successfully! Redirecting to your dashboard..."
        );

        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setSuccessMsg(
          "Registration received! Check your email to confirm your account, then sign in."
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";

      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Branding */}
      <div className="md:w-1/2 p-8 md:p-14 bg-gradient-to-br from-[#0E1322] via-[#090C16] to-[#080B14] border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white block leading-none">
                PrepPilot AI
              </span>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                Placement Engine
              </span>
            </div>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Join Candidates Getting{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Placement Ready
            </span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-lg mb-10">
            Create your account to start AI mock interviews, practice sandboxed
            debugging, and track your technical skill graph.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#121829] border border-slate-800/80 hover:border-blue-500/30 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white block font-semibold">
                  Supabase Auth Protection
                </strong>
                Secure JWT sessions & encrypted credentials
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 pt-8">
          © 2026 PrepPilot AI Inc. All rights reserved.
        </div>
      </div>

      {/* Registration form */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center bg-[#080B14] relative">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Start For Free
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Start your technical interview preparation journey today.
            </p>
          </div>

          {errors.general && (
            <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errors.general}</div>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
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
                  className={`w-full bg-[#0D1220] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition ${
                    touched.fullName && errors.fullName
                      ? "border-red-500/70 focus:border-red-500"
                      : "border-slate-800 focus:border-blue-500"
                  }`}
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Email Address <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
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
                  className={`w-full bg-[#0D1220] border rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition ${
                    touched.email && errors.email
                      ? "border-red-500/70 focus:border-red-500"
                      : "border-slate-800 focus:border-blue-500"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Target role */}
            <div>
              <label htmlFor="targetRole" className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Job Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <select
                  id="targetRole"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="w-full bg-[#0D1220] border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 transition appearance-none"
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
                <label htmlFor="password" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Password <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
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
                    className={`w-full bg-[#0D1220] border rounded-xl pl-10 pr-3 py-3.5 text-xs text-white focus:outline-none transition ${
                      touched.password && errors.password
                        ? "border-red-500/70"
                        : "border-slate-800 focus:border-blue-500"
                    }`}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Confirm Password <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
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
                    className={`w-full bg-[#0D1220] border rounded-xl pl-10 pr-3 py-3.5 text-xs text-white focus:outline-none transition ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-red-500/70"
                        : "border-slate-800 focus:border-blue-500"
                    }`}
                  />
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    if (touched.terms) validateField("terms", event.target.checked);
                  }}
                  onBlur={() => handleBlur("terms")}
                  className="rounded border-slate-700 bg-[#0D1220] text-blue-600 focus:ring-0"
                />
                I agree to the Terms of Service & Privacy Policy
              </label>
              {touched.terms && errors.terms && (
                <p className="text-[11px] text-red-400 mt-1">{errors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Creating Account..." : "Create PrepPilot Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
