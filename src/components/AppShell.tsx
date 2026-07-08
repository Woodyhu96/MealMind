import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { DeviceProfile } from "../hooks/useDeviceProfile";

type AppShellProps = {
  children: ReactNode;
  deviceProfile: DeviceProfile;
};

const appVersion = "V1.0";

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
                <div>
                  <p className="text-sm font-bold text-ink">Recommendation Mode</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{onlineMode ? "Online" : "Offline"}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlineMode}
                  onClick={() => setOnlineMode((current) => !current)}
                  className={`mode-switch mt-4 ${onlineMode ? "is-online" : ""}`}
                >
                  <span>Offline</span>
                  <span>Online</span>
                  <span className="mode-switch-thumb" />
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
      <div className="version-badge fixed bottom-4 left-4 z-30 text-xs font-bold text-[#4A4A4F]">{appVersion}</div>
    </main>
  );
}
