import { CloudSun, RefreshCw, Star, ThumbsDown, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DinnerDish, WeatherProfile } from "../types/dinner";
import { RelatedDishRail } from "./RelatedDishRail";
import type { RelatedDish } from "../utils/relatedDishes";

type DishCardProps = {
  dish: DinnerDish;
  nutritionMode: boolean;
  onDislike: () => void;
  onNext: () => void;
  onConfirm: () => void;
  relatedDishes: RelatedDish[];
  onSelectRelatedDish: (dishId: string) => void;
  onRefreshRelatedDishes: () => void;
  favorite: boolean;
  onToggleFavorite: () => void;
  weatherProfile: WeatherProfile;
};

export function DishCard({
  dish,
  nutritionMode,
  onDislike,
  onNext,
  onConfirm,
  relatedDishes,
  onSelectRelatedDish,
  onRefreshRelatedDishes,
  favorite,
  onToggleFavorite,
  weatherProfile,
}: DishCardProps) {
  const [confirming, setConfirming] = useState(false);
  const badge = getDishBadge(dish);

  useEffect(() => {
    setConfirming(false);
  }, [dish.id]);

  const handleConfirm = () => {
    if (confirming) {
      return;
    }

    setConfirming(true);
    onConfirm();
    window.setTimeout(() => setConfirming(false), 1100);
  };

  return (
    <section className="dish-view flex flex-1 flex-col">
      <div
        className={`dish-card-surface touch-pan-y rounded-[34px] border bg-white p-5 shadow-soft ${
          confirming ? "is-confirming border-sage" : "border-transparent"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-muted">为你推荐</p>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h1 className="min-w-0 text-4xl font-bold leading-tight">{dish.name}</h1>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                aria-label={favorite ? "Remove favorite dish" : "Favorite dish"}
                onClick={onToggleFavorite}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition active:scale-[0.96] ${
                  favorite ? "border-citrus text-citrus" : "border-line text-muted"
                }`}
              >
                <Star size={21} fill={favorite ? "currentColor" : "none"} />
              </button>
              <div className="shrink-0 rounded-2xl bg-sage px-3 py-2 text-center">
                <p className="text-sm font-bold text-ink">{badge}</p>
              </div>
            </div>
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
            {weatherProfile.reason}
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

      <div className="dish-actions mt-auto grid grid-cols-3 gap-2 pt-5">
        <ActionButton label="不喜欢" onClick={onDislike} tone="light" icon={<ThumbsDown size={19} />} />
        <ActionButton label="换一道" onClick={onNext} tone="light" icon={<RefreshCw size={19} />} />
        <ActionButton label="就吃这个" onClick={handleConfirm} tone={confirming ? "success" : "dark"} icon={<Utensils size={19} />} />
      </div>

      <div className="related-rail-wrapper pt-4">
        <RelatedDishRail
          relatedDishes={relatedDishes}
          onSelectDish={onSelectRelatedDish}
          onRefresh={onRefreshRelatedDishes}
        />
      </div>
    </section>
  );
}

function getDishBadge(dish: DinnerDish) {
  if (dish.tags.some((tag) => ["清淡", "素菜", "爽口"].includes(tag))) {
    return "爽口!";
  }

  if (dish.tags.some((tag) => ["主食", "米饭", "面"].includes(tag))) {
    return "很管饱!";
  }

  if (dish.tags.some((tag) => ["下饭", "辣", "黑椒", "咖喱"].includes(tag))) {
    return "很下饭!";
  }

  if (dish.tags.some((tag) => ["汤", "暖胃"].includes(tag))) {
    return "暖胃!";
  }

  if (dish.tags.some((tag) => ["高蛋白", "牛肉", "鸡肉", "虾"].includes(tag))) {
    return "元气菜!";
  }

  return dish.recommendationScore >= 90 ? "人气菜品!" : "最佳搭配!";
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
  tone: "light" | "dark" | "success";
  onClick: () => void;
}) {
  const className =
    tone === "dark"
      ? "bg-ink text-white"
      : tone === "success"
        ? "bg-sage text-ink"
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
