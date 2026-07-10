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

function hasSharedProtein(dish: DinnerDish, selectedProteins: Set<string>) {
  return Array.from(proteinSet(dish)).some((protein) => selectedProteins.has(protein));
}

function hasProtein(dish: DinnerDish) {
  return proteinSet(dish).size > 0 && !dish.tags.includes("素菜");
}

function hasSoup(dish: DinnerDish) {
  return dish.tags.includes("汤");
}

function hasVegetableDish(dish: DinnerDish) {
  return dish.tags.includes("素菜");
}

function coursePriority(dish: DinnerDish) {
  if (hasProtein(dish) && !hasSoup(dish) && !hasVegetableDish(dish)) return 0;
  if (hasVegetableDish(dish)) return 1;
  if (hasSoup(dish)) return 2;
  return 3;
}

function menuBalanceScore(dish: DinnerDish, selectedDishes: DinnerDish[]) {
  if (selectedDishes.length === 0) {
    return 0;
  }

  const selectedProteins = new Set(selectedDishes.flatMap((selectedDish) => Array.from(proteinSet(selectedDish))));
  const sameProteinPenalty = hasSharedProtein(dish, selectedProteins) ? -26 : 0;
  const selectedHasProtein = selectedDishes.some(hasProtein);
  const selectedHasSoup = selectedDishes.some(hasSoup);
  const selectedHasVegetable = selectedDishes.some(hasVegetableDish);
  const proteinBoost = (selectedHasSoup || selectedHasVegetable) && hasProtein(dish) ? 20 : 0;
  const soupBoost = (selectedHasProtein || selectedHasVegetable) && hasSoup(dish) ? 24 : 0;
  const vegetableBoost = (selectedHasProtein || selectedHasSoup) && hasVegetableDish(dish) ? 22 : 0;
  const lightBoost = dish.tags.includes("清淡") ? 8 : 0;

  return sameProteinPenalty + proteinBoost + soupBoost + vegetableBoost + lightBoost;
}

export function getRelatedDishes(
  currentDish: DinnerDish,
  dishes: DinnerDish[],
  limit = 6,
  selectedDishes: DinnerDish[] = [],
): RelatedDish[] {
  const currentTags = new Set(currentDish.tags);
  const currentKeywords = keywordSet(currentDish);
  const currentProteins = proteinSet(currentDish);
  const selectedDishIds = new Set(selectedDishes.map((dish) => dish.id));

  const sortedCandidates = dishes
    .filter((dish) => dish.id !== currentDish.id && !selectedDishIds.has(dish.id))
    .map((dish) => {
      const tagScore = dish.tags.reduce((score, tag) => score + (currentTags.has(tag) ? 14 : 0), 0);
      const keywordScore = Array.from(keywordSet(dish)).reduce(
        (score, keyword) => score + (currentKeywords.has(keyword) ? 8 : 0),
        0,
      );
      const proteinScore = Array.from(proteinSet(dish)).some((protein) => currentProteins.has(protein)) ? 18 : 0;
      const weatherScore = dish.weatherContext.condition === currentDish.weatherContext.condition ? 4 : 0;
      const balanceScore = menuBalanceScore(dish, selectedDishes);

      return {
        dish,
        relevance: tagScore + keywordScore + proteinScore + weatherScore + balanceScore,
      };
    })
    .sort((a, b) => {
      const priorityA = coursePriority(a.dish);
      const priorityB = coursePriority(b.dish);

      return priorityA - priorityB || b.relevance - a.relevance || b.dish.recommendationScore - a.dish.recommendationScore;
    });

  const meatTarget = Math.max(1, Math.ceil(limit * 0.5));
  const vegetableTarget = Math.max(1, Math.ceil(limit * 0.25));
  const soupTarget = Math.max(1, limit - meatTarget - vegetableTarget);
  const groups = [
    sortedCandidates.filter((item) => coursePriority(item.dish) === 0),
    sortedCandidates.filter((item) => coursePriority(item.dish) === 1),
    sortedCandidates.filter((item) => coursePriority(item.dish) === 2),
    sortedCandidates.filter((item) => coursePriority(item.dish) === 3),
  ];
  const selected: RelatedDish[] = [];
  const selectedIds = new Set<string>();
  const addFromGroup = (group: RelatedDish[], target: number) => {
    group.some((item) => {
      if (selected.length >= limit || selected.filter((selectedItem) => group.includes(selectedItem)).length >= target) {
        return true;
      }

      selected.push(item);
      selectedIds.add(item.dish.id);
      return false;
    });
  };

  addFromGroup(groups[0], meatTarget);
  addFromGroup(groups[1], vegetableTarget);
  addFromGroup(groups[2], soupTarget);
  addFromGroup(groups[3], limit);

  sortedCandidates.some((item) => {
    if (selected.length >= limit) {
      return true;
    }

    if (!selectedIds.has(item.dish.id)) {
      selected.push(item);
    }

    return false;
  });

  return selected;
}
