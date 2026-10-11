
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchUserStreak,
  recordQualifyingActivity,
  UserStreak,
  QualifyingActivityType,
} from "@/lib/streak";

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  streak: UserStreak;
  logout: () => Promise<void>;
  updateLocalProfile: (newProfile: {
    full_name?: string;
    target_job_role?: string;
    email?: string;
  }) => void;
  recordActivity: (
    activityType: QualifyingActivityType
  ) => Promise<UserStreak>;
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

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<UserStreak>(defaultStreak);

  const updateLocalProfile = (newProfile: {
    full_name?: string;
    target_job_role?: string;
    email?: string;
  }) => {
    setProfile((prev: any) => ({
      ...prev,
      ...(newProfile.full_name !== undefined
        ? { full_name: newProfile.full_name }
        : {}),
      ...(newProfile.target_job_role !== undefined
        ? { target_job_role: newProfile.target_job_role }
        : {}),
    }));

    setUser((prev: any) => ({
      ...prev,
      ...(newProfile.email ? { email: newProfile.email } : {}),
      user_metadata: {
        ...(prev?.user_metadata || {}),
        ...(newProfile.full_name
          ? { full_name: newProfile.full_name }
          : {}),
        ...(newProfile.target_job_role
          ? { target_role: newProfile.target_job_role }
          : {}),
      },
    }));
  };

  // Load a profile using the authenticated user's UUID.
  const resolveProfile = async (sessionUser: any) => {
    if (!sessionUser) return null;

    try {
      const { data: dbProfile } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", sessionUser.id)
        .maybeSingle();

      if (dbProfile?.full_name) {
        return {
          full_name: dbProfile.full_name,
          target_job_role:
            dbProfile.target_job_role ||
            sessionUser.user_metadata?.target_role,
        };
      }
    } catch {
      // Fall back to user metadata if the profile cannot be loaded.
    }

    const metaName = sessionUser.user_metadata?.full_name;
    const emailName = sessionUser.email
      ? sessionUser.email.split("@")[0]
      : null;

    return {
      full_name:
        metaName ||
        (emailName
          ? emailName.charAt(0).toUpperCase() + emailName.slice(1)
          : ""),
      target_job_role: sessionUser.user_metadata?.target_role,
    };
  };

  // Only authenticated Supabase users have a valid database UUID.
  const loadStreak = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setStreak(defaultStreak);
      return;
    }

    try {
      const result = await fetchUserStreak(userId);
      setStreak(result);
    } catch (error) {
      console.error("Unable to load user streak:", error);
      setStreak(defaultStreak);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);

          const prof = await resolveProfile(session.user);
          if (!mounted) return;

          setProfile(prof);

          if (prof?.full_name && typeof window !== "undefined") {
            localStorage.setItem(
              "preppilot_user",
              JSON.stringify({
                email: session.user.email,
                full_name: prof.full_name,
              })
            );
          }

          await loadStreak(session.user.id);
        } else {
          // Local demo accounts must not access UUID-based streak tables.
          setStreak(defaultStreak);

          if (typeof window !== "undefined") {
            const cached = localStorage.getItem("preppilot_user");

            if (cached) {
              try {
                const parsed = JSON.parse(cached);

                if (parsed?.full_name) {
                  setUser({
                    email: parsed.email,
                    user_metadata: {
                      full_name: parsed.full_name,
                    },
                  });

                  setProfile({
                    full_name: parsed.full_name,
                    target_job_role: parsed.target_role,
                  });
                }
              } catch {
                localStorage.removeItem("preppilot_user");
              }
            }
          }
        }
      } catch (error) {
        console.error("Unable to initialize authentication:", error);
        setStreak(defaultStreak);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const sessionUser = session.user;
        setUser(sessionUser);

        // Defer database work until after the auth callback.
        setTimeout(() => {
          if (!mounted) return;

          void (async () => {
            const prof = await resolveProfile(sessionUser);
            if (!mounted) return;

            setProfile(prof);

            if (prof?.full_name && typeof window !== "undefined") {
              localStorage.setItem(
                "preppilot_user",
                JSON.stringify({
                  email: sessionUser.email,
                  full_name: prof.full_name,
                })
              );
            }

            await loadStreak(sessionUser.id);
          })();
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setStreak(defaultStreak);

        if (typeof window !== "undefined") {
          localStorage.removeItem("preppilot_user");
        }
      }

      setLoading(false);
    });

    const handleStreakEvent = (event: Event) => {
      const detail = (event as CustomEvent<UserStreak>).detail;
      if (detail) setStreak(detail);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "preppilot_streak_updated",
        handleStreakEvent
      );
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();

      if (typeof window !== "undefined") {
        window.removeEventListener(
          "preppilot_streak_updated",
          handleStreakEvent
        );
      }
    };
  }, [loadStreak]);

  const refreshStreak = useCallback(async () => {
    // Never use email or demo IDs for database queries.
    if (!user?.id) {
      setStreak(defaultStreak);
      return;
    }

    await loadStreak(user.id);
  }, [user, loadStreak]);

  const recordActivity = useCallback(
    async (activityType: QualifyingActivityType) => {
      if (!user?.id) {
        throw new Error(
          "Please log in with your Supabase account to record activity."
        );
      }

      const updated = await recordQualifyingActivity(
        user.id,
        activityType
      );

      setStreak(updated);
      return updated;
    },
    [user]
  );

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setStreak(defaultStreak);

      if (typeof window !== "undefined") {
        localStorage.removeItem("preppilot_user");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        streak,
        logout,
        updateLocalProfile,
        recordActivity,
        refreshStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
