import { useEffect, useState } from "react";

export type DeviceProfile = "iphone-safari" | "desktop-chrome" | "default";

function detectDeviceProfile(): DeviceProfile {
  const userAgent = navigator.userAgent;
  const isIPhone = /iPhone/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
  const isChrome = /Chrome|CriOS/.test(userAgent) && !/Edg|EdgiOS/.test(userAgent);
  const hasTouch = navigator.maxTouchPoints > 0;

  if (isIPhone && isSafari) {
    return "iphone-safari";
  }

  if (isChrome && !hasTouch) {
    return "desktop-chrome";
  }

  return "default";
}

export function useDeviceProfile() {
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>("default");

  useEffect(() => {
    setDeviceProfile(detectDeviceProfile());
  }, []);

  return deviceProfile;
}
