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

function inferIntentTags(prompt: string, selectedChips: string[]) {
  const text = `${prompt} ${selectedChips.join(" ")}`;
  const intents = new Set<string>();

  if (/辣|spicy|🌶/.test(text)) intents.add("辣");
  if (/蛋白|protein|牛肉|鸡肉|虾|🥩/.test(text)) intents.add("高蛋白");
  if (/汤|soup|🍲/.test(text)) intents.add("汤");
  if (/清淡|轻|低负担|🥗/.test(text)) intents.add("清淡");
  if (/快|30|分钟|⏱/.test(text)) intents.add("快手");
  if (/天气|冷|雨|暖|🌤/.test(text)) intents.add("暖胃");
  if (/酸甜|糖醋/.test(text)) intents.add("酸甜");
  if (/黑椒/.test(text)) intents.add("黑椒");
  if (/咖喱/.test(text)) intents.add("咖喱");
  if (/海鲜|虾|鱼/.test(text)) intents.add("海鲜");

  return intents;
}

export function rankDishesByLocalPrediction(
  dishes: DinnerDish[],
  preferences: PreferenceState,
  nutritionMode: boolean,
  prompt: string,
  selectedChips: string[],
) {
  const intentTags = inferIntentTags(prompt, selectedChips);

  return [...dishes].sort((a, b) => {
    const intentScoreA = a.tags.reduce((score, tag) => score + (intentTags.has(tag) ? 16 : 0), 0);
    const intentScoreB = b.tags.reduce((score, tag) => score + (intentTags.has(tag) ? 16 : 0), 0);

    return (
      scoreDish(b, preferences, nutritionMode) +
      intentScoreB -
      (scoreDish(a, preferences, nutritionMode) + intentScoreA)
    );
  });
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
