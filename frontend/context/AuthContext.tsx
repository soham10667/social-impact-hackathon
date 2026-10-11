"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchUserStreak, recordQualifyingActivity, UserStreak, QualifyingActivityType } from "@/lib/streak";

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  streak: UserStreak;
  logout: () => Promise<void>;
  updateLocalProfile: (newProfile: { full_name?: string; target_job_role?: string; email?: string }) => void;
  recordActivity: (activityType: QualifyingActivityType) => Promise<UserStreak>;
  refreshStreak: () => Promise<void>;
}

const defaultStreak: UserStreak = {
  user_id: "",
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  streak: defaultStreak,
  logout: async () => {},
  updateLocalProfile: () => {},
  recordActivity: async () => defaultStreak,
  refreshStreak: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<UserStreak>(defaultStreak);

  const updateLocalProfile = (newProfile: { full_name?: string; target_job_role?: string; email?: string }) => {
    setProfile((prev: any) => ({
      ...prev,
      ...(newProfile.full_name !== undefined ? { full_name: newProfile.full_name } : {}),
      ...(newProfile.target_job_role !== undefined ? { target_job_role: newProfile.target_job_role } : {}),
    }));
    setUser((prev: any) => ({
      ...prev,
      ...(newProfile.email ? { email: newProfile.email } : {}),
      user_metadata: {
        ...(prev?.user_metadata || {}),
        ...(newProfile.full_name ? { full_name: newProfile.full_name } : {}),
        ...(newProfile.target_job_role ? { target_role: newProfile.target_job_role } : {}),
      },
    }));
  };

  // Helper to load profile from Supabase db or user metadata
  const resolveProfile = async (sessionUser: any) => {
    if (!sessionUser) return null;

    try {
      // 1. Check student_profiles table in Supabase
      const { data: dbProfile, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", sessionUser.id)
        .maybeSingle();

      if (dbProfile && dbProfile.full_name) {
        return {
          full_name: dbProfile.full_name,
          target_job_role: dbProfile.target_job_role || sessionUser.user_metadata?.target_role,
        };
      }
    } catch (err) {
      // Ignore network/connection issues in local fallback
    }

    // 2. Fall back to user_metadata or email name
    const metaName = sessionUser.user_metadata?.full_name;
    const emailName = sessionUser.email ? sessionUser.email.split("@")[0] : null;
    const finalName = metaName || (emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : "");

    return {
      full_name: finalName,
      target_job_role: sessionUser.user_metadata?.target_role,
    };
  };

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const prof = await resolveProfile(session.user);
          setProfile(prof);
          if (prof?.full_name && typeof window !== "undefined") {
            localStorage.setItem("preppilot_user", JSON.stringify({ email: session.user.email, full_name: prof.full_name }));
          }
        } else if (typeof window !== "undefined") {
          // Check local stored session for persistent demo accounts
          const cached = localStorage.getItem("preppilot_user");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.full_name) {
                setUser({ email: parsed.email, user_metadata: { full_name: parsed.full_name } });
                setProfile({ full_name: parsed.full_name, target_job_role: parsed.target_role });
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("preppilot_user");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.full_name) {
                setUser({ email: parsed.email, user_metadata: { full_name: parsed.full_name } });
                setProfile({ full_name: parsed.full_name, target_job_role: parsed.target_role });
              }
            } catch (e) {}
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const refreshUserStreak = async (uId: string) => {
      if (!uId) {
        setStreak(defaultStreak);
        return;
      }
      const s = await fetchUserStreak(uId);
      setStreak(s);
    };

    const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("preppilot_user") || "{}").email || "demo-candidate" : "demo-candidate");
    refreshUserStreak(effectiveUserId);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await resolveProfile(session.user);
        setProfile(prof);
        if (prof?.full_name && typeof window !== "undefined") {
          localStorage.setItem("preppilot_user", JSON.stringify({ email: session.user.email, full_name: prof.full_name }));
        }
        refreshUserStreak(session.user.id);
      } else {
        if (_event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setStreak(defaultStreak);
          if (typeof window !== "undefined") {
            localStorage.removeItem("preppilot_user");
          }
        }
      }
      setLoading(false);
    });

    const handleStreakEvent = (e: any) => {
      if (e.detail) {
        setStreak(e.detail);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("preppilot_streak_updated", handleStreakEvent);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("preppilot_streak_updated", handleStreakEvent);
      }
    };
  }, []);

  const refreshStreak = useCallback(async () => {
    const uId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("preppilot_user") || "{}").email || "demo-candidate" : "demo-candidate");
    if (uId) {
      const s = await fetchUserStreak(uId);
      setStreak(s);
    }
  }, [user]);

  const recordActivity = useCallback(async (activityType: QualifyingActivityType) => {
    const uId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("preppilot_user") || "{}").email || "demo-candidate" : "demo-candidate");
    const updated = await recordQualifyingActivity(uId, activityType);
    setStreak(updated);
    return updated;
  }, [user]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setProfile(null);
    setStreak(defaultStreak);
    if (typeof window !== "undefined") {
      localStorage.removeItem("preppilot_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, streak, logout, updateLocalProfile, recordActivity, refreshStreak }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
