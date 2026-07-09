import { Sparkles } from "lucide-react";
import type { RelatedDish } from "../utils/relatedDishes";

type RelatedDishRailProps = {
  relatedDishes: RelatedDish[];
  onSelectDish: (dishId: string) => void;
};

const gradients = [
  "linear-gradient(135deg, rgba(240,127,99,0.95), rgba(246,215,122,0.95))",
  "linear-gradient(135deg, rgba(241,145,106,0.88), rgba(246,215,122,0.82))",
  "linear-gradient(135deg, rgba(246,215,122,0.84), rgba(207,229,213,0.9))",
  "linear-gradient(135deg, rgba(207,229,213,0.9), rgba(138,197,216,0.82))",
  "linear-gradient(135deg, rgba(138,197,216,0.72), rgba(255,255,255,0.92))",
  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,247,0.95))",
];

export function RelatedDishRail({ relatedDishes, onSelectDish }: RelatedDishRailProps) {
  return (
    <section className="related-rail rounded-[30px] bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <Sparkles size={16} />
            猜你想吃
          </p>
          <p className="mt-1 text-xs font-medium text-muted">越靠前越像你现在想吃的</p>
        </div>
        <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">按口味排好</span>
      </div>

      <div className="related-list mt-4 flex gap-2 overflow-x-auto pb-1">
        {relatedDishes.map(({ dish, relevance }, index) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => onSelectDish(dish.id)}
            className="related-button min-w-[142px] rounded-[22px] px-4 py-3 text-left text-sm font-bold text-ink shadow-sm"
            style={{ background: gradients[index] ?? gradients[gradients.length - 1] }}
          >
            <span className="block leading-5">{dish.name}</span>
            <span className="mt-2 block text-[0.68rem] font-bold text-ink/55">{getRelatedCue(dish, relevance, index)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function getRelatedCue({ tags }: RelatedDish["dish"], relevance: number, index: number) {
  if (index === 0) {
    return "最像这口!";
  }

  if (tags.some((tag) => ["清淡", "爽口", "素菜"].includes(tag))) {
    return "爽口搭配!";
  }

  if (tags.some((tag) => ["辣", "下饭", "黑椒", "咖喱"].includes(tag))) {
    return "很下饭!";
  }

  if (tags.some((tag) => ["汤", "暖胃"].includes(tag))) {
    return "暖暖的!";
  }

  if (tags.some((tag) => ["高蛋白", "牛肉", "鸡肉", "虾"].includes(tag))) {
    return "补点能量!";
  }

  if (relevance > 75) {
    return "最佳搭配!";
  }

  if (relevance > 60) {
    return "人气菜品!";
  }

  return "换个口味!";
}
