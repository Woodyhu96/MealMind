import type { DinnerDish, PreferenceState } from "../types/dinner";

export const emptyPreferences: PreferenceState = {
  likedDishIds: [],
  dislikedDishIds: [],
  tagScores: {},
};

export function scoreDish(dish: DinnerDish, preferences: PreferenceState, nutritionMode: boolean) {
  const tagScore = dish.tags.reduce((total, tag) => total + (preferences.tagScores[tag] ?? 0), 0);
  const nutritionBoost = nutritionMode ? Math.round(dish.nutrition.proteinG / 8) : 0;
  const dislikedPenalty = preferences.dislikedDishIds.includes(dish.id) ? -18 : 0;
  const likedBoost = preferences.likedDishIds.includes(dish.id) ? 8 : 0;

  return dish.recommendationScore + tagScore + nutritionBoost + dislikedPenalty + likedBoost;
}

export function rankDishes(dishes: DinnerDish[], preferences: PreferenceState, nutritionMode: boolean) {
  return [...dishes].sort((a, b) => scoreDish(b, preferences, nutritionMode) - scoreDish(a, preferences, nutritionMode));
}

export function applyDishFeedback(
  preferences: PreferenceState,
  dish: DinnerDish,
  feedback: "like" | "dislike",
): PreferenceState {
  const delta = feedback === "like" ? 5 : -5;
  const tagScores = { ...preferences.tagScores };

  dish.tags.forEach((tag) => {
    tagScores[tag] = (tagScores[tag] ?? 0) + delta;
  });

  const likedDishIds = new Set(preferences.likedDishIds);
  const dislikedDishIds = new Set(preferences.dislikedDishIds);

  if (feedback === "like") {
    likedDishIds.add(dish.id);
    dislikedDishIds.delete(dish.id);
  } else {
    dislikedDishIds.add(dish.id);
    likedDishIds.delete(dish.id);
  }

  return {
    likedDishIds: Array.from(likedDishIds),
    dislikedDishIds: Array.from(dislikedDishIds),
    tagScores,
  };
}
