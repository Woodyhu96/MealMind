import type { DinnerDish, IngredientCategory } from "../types/dinner";

export const categoryLabels: Record<IngredientCategory, string> = {
  protein: "肉类 / 蛋白质",
  vegetable: "蔬菜",
  carb: "主食",
  seasoning: "调味料",
  other: "其他",
};

export function groupShoppingList(dish: DinnerDish) {
  return dish.ingredients.reduce(
    (groups, ingredient) => {
      groups[ingredient.category].push(ingredient);
      return groups;
    },
    {
      protein: [],
      vegetable: [],
      carb: [],
      seasoning: [],
      other: [],
    } as Record<IngredientCategory, DinnerDish["ingredients"]>,
  );
}
