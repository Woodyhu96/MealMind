import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DinnerSummary } from "./components/DinnerSummary";
import { DinnerTray } from "./components/DinnerTray";
import { DishCard } from "./components/DishCard";
import { FloatingNotice } from "./components/FloatingNotice";
import { HomeView } from "./components/HomeView";
import { ThinkingView } from "./components/ThinkingView";
import { offlineDishes } from "./data/offlineDishes";
import { useDeviceProfile } from "./hooks/useDeviceProfile";
import { useLocalPreferences } from "./hooks/useLocalPreferences";
import type { DinnerDish, WeatherProfile } from "./types/dinner";
import { generateOnlineDinnerDishes } from "./utils/openAiDinnerApi";
import { rankDishesByLocalPrediction } from "./utils/preferenceEngine";
import { getRelatedDishes } from "./utils/relatedDishes";
import { adaptDishesToWeather } from "./utils/weatherAdaptation";
import { fetchWeatherProfile, getFallbackWeatherProfile } from "./utils/weatherApi";

type View = "home" | "thinking" | "recommendation" | "summary";
type PredictionSeed = {
  prompt: string;
  chips: string[];
  source: "offline" | "online";
};
const favoritesStorageKey = "ai-dinner-planner.favorites.v1";
const onlineDishStorageKey = "ai-dinner-planner.online-dishes.v1";

