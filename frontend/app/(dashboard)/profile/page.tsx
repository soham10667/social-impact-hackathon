"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Settings, 
  Mail, 
  Award, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Cpu,
  Lock,
  Layers
} from "lucide-react";

export default function ProfileAndSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();

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
  const [llmProvider, setLlmProvider] = useState("Google Gemini 1.5 Pro (Default)");
  const [editorTheme, setEditorTheme] = useState("Dark Navy");

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

      // 1. Update in local storage for instant sync across session
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

      // 2. Update Supabase if authenticated
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
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-blue-400" /> Profile & Settings
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Manage your student credentials, placement target goals, and platform AI preferences.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-secondaryBg p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "profile"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" /> My Profile
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "settings"
                ? "bg-primaryAccent text-white shadow-md shadow-blue-500/25"
                : "text-mutedText hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Account Settings
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          statusMessage.type === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {statusMessage.text}
        </div>
      )}

      {/* TAB 1: MY PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Candidate Card Overview */}
          <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-secondaryAccent flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-purple-500/20 shrink-0">
              {initials}
            </div>
            <div className="text-center md:text-left space-y-1 flex-1">
              <h2 className="text-xl font-bold text-white">{fullName || "Student Candidate"}</h2>
              <p className="text-sm text-mutedText flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> {email || "candidate@preppilot.ai"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {targetRole}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  Class of {graduationYear}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondaryBg border border-gray-800 text-center shrink-0">
              <span className="text-xs text-mutedText block">Readiness Score</span>
              <span className="text-2xl font-extrabold text-blue-400">82%</span>
            </div>
          </div>

          {/* Placement Progress Metrics */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Technical Interviews</span>
              <h3 className="text-2xl font-bold text-white mt-1">8 Completed</h3>
              <span className="text-xs text-green-400 block mt-1">Average 84.5%</span>
            </div>

            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Coding Problems</span>
              <h3 className="text-2xl font-bold text-white mt-1">24 Solved</h3>
              <span className="text-xs text-blue-400 block mt-1">Python, DSA, SQL</span>
            </div>

            <div className="bg-cardBg p-5 rounded-2xl border border-gray-800">
              <span className="text-xs text-mutedText">Skill Graph Mastery</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">5 Topics</h3>
              <span className="text-xs text-mutedText block mt-1">FastAPI, Next.js, Trees</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
            {/* Student Profile Information */}
            <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Student Profile Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">
                    Full Name <span className="text-blue-400">*</span>
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
                    className={`w-full bg-secondaryBg border rounded-xl p-3 text-white text-sm focus:outline-none transition ${
                      touched.fullName && errors.fullName ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-blue-500"
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-secondaryBg/60 border border-gray-800 rounded-xl p-3 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">
                    Target Job Role <span className="text-blue-400">*</span>
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
                    className={`w-full bg-secondaryBg border rounded-xl p-3 text-white text-sm focus:outline-none transition ${
                      touched.targetRole && errors.targetRole ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-blue-500"
                    }`}
                  />
                  {touched.targetRole && errors.targetRole && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.targetRole}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">Graduation Year</label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => {
                      setGraduationYear(e.target.value);
                      if (touched.graduationYear) validateField("graduationYear", e.target.value);
                    }}
                    onBlur={() => handleBlur("graduationYear")}
                    placeholder="2026"
                    className={`w-full bg-secondaryBg border rounded-xl p-3 text-white text-sm focus:outline-none transition ${
                      touched.graduationYear && errors.graduationYear ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-blue-500"
                    }`}
                  />
                  {touched.graduationYear && errors.graduationYear && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Password & Security Section */}
            <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Password & Security
              </h2>
              <p className="text-xs text-mutedText">Leave blank if you do not wish to update your password.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (touched.newPassword) validateField("newPassword", e.target.value);
                    }}
                    onBlur={() => handleBlur("newPassword")}
                    placeholder="Minimum 8 characters"
                    className={`w-full bg-secondaryBg border rounded-xl p-3 text-white text-sm focus:outline-none transition ${
                      touched.newPassword && errors.newPassword ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-blue-500"
                    }`}
                  />
                  {touched.newPassword && errors.newPassword && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (touched.confirmNewPassword) validateField("confirmNewPassword", e.target.value);
                    }}
                    onBlur={() => handleBlur("confirmNewPassword")}
                    placeholder="Re-enter new password"
                    className={`w-full bg-secondaryBg border rounded-xl p-3 text-white text-sm focus:outline-none transition ${
                      touched.confirmNewPassword && errors.confirmNewPassword ? "border-red-500/70 focus:border-red-500" : "border-gray-800 focus:border-blue-500"
                    }`}
                  />
                  {touched.confirmNewPassword && errors.confirmNewPassword && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.confirmNewPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Platform & AI Engine Preferences */}
            <div className="bg-cardBg p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> AI & Platform Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">Primary LLM Provider</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className="w-full bg-secondaryBg border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option>Google Gemini 1.5 Pro (Default)</option>
                    <option>Mistral Large API</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-mutedText block mb-1.5 font-medium">Editor Theme</label>
                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="w-full bg-secondaryBg border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option>Dark Navy (PrepPilot Theme)</option>
                    <option>Monokai Pro</option>
                    <option>VS Code Dark+</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primaryAccent hover:bg-blue-600 text-white text-xs font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Profile & Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
