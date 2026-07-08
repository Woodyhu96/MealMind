import { Copy, RotateCcw } from "lucide-react";
import type { DinnerDish } from "../types/dinner";
import { categoryLabels, groupCombinedShoppingList } from "../utils/shoppingList";

type DinnerSummaryProps = {
  dishes: DinnerDish[];
  nutritionMode: boolean;
  onRestart: () => void;
};

export function DinnerSummary({ dishes, nutritionMode, onRestart }: DinnerSummaryProps) {
  const shoppingGroups = groupCombinedShoppingList(dishes);
  const totalNutrition = dishes.reduce(
    (total, dish) => ({
      calories: total.calories + dish.nutrition.calories,
      proteinG: total.proteinG + dish.nutrition.proteinG,
      fatG: total.fatG + dish.nutrition.fatG,
      carbsG: total.carbsG + dish.nutrition.carbsG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );

  const copyPlan = async () => {
    const shoppingList = Object.entries(shoppingGroups)
      .map(([category, items]) => {
        const lines = items.map((item) => `- ${item.name}: ${item.amount}`).join("\n");
        return `${categoryLabels[category as keyof typeof categoryLabels]}\n${lines}`;
      })
      .join("\n\n");

    const dishPlans = dishes
      .map((dish) => `${dish.name}\n${dish.description}\n${dish.instructions.map((step, index) => `${index + 1}. ${step}`).join("\n")}`)
      .join("\n\n");

    await navigator.clipboard.writeText(
      `Tonight's Dinner\n\n${dishes.map((dish) => `- ${dish.name}`).join("\n")}\n\n${dishPlans}\n\n${shoppingList}`,
    );
  };

  return (
    <section className="pb-3">
      <div className="rounded-[36px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Tonight's Dinner</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">今晚开饭</h1>
        <p className="mt-4 text-lg leading-8">
          {dishes.length} 道菜：{dishes.map((dish) => dish.name).join("、")}
        </p>

        {nutritionMode && (
          <div className="mt-4 rounded-[26px] bg-paper p-4">
            <p className="text-sm font-bold">营养摘要</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              约 {totalNutrition.calories} kcal，蛋白质 {totalNutrition.proteinG}g，脂肪 {totalNutrition.fatG}g，碳水{" "}
              {totalNutrition.carbsG}g。
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[32px] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Shopping List</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(shoppingGroups).map(([category, items]) => (
            <div key={category}>
              <p className="text-sm font-bold text-muted">{categoryLabels[category as keyof typeof categoryLabels]}</p>
              <div className="mt-2 grid gap-2">
                {items.map((item) => (
                  <div key={`${item.name}-${item.amount}`} className="flex justify-between rounded-2xl bg-paper px-4 py-3 text-sm">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[32px] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Cooking</h2>
        <div className="mt-4 space-y-5">
          {dishes.map((dish) => (
            <section key={dish.id} className="rounded-[26px] bg-paper p-4">
              <h3 className="text-lg font-bold text-ink">{dish.name}</h3>
              <div className="mt-3 space-y-3">
                {dish.instructions.map((step, index) => (
                  <div key={`${dish.id}-${step}`} className="flex gap-3 rounded-2xl bg-white p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-ink">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="sticky bottom-3 mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={copyPlan}
          className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-sm font-bold text-ink shadow-soft"
        >
          <Copy size={18} />
          复制晚餐计划
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-4 text-sm font-bold text-white shadow-soft"
        >
          <RotateCcw size={18} />
          返回重新推荐
        </button>
      </div>
    </section>
  );
}
