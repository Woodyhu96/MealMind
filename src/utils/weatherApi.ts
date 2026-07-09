import type { WeatherProfile } from "../types/dinner";

type AddressCandidate = {
  city: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type OpenMeteoCurrent = {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
  precipitation?: number;
  rain?: number;
  snowfall?: number;
  cloud_cover?: number;
  wind_speed_10m?: number;
  time?: string;
};

const fallbackWeather: WeatherProfile = {
  status: "fallback",
  location: "Toronto",
  temperatureC: 18,
  apparentTemperatureC: 18,
  condition: "多云",
  climate: "温和",
  season: "四季",
  tags: ["适合天气", "清淡"],
  reason: "暂时使用默认天气，推荐会保持均衡、不过分重口。",
};

export function getFallbackWeatherProfile() {
  return fallbackWeather;
}

export async function fetchWeatherProfile(): Promise<WeatherProfile> {
  try {
    const address = await fetchAddressCandidate();
    const weather = await fetchOpenMeteoWeather(address.latitude, address.longitude);
    const temperatureC = Math.round(weather.temperature_2m ?? fallbackWeather.temperatureC);
    const apparentTemperatureC = Math.round(weather.apparent_temperature ?? temperatureC);
    const condition = describeWeatherCode(weather.weather_code ?? 3, weather);
    const season = inferSeason(new Date(), address.latitude);
    const tags = inferWeatherTags({ ...weather, temperature_2m: temperatureC, apparent_temperature: apparentTemperatureC });
    const climate = inferClimate(temperatureC, weather);

    return {
      status: "ready",
      location: formatLocation(address),
      temperatureC,
      apparentTemperatureC,
      condition,
      climate,
      season,
      tags,
      reason: buildWeatherReason(temperatureC, apparentTemperatureC, condition, climate, tags),
      updatedAt: weather.time,
    };
  } catch (error) {
    console.info("[MealMind] Weather lookup fallback", error);
    return {
      ...fallbackWeather,
      status: "error",
      reason: "天气和地址服务暂时不可用，先用默认城市天气继续推荐。",
    };
  }
}

async function fetchAddressCandidate(): Promise<AddressCandidate> {
  const ipapi = await fetchJson<{
    city?: string;
    region?: string;
    country_name?: string;
    latitude?: number;
    longitude?: number;
  }>("https://ipapi.co/json/");

  if (ipapi.city && typeof ipapi.latitude === "number" && typeof ipapi.longitude === "number") {
    return {
      city: ipapi.city,
      region: ipapi.region,
      country: ipapi.country_name,
      latitude: ipapi.latitude,
      longitude: ipapi.longitude,
    };
  }

  const ipwho = await fetchJson<{
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    success?: boolean;
  }>("https://ipwho.is/");

  if (ipwho.city && typeof ipwho.latitude === "number" && typeof ipwho.longitude === "number") {
    return {
      city: ipwho.city,
      region: ipwho.region,
      country: ipwho.country,
      latitude: ipwho.latitude,
      longitude: ipwho.longitude,
    };
  }

  throw new Error("No usable address result");
}

async function fetchOpenMeteoWeather(latitude: number, longitude: number): Promise<OpenMeteoCurrent> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,cloud_cover,wind_speed_10m",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const response = await fetchJson<{ current?: OpenMeteoCurrent }>(url.toString());

  if (!response.current) {
    throw new Error("No current weather result");
  }

  return response.current;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function formatLocation(address: AddressCandidate) {
  if (address.region && address.region !== address.city) {
    return `${address.city}, ${address.region}`;
  }

  return address.city;
}

function describeWeatherCode(code: number, current: OpenMeteoCurrent) {
  if ((current.snowfall ?? 0) > 0) return "下雪";
  if ((current.rain ?? 0) > 0 || (current.precipitation ?? 0) > 0) return "下雨";
  if (code === 0) return "晴";
  if ([1, 2].includes(code)) return "晴间云";
  if (code === 3) return "多云";
  if ([45, 48].includes(code)) return "有雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "下雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "下雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "多云";
}

function inferWeatherTags(current: OpenMeteoCurrent) {
  const temperature = current.apparent_temperature ?? current.temperature_2m ?? fallbackWeather.temperatureC;
  const tags = new Set<string>(["适合天气"]);
  const precipitation = (current.precipitation ?? 0) + (current.rain ?? 0) + (current.snowfall ?? 0);
  const cloudy = (current.cloud_cover ?? 0) >= 70;
  const windy = (current.wind_speed_10m ?? 0) >= 28;

  if (temperature <= 8) {
    tags.add("暖胃");
    tags.add("汤");
  } else if (temperature >= 26) {
    tags.add("清淡");
    tags.add("爽口");
    tags.add("凉拌");
  } else {
    tags.add("家常");
  }

  if (precipitation > 0 || cloudy || windy) {
    tags.add("暖胃");
  }

  if (precipitation > 0) {
    tags.add("汤");
  }

  return Array.from(tags);
}

function inferClimate(temperatureC: number, current: OpenMeteoCurrent) {
  if ((current.snowfall ?? 0) > 0 || temperatureC <= 3) return "寒冷";
  if ((current.precipitation ?? 0) > 0 || (current.rain ?? 0) > 0) return "潮湿";
  if (temperatureC >= 30) return "炎热";
  if (temperatureC >= 24) return "偏热";
  if (temperatureC <= 10) return "偏冷";
  return "温和";
}

function inferSeason(date: Date, latitude: number) {
  const month = date.getMonth() + 1;
  const northern = latitude >= 0;
  const seasonIndex = northern ? month : ((month + 6 - 1) % 12) + 1;

  if ([3, 4, 5].includes(seasonIndex)) return "春季";
  if ([6, 7, 8].includes(seasonIndex)) return "夏季";
  if ([9, 10, 11].includes(seasonIndex)) return "秋季";
  return "冬季";
}

function buildWeatherReason(temperatureC: number, apparentTemperatureC: number, condition: string, climate: string, tags: string[]) {
  if (tags.includes("汤")) {
    return `体感 ${apparentTemperatureC}°C，${climate}天气更适合热汤、煲类或暖胃菜。`;
  }

  if (tags.includes("爽口")) {
    return `${temperatureC}°C 的${condition}天气偏热，优先推荐清淡、爽口、少负担的菜。`;
  }

  return `${temperatureC}°C 的${condition}天气比较温和，适合家常快手菜和均衡搭配。`;
}
