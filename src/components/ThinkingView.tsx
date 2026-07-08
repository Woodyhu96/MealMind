import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const checklist = ["今天的天气", "你的历史喜好", "营养需求", "烹饪时间", "食材搭配"];

export function ThinkingView() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const progress = Math.max(0, ((activeIndex + 1) / checklist.length) * 100);

  useEffect(() => {
    const timers = checklist.map((_, index) =>
      window.setTimeout(() => {
        setActiveIndex(index);
      }, 420 + index * 640),
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <section className="flex flex-1 flex-col justify-center">
      <div className="rounded-[34px] bg-white p-7 shadow-soft">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-citrus/70">
          <div className="h-11 w-11 animate-pulse rounded-full bg-tomato/80" />
        </div>
        <h1 className="mt-8 text-center text-3xl font-bold leading-tight">正在为你准备今晚菜单</h1>
        <div className="mt-6 overflow-hidden rounded-full bg-paper">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-sage via-citrus to-tomato transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-8 space-y-3">
          {checklist.map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition duration-500 ${
                index <= activeIndex ? "bg-sage/80 text-ink shadow-sm" : "bg-paper text-muted"
              }`}
              style={{ animation: `rise 500ms ease ${index * 120}ms both` }}
            >
              {index <= activeIndex ? (
                <CheckCircle2 className="text-ink" size={20} />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-line bg-white" />
              )}
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
