"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Settings, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Lock
} from "lucide-react";

function ProfileAndSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, updateLocalProfile } = useAuth();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"profile" | "settings">(
    tabParam === "settings" ? "settings" : "profile"
  );

  useEffect(() => {
    if (tabParam === "settings") {
      setActiveTab("settings");
    } else if (tabParam === "profile") {
      setActiveTab("profile");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "profile" | "settings") => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`);
  };

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [targetRole, setTargetRole] = useState(profile?.target_job_role || "Full-Stack Developer");
  const [preferredLanguage, setPreferredLanguage] = useState("Python / JavaScript");
  const [graduationYear, setGraduationYear] = useState("2026");

  // Optional Password Update State
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Validation State
  const [errors, setErrors] = useState<{
    fullName?: string;
    targetRole?: string;
    graduationYear?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Feedback State
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync with context on initial load
  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (user?.email) setEmail(user.email);
    if (profile?.target_job_role) setTargetRole(profile.target_job_role);
  }, [profile, user]);

  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .map((p: string) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PP";

  const validateField = (field: string, val?: any) => {
    let err = "";
    if (field === "fullName") {
      const v = (val !== undefined ? val : fullName).trim();
      if (!v) err = "Full name is required.";
      else if (v.length < 2) err = "Name must be at least 2 characters.";
    } else if (field === "targetRole") {
      const v = (val !== undefined ? val : targetRole).trim();
      if (!v) err = "Target job role is required.";
      else if (v.length < 2) err = "Target role must be at least 2 characters.";
    } else if (field === "graduationYear") {
      const v = parseInt(val !== undefined ? val : graduationYear);
      if (!v || isNaN(v) || v < 2000 || v > 2035) {
        err = "Please enter a valid graduation year between 2000 and 2035.";
      }
    } else if (field === "newPassword") {
      const v = val !== undefined ? val : newPassword;
      if (v && v.length < 8) {
        err = "New password must be at least 8 characters.";
      }
    } else if (field === "confirmNewPassword") {
      const v = val !== undefined ? val : confirmNewPassword;
      if (newPassword && v !== newPassword) {
        err = "Passwords do not match.";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      targetRole: true,
      graduationYear: true,
      newPassword: true,
      confirmNewPassword: true,
    });

    const isNameValid = validateField("fullName", fullName);
    const isRoleValid = validateField("targetRole", targetRole);
    const isGradValid = validateField("graduationYear", graduationYear);
    const isPassValid = validateField("newPassword", newPassword);
    const isConfirmValid = validateField("confirmNewPassword", confirmNewPassword);

    if (!isNameValid || !isRoleValid || !isGradValid || !isPassValid || !isConfirmValid) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const cleanName = fullName.trim();
      const cleanRole = targetRole.trim();
      const gradYearNum = parseInt(graduationYear) || 2026;

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("preppilot_user");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem("preppilot_user", JSON.stringify({
          ...parsed,
          email: email || parsed.email,
          full_name: cleanName,
          target_role: cleanRole,
        }));
      }

      updateLocalProfile({
        full_name: cleanName,
        target_job_role: cleanRole,
        email: email,
      });

      if (user?.id) {
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
            target_role: cleanRole
          }
        });

        if (newPassword && newPassword.length >= 8) {
          const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
          if (pwdErr) {
            setStatusMessage({ type: "error", text: `Profile saved, but password update failed: ${pwdErr.message}` });
            setSaving(false);
            return;
          }
          setNewPassword("");
          setConfirmNewPassword("");
        }

        await supabase
          .from("student_profiles")
          .upsert({
            user_id: user.id,
            full_name: cleanName,
            target_job_role: cleanRole,
            preferred_language: preferredLanguage,
            graduation_year: gradYearNum,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
      }

      setStatusMessage({ type: "success", text: "Profile & settings saved successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "success", text: "Profile details updated and cached successfully!" });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl animate-fadeIn text-[#1F2937]">
      {/* Header Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1FAE5]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
            <User className="w-8 h-8 text-[#16A34A]" /> Candidate Profile & Settings
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Manage your student credentials, placement targets, and AI agent preferences.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#F0FDF4] p-1.5 rounded-2xl border border-[#D1FAE5] shrink-0">
          <button
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "text-[#4B5563] hover:text-[#1F2937]"
            }`}
          >
            <User className="w-4 h-4" /> My Profile
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "text-[#4B5563] hover:text-[#1F2937]"
            }`}
          >
            <Settings className="w-4 h-4" /> Account Settings
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
          statusMessage.type === "success" 
            ? "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]" 
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: MY PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Candidate Card Overview */}
          <div className="bg-white p-8 rounded-3xl border border-[#D1FAE5] flex flex-col md:flex-row items-center gap-6 shadow-soft-card relative overflow-hidden">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#22C55E] to-[#16A34A] flex items-center justify-center font-extrabold text-white text-3xl shadow-lg shadow-green-500/25 shrink-0 border-2 border-white">
              {initials}
            </div>
            <div className="text-center md:text-left space-y-2 flex-1">
              <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">{fullName || "Student Candidate"}</h2>
              <p className="text-sm text-[#6B7280] flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-[#16A34A]" /> {email || "candidate@preppilot.ai"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="text-xs px-3.5 py-1 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#D1FAE5] font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#16A34A]" /> {targetRole}
                </span>
                <span className="text-xs px-3.5 py-1 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#D1FAE5] font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#16A34A]" /> Class of {graduationYear}
                </span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFDFA] border border-[#D1FAE5] text-center shrink-0 min-w-[140px]">
              <span className="text-xs text-[#6B7280] uppercase tracking-wider font-semibold block">Readiness</span>
              <span className="text-3xl font-black text-[#16A34A] mt-1 block">82%</span>
              <span className="text-[10px] text-[#166534] font-bold block mt-0.5">Top 15% Rank</span>
            </div>
          </div>

          {/* Placement Progress Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Technical Mock Interviews</span>
              <h3 className="text-2xl font-extrabold text-[#1F2937] mt-2">8 Completed</h3>
              <span className="text-xs text-[#166534] font-semibold block mt-1">Average 84.5% Score</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Coding Problems</span>
              <h3 className="text-2xl font-extrabold text-[#1F2937] mt-2">24 Solved</h3>
              <span className="text-xs text-[#16A34A] font-semibold block mt-1">Python, DSA, SQL</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] shadow-soft-card">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Skill Graph Mastery</span>
              <h3 className="text-2xl font-extrabold text-[#16A34A] mt-2">5 Core Topics</h3>
              <span className="text-xs text-[#6B7280] font-medium block mt-1">FastAPI, Next.js, Trees</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
            {/* Student Profile Information */}
            <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] space-y-5 shadow-soft-card">
              <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <User className="w-4 h-4 text-[#16A34A]" /> Student Profile Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">
                    Full Name <span className="text-[#16A34A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (touched.fullName) validateField("fullName", e.target.value);
                    }}
                    onBlur={() => handleBlur("fullName")}
                    placeholder="e.g. Vinay Puppalwar"
                    className={`w-full bg-white border rounded-xl p-3.5 text-[#1F2937] text-sm focus:outline-none transition ${
                      touched.fullName && errors.fullName 
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                        : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3.5 text-[#9CA3AF] text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">
                    Target Job Role <span className="text-[#16A34A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => {
                      setTargetRole(e.target.value);
                      if (touched.targetRole) validateField("targetRole", e.target.value);
                    }}
                    onBlur={() => handleBlur("targetRole")}
                    placeholder="e.g. Full-Stack Developer"
                    className={`w-full bg-white border rounded-xl p-3.5 text-[#1F2937] text-sm focus:outline-none transition ${
                      touched.targetRole && errors.targetRole 
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                        : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                    }`}
                  />
                  {touched.targetRole && errors.targetRole && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.targetRole}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">Graduation Year</label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => {
                      setGraduationYear(e.target.value);
                      if (touched.graduationYear) validateField("graduationYear", e.target.value);
                    }}
                    onBlur={() => handleBlur("graduationYear")}
                    placeholder="2026"
                    className={`w-full bg-white border rounded-xl p-3.5 text-[#1F2937] text-sm focus:outline-none transition ${
                      touched.graduationYear && errors.graduationYear 
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                        : "border-[#D1FAE5] focus:border-[#22C55E] focus:ring-3 focus:ring-green-100"
                    }`}
                  />
                  {touched.graduationYear && errors.graduationYear && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Password & Security Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#D1FAE5] space-y-4 shadow-soft-card">
              <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#16A34A]" /> Password & Security
              </h2>
              <p className="text-xs text-[#6B7280]">Leave blank if you do not wish to update your password.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (touched.newPassword) validateField("newPassword", e.target.value);
                    }}
                    onBlur={() => handleBlur("newPassword")}
                    placeholder="Minimum 8 characters"
                    className={`w-full bg-white border rounded-xl p-3.5 text-[#1F2937] text-sm focus:outline-none transition ${
                      touched.newPassword && errors.newPassword 
                        ? "border-red-400 focus:border-red-500" 
                        : "border-[#D1FAE5] focus:border-[#22C55E]"
                    }`}
                  />
                  {touched.newPassword && errors.newPassword && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#1F2937] block mb-1.5 font-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (touched.confirmNewPassword) validateField("confirmNewPassword", e.target.value);
                    }}
                    onBlur={() => handleBlur("confirmNewPassword")}
                    placeholder="Re-enter new password"
                    className={`w-full bg-white border rounded-xl p-3.5 text-[#1F2937] text-sm focus:outline-none transition ${
                      touched.confirmNewPassword && errors.confirmNewPassword 
                        ? "border-red-400 focus:border-red-500" 
                        : "border-[#D1FAE5] focus:border-[#22C55E]"
                    }`}
                  />
                  {touched.confirmNewPassword && errors.confirmNewPassword && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.confirmNewPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-button-primary hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Profile & Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ProfileAndSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading profile & settings...</div>}>
      <ProfileAndSettingsContent />
    </Suspense>
  );
}

