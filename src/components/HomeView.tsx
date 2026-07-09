import { Sparkles } from "lucide-react";
import { Chip } from "./Chip";
import { Toggle } from "./Toggle";
import type { WeatherProfile } from "../types/dinner";

const onlineQuickOptions = ["🌶️ 辣一点", "🥩 高蛋白", "⏱️ 30 分钟内", "🍲 想喝汤", "🥗 清淡一点", "🌤️ 适合天气"];

const offlineFilterGroups = [
  {
    title: "Protein",
    options: ["🥩 牛肉", "🍗 鸡肉", "🦐 虾/海鲜", "🐟 鱼", "🥚 鸡蛋", "🥬 不要肉"],
  },
  {
    title: "口味",
    options: ["🌶️ 辣一点", "🧄 蒜香", "🫙 黑椒", "🍛 咖喱", "🍅 酸甜", "🥗 清淡一点"],
  },
  {
    title: "心情",
    options: ["🍲 想喝汤", "⚡ 快手省事", "🍚 很下饭", "🌙 晚点轻松吃", "💪 运动后", "🌤️ 适合天气"],
  },
];

type HomeViewProps = {
  prompt: string;
  selectedChips: string[];
  nutritionMode: boolean;
  onPromptChange: (value: string) => void;
  onToggleChip: (chip: string) => void;
  onNutritionModeChange: (checked: boolean) => void;
  onGenerate: () => void;
  onlineMode: boolean;
  weatherProfile: WeatherProfile;
};

export function HomeView({
  prompt,
  selectedChips,
  nutritionMode,
  onPromptChange,
  onToggleChip,
  onNutritionModeChange,
  onGenerate,
  onlineMode,
  weatherProfile,
}: HomeViewProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <section className="home-view flex flex-1 flex-col">
      <div className="home-hero pt-3">
        <p className="text-lg font-semibold text-muted">{greeting}</p>
        <h1 className="mt-3 text-[2.75rem] font-bold leading-[0.98] tracking-normal">想吃点什么？</h1>
        <div className="mt-5 rounded-[24px] bg-white/78 px-4 py-3 shadow-sm">
          <p className="text-sm font-bold text-ink">
            {weatherProfile.status === "loading" ? "正在判断天气" : `${weatherProfile.location} · ${weatherProfile.temperatureC}°C · ${weatherProfile.condition}`}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-muted">{weatherProfile.reason}</p>
        </div>
      </div>

      <div className="home-controls flex flex-1 flex-col">
        {onlineMode ? (
          <>
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
              {onlineQuickOptions.map((option) => (
                <Chip key={option} label={option} selected={selectedChips.includes(option)} onClick={() => onToggleChip(option)} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-9 space-y-4">
            {offlineFilterGroups.map((group) => (
              <section key={group.title} className="rounded-[28px] bg-white/82 p-4 shadow-sm">
                <p className="mb-3 text-sm font-bold text-muted">{group.title}</p>
                <div className="flex flex-wrap gap-2.5">
                  {group.options.map((option) => (
                    <Chip key={option} label={option} selected={selectedChips.includes(option)} onClick={() => onToggleChip(option)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Toggle checked={nutritionMode} onChange={onNutritionModeChange} label="营养模式" />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.99] ${
            onlineMode ? "online-generate-button" : "bg-ink hover:bg-black"
          }`}
        >
          <Sparkles size={20} />
          生成今晚菜单
        </button>
      </div>
    </section>
  );
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  if (hour < 22) return "Good Evening";
  return "Good Night";
}
