import type { DinnerDish } from "../types/dinner";

export type RelatedDish = {
  dish: DinnerDish;
  relevance: number;
};

const keywords = [
  "牛肉",
  "鸡肉",
  "鸡腿",
  "虾",
  "海鲜",
  "鱼",
  "猪肉",
  "汤",
  "咖喱",
  "黑椒",
  "酸甜",
  "椒麻",
  "辣",
  "菌菇",
  "蘑菇",
  "豆腐",
  "冬瓜",
  "萝卜",
  "番茄",
  "土豆",
  "芦笋",
  "下饭",
  "清淡",
  "快手",
  "高蛋白",
  "空气炸锅",
  "日式",
  "川味",
  "干锅",
  "红烧",
  "炖",
  "焗饭",
];

function textForDish(dish: DinnerDish) {
  return [dish.name, dish.description, ...dish.recommendationReason, ...dish.tags].join(" ");
}

function keywordSet(dish: DinnerDish) {
  const text = textForDish(dish);
  return new Set(keywords.filter((keyword) => text.includes(keyword)));
}

function proteinSet(dish: DinnerDish) {
  return new Set(dish.ingredients.filter((item) => item.category === "protein").map((item) => item.name));
}

export function getRelatedDishes(currentDish: DinnerDish, dishes: DinnerDish[], limit = 6): RelatedDish[] {
  const currentTags = new Set(currentDish.tags);
  const currentKeywords = keywordSet(currentDish);
  const currentProteins = proteinSet(currentDish);

  return dishes
    .filter((dish) => dish.id !== currentDish.id)
    .map((dish) => {
      const tagScore = dish.tags.reduce((score, tag) => score + (currentTags.has(tag) ? 14 : 0), 0);
      const keywordScore = Array.from(keywordSet(dish)).reduce(
        (score, keyword) => score + (currentKeywords.has(keyword) ? 8 : 0),
        0,
      );
      const proteinScore = Array.from(proteinSet(dish)).some((protein) => currentProteins.has(protein)) ? 18 : 0;
      const weatherScore = dish.weatherContext.condition === currentDish.weatherContext.condition ? 4 : 0;

      return {
        dish,
        relevance: tagScore + keywordScore + proteinScore + weatherScore,
      };
    })
    .sort((a, b) => b.relevance - a.relevance || b.dish.recommendationScore - a.dish.recommendationScore)
    .slice(0, limit);
}
