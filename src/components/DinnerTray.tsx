import { ChefHat, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { DinnerDish } from "../types/dinner";

type DinnerTrayProps = {
  dishes: DinnerDish[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemoveDish: (dishId: string) => void;
  onStartDinner: () => void;
};

const accentClasses = ["bg-tomato/90", "bg-citrus", "bg-sage", "bg-ocean/70", "bg-ink text-white"];

export function DinnerTray({ dishes, open, onOpen, onClose, onRemoveDish, onStartDinner }: DinnerTrayProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  const closeWithTransition = () => {
    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 360);
  };

  const startDinnerWithTransition = () => {
    if (dishes.length === 0) {
      return;
    }

    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onStartDinner();
    }, 360);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open dinner tray"
        onClick={onOpen}
        className="dinner-tray-button fixed bottom-5 left-5 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-soft transition active:scale-[0.96]"
      >
        <ChefHat size={27} />
        {dishes.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-tomato px-2 text-xs font-bold text-white shadow-sm">
            {dishes.length}
          </span>
        )}
      </button>

      {visible && (
        <div className={`tray-overlay fixed inset-0 z-50 flex items-center justify-center p-5 ${closing ? "is-closing" : ""}`}>
          <div className="tray-backdrop absolute inset-0" />
          <button
            type="button"
            aria-label="Close dinner tray"
            className="absolute inset-0 cursor-default"
            onClick={closeWithTransition}
          />
          <section className="tray-panel relative flex h-[90vh] w-[min(900px,90vw)] flex-col overflow-hidden rounded-[34px] border border-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Dinner Tray</p>
                <h2 className="mt-1 text-3xl font-bold leading-tight">今晚菜单</h2>
              </div>
              <button
                type="button"
                aria-label="Close dinner tray"
                onClick={closeWithTransition}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto pr-1">
              {dishes.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[28px] bg-paper p-6 text-center">
                  <p className="max-w-xs text-sm font-semibold leading-6 text-muted">还没有加入菜品。回到推荐卡，点“就吃这个”加入今晚菜单。</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {dishes.map((dish, index) => (
                    <div key={dish.id} className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                          accentClasses[index % accentClasses.length]
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-ink">{dish.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-muted">{dish.description}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${dish.name}`}
                        onClick={() => onRemoveDish(dish.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-muted transition hover:bg-tomato/15 hover:text-tomato active:scale-[0.96]"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={startDinnerWithTransition}
              disabled={dishes.length === 0}
              className="mt-5 rounded-full bg-tomato px-5 py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:bg-line disabled:text-muted"
            >
              开饭
            </button>
          </section>
        </div>
      )}
    </>
  );
}
