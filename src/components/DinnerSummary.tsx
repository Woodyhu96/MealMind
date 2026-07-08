import { Copy, RotateCcw } from "lucide-react";
import type { DinnerDish } from "../types/dinner";
import { categoryLabels, groupShoppingList } from "../utils/shoppingList";

type DinnerSummaryProps = {
  dish: DinnerDish;
  nutritionMode: boolean;
  onRestart: () => void;
};

export function DinnerSummary({ dish, nutritionMode, onRestart }: DinnerSummaryProps) {
  const shoppingGroups = groupShoppingList(dish);

  const copyPlan = async () => {
    const shoppingList = Object.entries(shoppingGroups)
      .map(([category, items]) => {
        const lines = items.map((item) => `- ${item.name}: ${item.amount}`).join("\n");
        return `${categoryLabels[category as keyof typeof categoryLabels]}\n${lines}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(
      `Tonight's Dinner: ${dish.name}\n\n${dish.description}\n\n${dish.recommendationReason.join("\n")}\n\n${shoppingList}`,
    );
  };

  return (
    <section className="pb-3">
      <div className="rounded-[36px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Tonight's Dinner</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{dish.name}</h1>
        <p className="mt-4 text-lg leading-8">{dish.description}</p>

        {nutritionMode && (
          <div className="mt-4 rounded-[26px] bg-paper p-4">
            <p className="text-sm font-bold">营养摘要</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              约 {dish.nutrition.calories} kcal，蛋白质 {dish.nutrition.proteinG}g，脂肪 {dish.nutrition.fatG}g，碳水{" "}
              {dish.nutrition.carbsG}g。
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
        <div className="mt-4 space-y-3">
          {dish.instructions.map((step, index) => (
            <div key={step} className="flex gap-3 rounded-2xl bg-paper p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-ink">{step}</p>
            </div>
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
