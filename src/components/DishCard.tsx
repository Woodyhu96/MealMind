import { CloudSun, Heart, RefreshCw, ThumbsDown, Utensils } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";
import type { DinnerDish } from "../types/dinner";
import { RelatedDishRail } from "./RelatedDishRail";
import type { RelatedDish } from "../utils/relatedDishes";

type DishCardProps = {
  dish: DinnerDish;
  nutritionMode: boolean;
  onLike: () => void;
  onDislike: () => void;
  onNext: () => void;
  onConfirm: () => void;
  relatedDishes: RelatedDish[];
  onSelectRelatedDish: (dishId: string) => void;
};

export function DishCard({
  dish,
  nutritionMode,
  onLike,
  onDislike,
  onNext,
  onConfirm,
  relatedDishes,
  onSelectRelatedDish,
}: DishCardProps) {
  const swipeStartX = useRef<number | null>(null);

  const handlePointerUp = (x: number) => {
    if (swipeStartX.current === null) {
      return;
    }

    const delta = x - swipeStartX.current;
    swipeStartX.current = null;

    if (delta > 72) {
      onLike();
    }

    if (delta < -72) {
      onDislike();
    }
  };

  return (
    <section className="dish-view flex flex-1 flex-col">
      <div
        className="dish-card-surface touch-pan-y rounded-[34px] bg-white p-5 shadow-soft"
        onPointerDown={(event) => {
          swipeStartX.current = event.clientX;
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
        onPointerUp={(event) => handlePointerUp(event.clientX)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">
              {dish.weatherContext.location} {dish.weatherContext.temperatureC}°C {dish.weatherContext.condition}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">{dish.name}</h1>
          </div>
          <div className="rounded-2xl bg-sage px-3 py-2 text-center">
            <p className="text-xs font-semibold text-muted">Score</p>
            <p className="text-xl font-bold">{dish.recommendationScore}</p>
          </div>
        </div>

        <p className="mt-5 text-lg leading-8 text-ink">{dish.description}</p>

        <div className="mt-5 rounded-[26px] bg-citrus/50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <CloudSun size={17} />
            天气理由
          </p>
          <p className="mt-2 text-sm leading-6 text-ink">
            {dish.weatherContext.location} {dish.weatherContext.temperatureC}°C {dish.weatherContext.condition}，
            {dish.recommendationReason[0]}
          </p>
        </div>

        <div className="mt-5 rounded-[26px] bg-paper p-4">
          <p className="text-sm font-bold text-ink">为什么推荐</p>
          <div className="mt-3 space-y-2">
            {dish.recommendationReason.map((reason) => (
              <p key={reason} className="text-sm leading-6 text-muted">
                {reason}
              </p>
            ))}
          </div>
        </div>

        {nutritionMode && (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <Metric label="kcal" value={dish.nutrition.calories} />
            <Metric label="蛋白" value={`${dish.nutrition.proteinG}g`} />
            <Metric label="脂肪" value={`${dish.nutrition.fatG}g`} />
            <Metric label="碳水" value={`${dish.nutrition.carbsG}g`} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {dish.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ocean/25 px-3 py-1 text-sm font-medium text-ink">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="dish-actions mt-auto grid grid-cols-4 gap-2 pt-5">
        <ActionButton label="不喜欢" onClick={onDislike} tone="light" icon={<ThumbsDown size={19} />} />
        <ActionButton label="喜欢" onClick={onLike} tone="warm" icon={<Heart size={19} />} />
        <ActionButton label="换一道" onClick={onNext} tone="light" icon={<RefreshCw size={19} />} />
        <ActionButton label="就吃这个" onClick={onConfirm} tone="dark" icon={<Utensils size={19} />} />
      </div>

      <div className="related-rail-wrapper pt-4">
        <RelatedDishRail relatedDishes={relatedDishes} onSelectDish={onSelectRelatedDish} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-paper px-2 py-3">
      <p className="text-sm font-bold">{value}</p>
      <p className="mt-1 text-[0.7rem] font-semibold text-muted">{label}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  tone,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  tone: "light" | "warm" | "dark";
  onClick: () => void;
}) {
  const className =
    tone === "dark"
      ? "bg-ink text-white"
      : tone === "warm"
        ? "bg-tomato/90 text-white"
        : "bg-white text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-[24px] px-2 text-xs font-bold shadow-sm transition active:scale-[0.97] ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