function loadFavoriteIds() {
  try {
    const value = localStorage.getItem(favoritesStorageKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function loadOnlineDishes() {
  try {
    const value = localStorage.getItem(onlineDishStorageKey);
    return value ? (JSON.parse(value) as DinnerDish[]) : [];
  } catch {
    return [];
  }
}

function getRotatedRelatedDishes<T>(items: T[], offset: number, limit: number) {
  if (items.length <= limit) {
    return items;
  }

  return Array.from({ length: limit }, (_, index) => items[(offset + index) % items.length]);
}

function mergeOnlineDishes(current: DinnerDish[], incoming: DinnerDish[]) {
  const byName = new Map(current.map((dish) => [dish.name, dish]));

  incoming.forEach((dish) => {
    byName.set(dish.name, dish);
  });

  return Array.from(byName.values()).slice(-60);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getOnlineFallbackNotice(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("OPENAI_API_KEY")) {
    return "Online 模式还没有配置 OPENAI_API_KEY，已先回退到离线菜单。要生成冬阴功这类库外菜，请在本地 .env 添加 key 后重启 demo 服务。";
  }

  return "Online 请求暂时没有成功，已先回退到离线菜单。你可以稍后重试，或检查本地 OpenAI API 配置。";
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [prompt, setPrompt] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const selectedChipsRef = useRef<string[]>([]);
  const [nutritionMode, setNutritionMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dinnerDishes, setDinnerDishes] = useState<DinnerDish[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  const [predictionSeed, setPredictionSeed] = useState<PredictionSeed>({ prompt: "", chips: [], source: "offline" });
  const [onlineMode, setOnlineMode] = useState(false);
  const [onlineDishes, setOnlineDishes] = useState<DinnerDish[]>(() => loadOnlineDishes());
  const [currentOnlineDishIds, setCurrentOnlineDishIds] = useState<string[]>([]);
  const [generationNotice, setGenerationNotice] = useState("");
  const [favoriteDishIds, setFavoriteDishIds] = useState<string[]>(() => loadFavoriteIds());
  const [relatedRefreshOffset, setRelatedRefreshOffset] = useState(0);
  const [weatherProfile, setWeatherProfile] = useState<WeatherProfile>(() => ({
    ...getFallbackWeatherProfile(),
    status: "loading" as const,
    reason: "正在判断你所在城市的天气，用来微调今晚推荐。",
  }));
  const deviceProfile = useDeviceProfile();
  const { preferences, recordFeedback } = useLocalPreferences();

  useEffect(() => {
    let active = true;

    fetchWeatherProfile().then((profile) => {
      if (active) {
        setWeatherProfile(profile);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteDishIds));
  }, [favoriteDishIds]);

  useEffect(() => {
    localStorage.setItem(onlineDishStorageKey, JSON.stringify(onlineDishes));
  }, [onlineDishes]);

  const weatherAwareDishes = useMemo(() => adaptDishesToWeather(offlineDishes, weatherProfile), [weatherProfile]);
  const activeOnlineDishes = useMemo(
    () =>
      currentOnlineDishIds
        .map((dishId) => onlineDishes.find((dish) => dish.id === dishId))
        .filter((dish): dish is DinnerDish => Boolean(dish)),
    [currentOnlineDishIds, onlineDishes],
  );
  const recommendationDishes =
    predictionSeed.source === "online" && activeOnlineDishes.length > 0 ? activeOnlineDishes : weatherAwareDishes;
  const allKnownDishes = useMemo(() => [...weatherAwareDishes, ...onlineDishes], [onlineDishes, weatherAwareDishes]);

  const rankedDishes = useMemo(
    () =>
      rankDishesByLocalPrediction(
        recommendationDishes,
        preferences,
        nutritionMode,
        predictionSeed.prompt,
        predictionSeed.chips,
        weatherProfile,
      ),
    [nutritionMode, predictionSeed, preferences, recommendationDishes, weatherProfile],
  );

  const currentDish = rankedDishes[currentIndex % rankedDishes.length];
  const favoriteDishes = useMemo(
    () =>
      favoriteDishIds
        .map((dishId) => allKnownDishes.find((dish) => dish.id === dishId))
        .filter((dish): dish is DinnerDish => Boolean(dish)),
    [allKnownDishes, favoriteDishIds],
  );

  const relatedDishLimit = deviceProfile === "desktop-chrome" ? 8 : 6;
  const relatedDishPool = useMemo(
    () => getRelatedDishes(currentDish, rankedDishes, relatedDishLimit * 3, dinnerDishes),
    [currentDish, dinnerDishes, rankedDishes, relatedDishLimit],
  );
  const relatedDishes = useMemo(
    () => getRotatedRelatedDishes(relatedDishPool, relatedRefreshOffset, relatedDishLimit),
    [relatedDishLimit, relatedDishPool, relatedRefreshOffset],
  );

  const toggleChip = (chip: string) => {
    const current = selectedChipsRef.current;
    const next = current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip];

    selectedChipsRef.current = next;
    setSelectedChips(next);
  };

  const generateRecommendations = async () => {
    const chips = selectedChipsRef.current;
    console.info("[AI Dinner Planner] Mock generation input", {
      prompt,
      selectedChips: chips,
      nutritionMode,
    });
    const source = onlineMode ? "online" : "offline";

    setGenerationNotice("");
    setPredictionSeed({ prompt, chips, source });
    setView("thinking");

    if (!onlineMode) {
      window.setTimeout(() => {
        setCurrentOnlineDishIds([]);
        setCurrentIndex(0);
        setRelatedRefreshOffset(0);
        setView("recommendation");
      }, 3900);
      return;
    }

    const thinkingDelay = wait(3900);

    try {
      const aiDishes = await generateOnlineDinnerDishes({
        prompt,
        selectedChips: chips,
        nutritionMode,
        weatherProfile,
      });

      await thinkingDelay;
      setOnlineDishes((current) => mergeOnlineDishes(current, aiDishes));
      setCurrentOnlineDishIds(aiDishes.map((dish) => dish.id));
      setGenerationNotice("ChatGPT 已根据你的描述生成新菜品，并暂存到本地 online 菜单。");
      setCurrentIndex(0);
      setRelatedRefreshOffset(0);
      setView("recommendation");
    } catch (error) {
      console.warn("[AI Dinner Planner] Online generation unavailable, falling back to offline dishes", error);
      await thinkingDelay;
      setPredictionSeed({ prompt, chips, source: "offline" });
      setCurrentOnlineDishIds([]);
      setGenerationNotice(getOnlineFallbackNotice(error));
      setCurrentIndex(0);
      setRelatedRefreshOffset(0);
      setView("recommendation");
    }
  };

  const showNextDish = () => {
    setCurrentIndex((index) => (index + 1) % rankedDishes.length);
    setRelatedRefreshOffset(0);
  };

  const showDishById = (dishId: string) => {
    const nextIndex = rankedDishes.findIndex((dish) => dish.id === dishId);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      setRelatedRefreshOffset(0);
    }
  };

  const refreshRelatedDishes = () => {
    setRelatedRefreshOffset((offset) => offset + relatedDishLimit);
  };

  const showNextRelatedDish = (extraExcludedDishId?: string) => {
    const selectedDishes = extraExcludedDishId
      ? [...dinnerDishes, rankedDishes.find((dish) => dish.id === extraExcludedDishId)].filter(
          (dish): dish is DinnerDish => Boolean(dish),
        )
      : dinnerDishes;
    const nextDish = getRelatedDishes(
      currentDish,
      rankedDishes,
      deviceProfile === "desktop-chrome" ? 8 : 6,
      selectedDishes,
    )[0]?.dish;

    if (nextDish) {
      showDishById(nextDish.id);
      return;
    }

    showNextDish();
  };

  const handleFeedback = (feedback: "like" | "dislike") => {
    recordFeedback(currentDish, feedback);
    showNextDish();
  };

  const addDishToDinnerByDish = (dishToAdd: DinnerDish) => {
    setDinnerDishes((current) => {
      if (current.some((dish) => dish.id === dishToAdd.id)) {
        return current;
      }

      return [...current, dishToAdd];
    });
  };

  const addDishToDinner = () => {
    const dishToAdd = currentDish;

    addDishToDinnerByDish(dishToAdd);
    window.setTimeout(() => showNextRelatedDish(dishToAdd.id), 820);
    window.setTimeout(() => recordFeedback(dishToAdd, "like"), 1050);
  };

  const toggleFavoriteDish = (dish: DinnerDish) => {
    setFavoriteDishIds((current) =>
      current.includes(dish.id) ? current.filter((dishId) => dishId !== dish.id) : [...current, dish.id],
    );
  };

  const removeFavoriteDish = (dishId: string) => {
    setFavoriteDishIds((current) => current.filter((favoriteDishId) => favoriteDishId !== dishId));
  };

  const restart = () => {
    setPrompt("");
    setSelectedChips([]);
    selectedChipsRef.current = [];
    setCurrentIndex(0);
    setRelatedRefreshOffset(0);
    setDinnerDishes([]);
    setTrayOpen(false);
    setPredictionSeed({ prompt: "", chips: [], source: "offline" });
    setCurrentOnlineDishIds([]);
    setGenerationNotice("");
    setView("home");
  };

  return (
    <AppShell
      deviceProfile={deviceProfile}
      onlineMode={onlineMode}
      onOnlineModeChange={setOnlineMode}
      onRestart={restart}
      favoriteDishes={favoriteDishes}
      onAddFavoriteDishToDinner={addDishToDinnerByDish}
      onRemoveFavoriteDish={removeFavoriteDish}
    >
      <FloatingNotice
        message={generationNotice}
        tone={generationNotice.includes("没有配置") || generationNotice.includes("失败") ? "error" : "info"}
        onClose={() => setGenerationNotice("")}
      />
      <div className={`main-experience flex flex-1 flex-col ${trayOpen ? "tray-background-blurred" : ""}`}>
        {view === "home" && (
          <HomeView
            prompt={prompt}
            selectedChips={selectedChips}
            nutritionMode={nutritionMode}
            onPromptChange={setPrompt}
            onToggleChip={toggleChip}
            onNutritionModeChange={setNutritionMode}
            onGenerate={generateRecommendations}
            onlineMode={onlineMode}
            weatherProfile={weatherProfile}
          />
        )}
        {view === "thinking" && <ThinkingView />}
        {view === "recommendation" && (
          <DishCard
            dish={currentDish}
            nutritionMode={nutritionMode}
            onDislike={() => handleFeedback("dislike")}
            onNext={showNextDish}
            onConfirm={addDishToDinner}
            relatedDishes={relatedDishes}
            onSelectRelatedDish={showDishById}
            onRefreshRelatedDishes={refreshRelatedDishes}
            favorite={favoriteDishIds.includes(currentDish.id)}
            onToggleFavorite={() => toggleFavoriteDish(currentDish)}
            weatherProfile={weatherProfile}
          />
        )}
        {view === "summary" && dinnerDishes.length > 0 && (
          <DinnerSummary dishes={dinnerDishes} nutritionMode={nutritionMode} onRestart={restart} />
        )}
      </div>
      {view !== "home" && (
        <DinnerTray
          dishes={dinnerDishes}
          open={trayOpen}
          onOpen={() => setTrayOpen(true)}
          onClose={() => setTrayOpen(false)}
          onRemoveDish={(dishId) => setDinnerDishes((current) => current.filter((dish) => dish.id !== dishId))}
          onStartDinner={() => {
            if (dinnerDishes.length > 0) {
              setTrayOpen(false);
              setView("summary");
            }
          }}
        />
      )}
    </AppShell>
  );
}
