import type { DinnerDish, PreferenceState, WeatherProfile } from "../types/dinner";
import { weatherScoreForDish } from "./weatherAdaptation";

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
  if (/蛋白|protein|牛肉|鸡肉|虾|鱼|海鲜|运动|💪|🥩|🍗|🦐|🐟/.test(text)) intents.add("高蛋白");
  if (/汤|soup|🍲/.test(text)) intents.add("汤");
  if (/清淡|轻|低负担|不要肉|素|🥗|🥬/.test(text)) intents.add("清淡");
  if (/快|30|分钟|省事|⏱|⚡/.test(text)) intents.add("快手");
  if (/天气|冷|雨|暖|🌤/.test(text)) intents.add("暖胃");
  if (/酸甜|糖醋/.test(text)) intents.add("酸甜");
  if (/黑椒|🫙/.test(text)) intents.add("黑椒");
  if (/咖喱|🍛/.test(text)) intents.add("咖喱");
  if (/海鲜|虾|鱼|🦐|🐟/.test(text)) intents.add("海鲜");
  if (/下饭|🍚/.test(text)) intents.add("下饭");
  if (/晚点|轻松|🌙/.test(text)) intents.add("清淡");

  return intents;
}

function textForDish(dish: DinnerDish) {
  return [dish.name, dish.description, ...dish.tags, ...dish.ingredients.map((ingredient) => ingredient.name)].join(" ");
}

function flavorTextForDish(dish: DinnerDish) {
  return [dish.name, dish.description, ...dish.tags].join(" ");
}

function proteinTextForDish(dish: DinnerDish) {
  return [dish.name, ...dish.tags, ...dish.ingredients.map((ingredient) => ingredient.name)].join(" ");
}

function selectedProteinTerms(prompt: string, selectedChips: string[]) {
  const text = `${prompt} ${selectedChips.join(" ")}`;
  const terms: string[] = [];

  if (/牛肉|牛排|🥩/.test(text)) terms.push("牛肉", "牛排", "牛骨", "牛肋", "牛排骨");
  if (/鸡肉|鸡腿|鸡胸|鸡翅|鸡丁|🍗/.test(text)) terms.push("鸡肉", "鸡腿", "鸡胸", "鸡翅", "鸡丁");
  if (/虾|海鲜|🦐/.test(text)) terms.push("虾", "海鲜", "花甲", "海蛎", "干贝");
  if (/鱼|🐟/.test(text)) terms.push("鱼", "鲈鱼");
  if (/鸡蛋|蛋|🥚/.test(text)) terms.push("鸡蛋", "蛋");

  return terms;
}

function selectedPreferenceScore(dish: DinnerDish, prompt: string, selectedChips: string[]) {
  const requestText = `${prompt} ${selectedChips.join(" ")}`;
  const dishText = textForDish(dish);
  const flavorText = flavorTextForDish(dish);
  const proteinTerms = selectedProteinTerms(prompt, selectedChips);
  let score = 0;

  if (proteinTerms.length > 0 && proteinTerms.some((term) => dishText.includes(term))) {
    score += 96;
  }

  const explicitMatches: Array<[RegExp, RegExp, number]> = [
    [/辣|spicy|🌶/, /辣|麻辣|香辣|酸辣|水煮|干锅/, 72],
    [/清淡|轻|低负担|🥗/, /清淡|爽口|凉拌|蒸|白灼/, 58],
    [/汤|soup|🍲/, /汤|羹|煲/, 58],
    [/蒜香|蒜|🧄/, /蒜|蒜蓉|蒜香/, 52],
    [/黑椒|🫙/, /黑椒/, 52],
    [/咖喱|🍛/, /咖喱/, 52],
    [/酸甜|糖醋/, /酸甜|糖醋|番茄|茄汁/, 52],
    [/下饭|🍚/, /下饭|红烧|干锅|辣|咖喱/, 44],
    [/快|30|分钟|省事|⏱|⚡/, /快手|快炒|凉拌|白灼|蒸/, 44],
  ];

  explicitMatches.forEach(([requestPattern, dishPattern, value]) => {
    if (requestPattern.test(requestText) && dishPattern.test(flavorText)) {
      score += value;
    }
  });

  if (/不要肉|素|🥬/.test(requestText)) {
    score += dish.tags.includes("素菜") || !hasProteinDish(dish) ? 96 : -120;
  }

  return score;
}

function hasProteinDish(dish: DinnerDish) {
  return dish.ingredients.some((ingredient) => ingredient.category === "protein") && !dish.tags.includes("素菜");
}

function coursePriority(dish: DinnerDish) {
  const isSoup = dish.tags.includes("汤");
  const isVegetable = dish.tags.includes("素菜");

  if (hasProteinDish(dish) && !isSoup && !isVegetable) return 0;
  if (isVegetable) return 1;
  if (isSoup) return 2;
  return 3;
}

function requestCoursePriority(dish: DinnerDish, prompt: string, selectedChips: string[]) {
  const requestText = `${prompt} ${selectedChips.join(" ")}`;
  const dishText = proteinTextForDish(dish);
  const proteinTerms = selectedProteinTerms(prompt, selectedChips);
  const wantsNoMeat = /不要肉|素|🥬/.test(requestText);
  const isSoup = dish.tags.includes("汤");
  const isVegetable = dish.tags.includes("素菜");
  const matchesRequestedProtein = proteinTerms.some((term) => dishText.includes(term));

  if (wantsNoMeat) {
    if (isVegetable) return 0;
    if (isSoup) return 1;
    return 2 + coursePriority(dish);
  }

  if (proteinTerms.length > 0) {
    if (matchesRequestedProtein && !isSoup && !isVegetable) return 0;
    return 1 + coursePriority(dish);
  }

  return coursePriority(dish);
}

export function rankDishesByLocalPrediction(
  dishes: DinnerDish[],
  preferences: PreferenceState,
  nutritionMode: boolean,
  prompt: string,
  selectedChips: string[],
  weather?: WeatherProfile,
) {
  const intentTags = inferIntentTags(prompt, selectedChips);

  return [...dishes].sort((a, b) => {
    const intentScoreA = a.tags.reduce((score, tag) => score + (intentTags.has(tag) ? 16 : 0), 0);
    const intentScoreB = b.tags.reduce((score, tag) => score + (intentTags.has(tag) ? 16 : 0), 0);
    const selectedPreferenceScoreA = selectedPreferenceScore(a, prompt, selectedChips);
    const selectedPreferenceScoreB = selectedPreferenceScore(b, prompt, selectedChips);
    const weatherScoreA = weather ? Math.round(weatherScoreForDish(a, weather) * 0.35) : 0;
    const weatherScoreB = weather ? Math.round(weatherScoreForDish(b, weather) * 0.35) : 0;
    const priorityA = requestCoursePriority(a, prompt, selectedChips);
    const priorityB = requestCoursePriority(b, prompt, selectedChips);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    if (selectedPreferenceScoreA !== selectedPreferenceScoreB) {
      return selectedPreferenceScoreB - selectedPreferenceScoreA;
    }

    return (
      scoreDish(b, preferences, nutritionMode) +
      weatherScoreB +
      intentScoreB -
      (scoreDish(a, preferences, nutritionMode) + intentScoreA + weatherScoreA)
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
