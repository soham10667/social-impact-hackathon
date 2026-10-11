import { supabase } from "./supabase";

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null; // "YYYY-MM-DD"
  updated_at?: string;
}

export type QualifyingActivityType = 
  | "mock_interview"
  | "technical_assessment"
  | "coding_arena"
  | "learning_roadmap";

/**
 * Returns today's calendar date in local time as "YYYY-MM-DD"
 */
export function getLocalTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Difference in full calendar days between two "YYYY-MM-DD" strings (d1 - d2).
 */
export function getDayDifference(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc1 - utc2) / msPerDay);
}

const LOCAL_STORAGE_KEY_PREFIX = "preppilot_streak_";

function getLocalStoredStreak(userId: string): UserStreak {
  if (typeof window === "undefined") {
    return {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
    };
  }
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user_id: userId,
        current_streak: typeof parsed.current_streak === "number" ? parsed.current_streak : 0,
        longest_streak: typeof parsed.longest_streak === "number" ? parsed.longest_streak : 0,
        last_activity_date: parsed.last_activity_date || null,
        updated_at: parsed.updated_at,
      };
    }
  } catch (err) {}

  return {
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
  };
}

function saveLocalStoredStreak(streak: UserStreak): void {
  if (typeof window === "undefined" || !streak.user_id) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${streak.user_id}`, JSON.stringify(streak));
  } catch (err) {}
}

/**
 * Fetches the user's current streak from Supabase (with fallback to local storage).
 * Evaluates whether a calendar day was missed and adjusts current_streak if so.
 */
export async function fetchUserStreak(userId: string): Promise<UserStreak> {
  if (!userId) {
    return {
      user_id: "",
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
    };
  }

  let streakData: UserStreak | null = null;

  try {
    const { data, error } = await supabase
      .from("user_streaks")
      .select("user_id, current_streak, longest_streak, last_activity_date, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      streakData = {
        user_id: data.user_id,
        current_streak: data.current_streak ?? 0,
        longest_streak: data.longest_streak ?? 0,
        last_activity_date: data.last_activity_date ?? null,
        updated_at: data.updated_at,
      };
    }
  } catch (err) {
    // Network or table not present fallback
  }

  if (!streakData) {
    streakData = getLocalStoredStreak(userId);
  }

  // Check if a full calendar day was missed
  const today = getLocalTodayDateString();
  if (streakData.last_activity_date) {
    const diff = getDayDifference(today, streakData.last_activity_date);
    // diff === 0 => today
    // diff === 1 => yesterday (streak still active)
    // diff > 1 => missed one or more days, streak resets to 0
    if (diff > 1 && streakData.current_streak > 0) {
      streakData.current_streak = 0;
      saveLocalStoredStreak(streakData);
      // Try to sync broken streak status in Supabase
      try {
        await supabase
          .from("user_streaks")
          .update({
            current_streak: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } catch {}
    }
  } else {
    // Never had an activity -> 0
    streakData.current_streak = 0;
  }

  saveLocalStoredStreak(streakData);
  return streakData;
}

/**
 * Records a qualifying activity and updates streak atomically.
 * Rules:
 * - Same calendar day: ignore duplicate increment.
 * - Next consecutive calendar day: current_streak += 1.
 * - Missed 1+ days or first activity: current_streak = 1.
 * - longest_streak = Math.max(longest_streak, current_streak).
 */
export async function recordQualifyingActivity(
  userId: string,
  activityType: QualifyingActivityType
): Promise<UserStreak> {
  if (!userId) {
    return {
      user_id: "",
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
    };
  }

  const today = getLocalTodayDateString();
  const nowIso = new Date().toISOString();

  // 1. Fetch current streak state
  const current = await fetchUserStreak(userId);

  // If already active today, do not increment streak again
  if (current.last_activity_date === today) {
    // Record activity entry in user_daily_activity table
    try {
      await supabase.from("user_daily_activity").insert({
        user_id: userId,
        activity_date: today,
        activity_type: activityType,
        created_at: nowIso,
      });
    } catch {}

    return current;
  }

  // 2. Calculate new streak numbers
  let newCurrentStreak = 1;
  if (current.last_activity_date) {
    const diff = getDayDifference(today, current.last_activity_date);
    if (diff === 1) {
      // Consecutive day!
      newCurrentStreak = (current.current_streak || 0) + 1;
    } else {
      // Missed one or more days, starts fresh at 1
      newCurrentStreak = 1;
    }
  } else {
    // First activity ever
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(current.longest_streak || 0, newCurrentStreak);

  const updatedStreak: UserStreak = {
    user_id: userId,
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_activity_date: today,
    updated_at: nowIso,
  };

  // 3. Persist to localStorage immediately
  saveLocalStoredStreak(updatedStreak);

  // 4. Record daily activity and upsert streak in Supabase
  try {
    await supabase.from("user_daily_activity").insert({
      user_id: userId,
      activity_date: today,
      activity_type: activityType,
      created_at: nowIso,
    });
  } catch {}

  try {
    await supabase.from("user_streaks").upsert(
      {
        user_id: userId,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        updated_at: nowIso,
      },
      { onConflict: "user_id" }
    );
  } catch {}

  // Trigger custom window event so all open components re-render the streak immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("preppilot_streak_updated", {
        detail: updatedStreak,
      })
    );
  }

  return updatedStreak;
}
