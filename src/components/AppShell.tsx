import type { ReactNode } from "react";
import type { DeviceProfile } from "../hooks/useDeviceProfile";

type AppShellProps = {
  children: ReactNode;
  deviceProfile: DeviceProfile;
};

export function AppShell({ children, deviceProfile }: AppShellProps) {
  return (
    <main className="min-h-screen bg-paper text-ink" data-device={deviceProfile}>
      <div className="app-frame mx-auto flex min-h-screen w-full flex-col px-5 py-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Local-first</p>
            <p className="text-lg font-bold">Dinner Planner</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">晚</div>
        </div>
        {children}
      </div>
    </main>
  );
}
