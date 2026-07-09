export type IngredientCategory =
  | "protein"
  | "vegetable"
  | "carb"
  | "seasoning"
  | "other";

export type DinnerDish = {
  id: string;
  name: string;
  description: string;
  recommendationReason: string[];
  weatherContext: {
    location: string;
    temperatureC: number;
    condition: string;
    season: string;
  };
  recommendationScore: number;
  nutrition: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
  };
  cooking: {
    timeMinutes: number;
    difficulty: "easy" | "medium" | "hard";
  };
  tags: string[];
  ingredients: {
    name: string;
    amount: string;
    category: IngredientCategory;
  }[];
  instructions: string[];
};

export type PreferenceState = {
  likedDishIds: string[];
  dislikedDishIds: string[];
  tagScores: Record<string, number>;
};

export type WeatherProfile = {
  status: "loading" | "ready" | "fallback" | "error";
  location: string;
  temperatureC: number;
  apparentTemperatureC: number;
  condition: string;
  climate: string;
  season: string;
  tags: string[];
  reason: string;
  updatedAt?: string;
};
