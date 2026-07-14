import type { DinnerDish, IngredientCategory, WeatherProfile } from "../types/dinner";

type GenerateOnlineDinnerInput = {
  prompt: string;
  selectedChips: string[];
  nutritionMode: boolean;
  weatherProfile: WeatherProfile;
};

type OpenAiDinnerDish = {
  name: string;
  description: string;
  recommendationReason: string[];
  tags: string[];
  ingredients: {
    name: string;
    amount: string;
    category: IngredientCategory;
  }[];
  instructions: string[];
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
};

type OpenAiDinnerResponse = {
  dishes: OpenAiDinnerDish[];
};

const openAiEndpoint = "https://api.openai.com/v1/responses";

export function canUseOnlineDinnerApi() {
  return true;
}

export async function generateOnlineDinnerDishes(input: GenerateOnlineDinnerInput): Promise<DinnerDish[]> {
  const localResponse = await fetch("/api/online-dinner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (localResponse.status !== 404) {
    if (!localResponse.ok) {
      const message = await localResponse.text();
      throw new Error(message || `Online dinner proxy failed: ${localResponse.status}`);
    }

    return (await localResponse.json()) as DinnerDish[];
  }

  throw new Error("Online dinner API is unavailable in this environment");
}

export async function generateOnlineDinnerDishesFromOpenAi(input: GenerateOnlineDinnerInput, apiKey: string, model: string) {
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch(openAiEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "你是一个熟悉中国家常菜的晚餐推荐助手。返回适合家庭快速执行的菜品，不要解释 JSON 以外的内容。",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildDinnerPrompt(input),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "dinner_recommendations",
          strict: true,
          schema: dinnerRecommendationSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const parsed = JSON.parse(extractOutputText(payload)) as OpenAiDinnerResponse;

  return parsed.dishes.map((dish, index) => mapOpenAiDishToDinnerDish(dish, input.weatherProfile, index));
}

function buildDinnerPrompt({ prompt, selectedChips, nutritionMode, weatherProfile }: GenerateOnlineDinnerInput) {
  return [
    `用户自然语言偏好：${prompt || "没有额外描述"}`,
    `用户点击的筛选：${selectedChips.length > 0 ? selectedChips.join("，") : "没有筛选"}`,
    `营养模式：${nutritionMode ? "开启，优先蛋白质和均衡" : "关闭，优先口味和直觉"}`,
    `天气：${weatherProfile.location}，${weatherProfile.temperatureC}°C，${weatherProfile.condition}，${weatherProfile.reason}`,
    "请推荐 6 道中国家常晚餐菜品。第一道必须最符合用户当前偏好。菜品要覆盖主菜、素菜或汤的可能搭配。",
    "如果用户选择了具体 protein 或口味，推荐菜名、描述、tags 必须显性体现这些元素，不要用谐音或误判，例如鱼香肉丝不是鱼。",
    "每道菜给 3 条推荐理由、3-5 个 tags、4-6 个食材、3-5 步做法。字段必须完整。",
  ].join("\n");
}

function extractOutputText(payload: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }) {
  if (payload.output_text) {
    return payload.output_text;
  }

  const text = payload.output?.flatMap((item) => item.content ?? []).find((content) => content.text)?.text;

  if (!text) {
    throw new Error("OpenAI response did not include output text");
  }

  return text;
}

function mapOpenAiDishToDinnerDish(dish: OpenAiDinnerDish, weatherProfile: WeatherProfile, index: number): DinnerDish {
  return {
    id: `online-${slugify(dish.name)}-${Date.now()}-${index}`,
    name: dish.name,
    description: dish.description,
    recommendationReason: dish.recommendationReason.slice(0, 3),
    weatherContext: {
      location: weatherProfile.location,
      temperatureC: weatherProfile.temperatureC,
      condition: weatherProfile.condition,
      season: weatherProfile.season,
    },
    recommendationScore: 96 - index,
    nutrition: dish.nutrition,
    cooking: dish.cooking,
    tags: dish.tags.slice(0, 5),
    ingredients: dish.ingredients,
    instructions: dish.instructions,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const dinnerRecommendationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    dishes: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          recommendationReason: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: { type: "string" },
          },
          tags: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
          ingredients: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                amount: { type: "string" },
                category: {
                  type: "string",
                  enum: ["protein", "vegetable", "carb", "seasoning", "other"],
                },
              },
              required: ["name", "amount", "category"],
            },
          },
          instructions: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
          nutrition: {
            type: "object",
            additionalProperties: false,
            properties: {
              calories: { type: "number" },
              proteinG: { type: "number" },
              fatG: { type: "number" },
              carbsG: { type: "number" },
            },
            required: ["calories", "proteinG", "fatG", "carbsG"],
          },
          cooking: {
            type: "object",
            additionalProperties: false,
            properties: {
              timeMinutes: { type: "number" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
            required: ["timeMinutes", "difficulty"],
          },
        },
        required: [
          "name",
          "description",
          "recommendationReason",
          "tags",
          "ingredients",
          "instructions",
          "nutrition",
          "cooking",
        ],
      },
    },
  },
  required: ["dishes"],
};
