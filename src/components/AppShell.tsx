import { Check, House, Menu, Plus, RotateCcw, Star, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { DeviceProfile } from "../hooks/useDeviceProfile";
import type { DinnerDish } from "../types/dinner";

type AppShellProps = {
  children: ReactNode;
  deviceProfile: DeviceProfile;
  onlineMode: boolean;
  onOnlineModeChange: (onlineMode: boolean) => void;
  onRestart: () => void;
  favoriteDishes: DinnerDish[];
  onAddFavoriteDishToDinner: (dish: DinnerDish) => void;
  onRemoveFavoriteDish: (dishId: string) => void;
};

const appVersion = "V1.1";

export function AppShell({
  children,
  deviceProfile,
  onlineMode,
  onOnlineModeChange,
  onRestart,
  favoriteDishes,
  onAddFavoriteDishToDinner,
  onRemoveFavoriteDish,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [confirmedFavoriteIds, setConfirmedFavoriteIds] = useState<string[]>([]);

  const restartFromMenu = () => {
    setMenuOpen(false);
    setFavoritesOpen(false);
    setConfirmedFavoriteIds([]);
    onRestart();
  };

  const addFavoriteDish = (dish: DinnerDish) => {
    onAddFavoriteDishToDinner(dish);
    setConfirmedFavoriteIds((current) => (current.includes(dish.id) ? current : [...current, dish.id]));
    window.setTimeout(() => {
      setConfirmedFavoriteIds((current) => current.filter((dishId) => dishId !== dish.id));
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-paper text-ink" data-device={deviceProfile}>
      <div className="app-frame mx-auto flex min-h-screen w-full flex-col px-5 py-5">
        <div className={`app-content flex min-h-screen flex-col transition duration-300 ${menuOpen ? "app-content-blurred" : ""}`}>
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back to start"
              onClick={onRestart}
              className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-lg font-bold text-ink shadow-sm transition active:scale-[0.97]"
            >
              <House size={18} />
              <span>Dinner Planner</span>
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm transition active:scale-[0.96]"
            >
              <Menu size={21} />
            </button>
          </div>
          {children}
        </div>

        {menuOpen && (
          <div className="menu-layer fixed inset-0 z-40">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 cursor-default bg-white/18"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="menu-panel absolute right-5 top-5 w-[min(330px,calc(100vw-40px))] rounded-[30px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold leading-tight">Menu</p>
                  <p className="mt-1 text-sm font-medium text-muted">Dinner Planner</p>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition active:scale-[0.96]"
                >
                  <X size={19} />
                </button>
              </div>

              <button
                type="button"
                onClick={restartFromMenu}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[24px] bg-ink px-4 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
              >
                <RotateCcw size={17} />
                重新开始
              </button>

              <button
                type="button"
                onClick={() => setFavoritesOpen((current) => !current)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[24px] bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm transition active:scale-[0.98]"
              >
                <Star size={17} />
                收藏
                {favoriteDishes.length > 0 && (
                  <span className="rounded-full bg-citrus px-2 py-0.5 text-xs font-bold text-ink">{favoriteDishes.length}</span>
                )}
              </button>

              {favoritesOpen && (
                <section className="mt-3 rounded-[24px] bg-white/82 p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink">已收藏菜品</p>
                    <span className="text-xs font-semibold text-muted">{favoriteDishes.length} 道</span>
                  </div>
                  {favoriteDishes.length === 0 ? (
                    <p className="mt-3 rounded-2xl bg-paper px-3 py-4 text-center text-xs font-semibold leading-5 text-muted">
                      还没有收藏。去推荐页点菜名旁边的星星。
                    </p>
                  ) : (
                    <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                      {favoriteDishes.map((dish) => {
                        const confirmed = confirmedFavoriteIds.includes(dish.id);

                        return (
                          <div
                            key={dish.id}
                            className={`flex items-center gap-2 rounded-2xl p-2 transition duration-300 ${
                              confirmed ? "bg-sage/45 ring-2 ring-sage" : "bg-paper"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-ink">{dish.name}</p>
                              <p className="mt-0.5 line-clamp-1 text-xs font-medium text-muted">
                                {confirmed ? "已加入今晚菜单" : dish.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Add ${dish.name} to dinner tray`}
                              onClick={() => addFavoriteDish(dish)}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-[0.96] ${
                                confirmed ? "bg-sage text-ink" : "bg-ink text-white"
                              }`}
                            >
                              {confirmed ? <Check size={16} /> : <Plus size={16} />}
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove ${dish.name} from favorites`}
                              onClick={() => onRemoveFavoriteDish(dish.id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted transition hover:text-tomato active:scale-[0.96]"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              <div className="mt-6 rounded-[24px] bg-white/75 p-4">
                <div>
                  <p className="text-sm font-bold text-ink">Recommendation Mode</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{onlineMode ? "Online" : "Offline"}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlineMode}
                  onClick={() => onOnlineModeChange(!onlineMode)}
                  className={`mode-switch mt-4 ${onlineMode ? "is-online" : ""}`}
                >
                  <span>Offline</span>
                  <span>Online</span>
                  <span className="mode-switch-thumb" />
                </button>
              </div>
              <div className="mt-6 border-t border-line/70 pt-4 text-right text-xs font-bold text-[#4A4A4F]">{appVersion}</div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
