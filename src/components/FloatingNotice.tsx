import { X } from "lucide-react";

type FloatingNoticeProps = {
  message: string;
  tone?: "info" | "error";
  onClose: () => void;
};

export function FloatingNotice({ message, tone = "info", onClose }: FloatingNoticeProps) {
  if (!message) {
    return null;
  }

  const toneClass = tone === "error" ? "border-tomato/30 bg-white text-ink" : "border-sage/50 bg-white text-ink";

  return (
    <div
      role="alert"
      className={`fixed left-1/2 top-5 z-[80] w-[min(390px,calc(100vw-32px))] -translate-x-1/2 rounded-[24px] border px-4 py-3 pr-12 text-sm font-semibold leading-6 shadow-soft ${toneClass}`}
      style={{ animation: "notice-slide-in 240ms ease-out both" }}
    >
      {message}
      <button
        type="button"
        aria-label="关闭提示"
        onClick={onClose}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-paper text-muted transition active:scale-[0.96]"
      >
        <X size={17} />
      </button>
    </div>
  );
}
