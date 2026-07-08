import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { DeviceProfile } from "../hooks/useDeviceProfile";

type AppShellProps = {
  children: ReactNode;
  deviceProfile: DeviceProfile;
};

export function AppShell({ children, deviceProfile }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [onlineMode, setOnlineMode] = useState(false);

  return (
    <main className="min-h-screen bg-paper text-ink" data-device={deviceProfile}>
      <div className="app-frame mx-auto flex min-h-screen w-full flex-col px-5 py-5">
        <div className={`app-content flex min-h-screen flex-col transition duration-300 ${menuOpen ? "app-content-blurred" : ""}`}>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-lg font-bold">Dinner Planner</p>
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

              <div className="mt-6 rounded-[24px] bg-white/75 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Recommendation Mode</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{onlineMode ? "Online" : "Offline"}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={onlineMode}
                    onClick={() => setOnlineMode((current) => !current)}
                    className={`relative h-9 w-[88px] rounded-full p-1 transition ${onlineMode ? "bg-ink" : "bg-line"}`}
                  >
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-white/80">
                      ON
                    </span>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-muted">
                      OFF
                    </span>
                    <span
                      className={`absolute top-1 h-7 w-10 rounded-full bg-white shadow-sm transition ${
                        onlineMode ? "left-[43px]" : "left-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlineMode(false)}
                    className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      !onlineMode ? "bg-ink text-white" : "bg-paper text-muted"
                    }`}
                  >
                    Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineMode(true)}
                    className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      onlineMode ? "bg-ink text-white" : "bg-paper text-muted"
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
