import { useCallback, useEffect, useState } from "react";
import type { DinnerDish, PreferenceState } from "../types/dinner";
import { applyDishFeedback, emptyPreferences } from "../utils/preferenceEngine";

const STORAGE_KEY = "ai-dinner-planner.preferences.v1";

function readPreferences(): PreferenceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyPreferences, ...JSON.parse(raw) } : emptyPreferences;
  } catch {
    return emptyPreferences;
  }
}

export function useLocalPreferences() {
  const [preferences, setPreferences] = useState<PreferenceState>(() => readPreferences());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const recordFeedback = useCallback((dish: DinnerDish, feedback: "like" | "dislike") => {
    setPreferences((current) => {
      const next = applyDishFeedback(current, dish, feedback);
      console.info("[AI Dinner Planner] Preference updated", next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(emptyPreferences);
  }, []);

  return { preferences, recordFeedback, resetPreferences };
}
