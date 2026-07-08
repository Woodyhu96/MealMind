import { Sparkles } from "lucide-react";
import { Chip } from "./Chip";
import { Toggle } from "./Toggle";

const quickOptions = ["🌶️ 辣一点", "🥩 高蛋白", "⏱️ 30 分钟内", "🍲 想喝汤", "🥗 清淡一点", "🌤️ 适合天气"];

type HomeViewProps = {
  prompt: string;
  selectedChips: string[];
  nutritionMode: boolean;
  onPromptChange: (value: string) => void;
  onToggleChip: (chip: string) => void;
  onNutritionModeChange: (checked: boolean) => void;
  onGenerate: () => void;
};

export function HomeView({
  prompt,
  selectedChips,
  nutritionMode,
  onPromptChange,
  onToggleChip,
  onNutritionModeChange,
  onGenerate,
}: HomeViewProps) {
  return (
    <section className="home-view flex flex-1 flex-col">
      <div className="home-hero pt-3">
        <p className="text-lg font-semibold text-muted">Good Evening, Woody</p>
        <h1 className="mt-3 text-[2.75rem] font-bold leading-[0.98] tracking-normal">今晚想吃点什么？</h1>
      </div>

      <div className="home-controls flex flex-1 flex-col">
        <div className="mt-9 rounded-[32px] bg-white p-4 shadow-soft">
          <textarea
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            rows={4}
            placeholder="比如：今天想吃暖一点、辣一点，但不要太油。"
            className="min-h-32 w-full resize-none bg-transparent text-lg leading-7 text-ink outline-none placeholder:text-muted/70"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {quickOptions.map((option) => (
            <Chip key={option} label={option} selected={selectedChips.includes(option)} onClick={() => onToggleChip(option)} />
          ))}
        </div>

        <div className="mt-6">
          <Toggle checked={nutritionMode} onChange={onNutritionModeChange} label="营养模式" />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-bold text-white shadow-soft transition hover:bg-black active:scale-[0.99]"
        >
          <Sparkles size={20} />
          生成今晚菜单
        </button>
      </div>
    </section>
  );
}
