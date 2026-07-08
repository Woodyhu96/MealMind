import { CheckCircle2 } from "lucide-react";

const checklist = ["今天的天气", "你的历史喜好", "营养需求", "烹饪时间", "食材搭配"];

export function ThinkingView() {
  return (
    <section className="flex flex-1 flex-col justify-center">
      <div className="rounded-[34px] bg-white p-7 shadow-soft">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-citrus/70">
          <div className="h-11 w-11 animate-pulse rounded-full bg-tomato/80" />
        </div>
        <h1 className="mt-8 text-center text-3xl font-bold leading-tight">正在为你准备今晚菜单</h1>
        <div className="mt-8 space-y-3">
          {checklist.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3"
              style={{ animation: `rise 500ms ease ${index * 120}ms both` }}
            >
              <CheckCircle2 className="text-ink" size={20} />
              <span className="font-medium text-ink">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
