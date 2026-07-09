import type { DinnerDish, WeatherProfile } from "../types/dinner";

export function adaptDishesToWeather(dishes: DinnerDish[], weather: WeatherProfile): DinnerDish[] {
  return dishes.map((dish) => ({
    ...dish,
    weatherContext: {
      location: weather.location,
      temperatureC: weather.temperatureC,
      condition: weather.condition,
      season: weather.season,
    },
  }));
}

export function weatherScoreForDish(dish: DinnerDish, weather: WeatherProfile) {
  if (weather.status === "loading") {
    return 0;
  }

  const tags = new Set(dish.tags);
  const weatherTags = new Set(weather.tags);
  let score = 0;

  weatherTags.forEach((tag) => {
    if (tags.has(tag)) {
      score += 14;
    }
  });

  if (weatherTags.has("暖胃")) {
    if (tags.has("汤")) score += 18;
    if (tags.has("煲") || tags.has("炖煮") || tags.has("暖胃")) score += 14;
    if (tags.has("辣") || tags.has("酸辣")) score += 6;
    if (tags.has("凉拌") || tags.has("爽口")) score -= 12;
  }

  if (weatherTags.has("爽口")) {
    if (tags.has("凉拌") || tags.has("爽口") || tags.has("清淡")) score += 18;
    if (tags.has("海鲜") || tags.has("素菜")) score += 8;
    if (tags.has("汤") && !tags.has("清淡")) score -= 10;
    if (tags.has("干锅") || tags.has("红烧") || tags.has("炖煮")) score -= 8;
  }

  if (weather.climate === "寒冷") {
    if (tags.has("汤") || tags.has("暖胃")) score += 12;
  }

  if (weather.climate === "炎热" || weather.climate === "偏热") {
    if (tags.has("清淡") || tags.has("爽口")) score += 12;
  }

  return score;
}
