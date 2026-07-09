import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DinnerSummary } from "./components/DinnerSummary";
import { DinnerTray } from "./components/DinnerTray";
import { DishCard } from "./components/DishCard";
import { HomeView } from "./components/HomeView";
import { ThinkingView } from "./components/ThinkingView";
import { offlineDishes } from "./data/offlineDishes";
import { useDeviceProfile } from "./hooks/useDeviceProfile";
import { useLocalPreferences } from "./hooks/useLocalPreferences";
import type { DinnerDish, WeatherProfile } from "./types/dinner";
import { rankDishesByLocalPrediction } from "./utils/preferenceEngine";
import { getRelatedDishes } from "./utils/relatedDishes";
import { adaptDishesToWeather } from "./utils/weatherAdaptation";
import { fetchWeatherProfile, getFallbackWeatherProfile } from "./utils/weatherApi";

type View = "home" | "thinking" | "recommendation" | "summary";
const favoritesStorageKey = "ai-dinner-planner.favorites.v1";

function loadFavoriteIds() {
  try {
    const value = localStorage.getItem(favoritesStorageKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
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
  const [predictionSeed, setPredictionSeed] = useState({ prompt: "", chips: [] as string[] });
  const [onlineMode, setOnlineMode] = useState(false);
  const [favoriteDishIds, setFavoriteDishIds] = useState<string[]>(() => loadFavoriteIds());
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

  const weatherAwareDishes = useMemo(() => adaptDishesToWeather(offlineDishes, weatherProfile), [weatherProfile]);

  const rankedDishes = useMemo(
    () =>
      rankDishesByLocalPrediction(
        weatherAwareDishes,
        preferences,
        nutritionMode,
        predictionSeed.prompt,
        predictionSeed.chips,
        weatherProfile,
      ),
    [nutritionMode, preferences, predictionSeed, weatherAwareDishes, weatherProfile],
  );

  const currentDish = rankedDishes[currentIndex % rankedDishes.length];
  const favoriteDishes = useMemo(
    () =>
      favoriteDishIds
        .map((dishId) => weatherAwareDishes.find((dish) => dish.id === dishId))
        .filter((dish): dish is DinnerDish => Boolean(dish)),
    [favoriteDishIds, weatherAwareDishes],
  );

  const relatedDishes = useMemo(
    () => getRelatedDishes(currentDish, rankedDishes, deviceProfile === "desktop-chrome" ? 8 : 6, dinnerDishes),
    [currentDish, deviceProfile, dinnerDishes, rankedDishes],
  );

  const toggleChip = (chip: string) => {
    setSelectedChips((current) => {
      const next = current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip];
      selectedChipsRef.current = next;
      return next;
    });
  };

  const generateRecommendations = () => {
    const chips = selectedChipsRef.current;
    console.info("[AI Dinner Planner] Mock generation input", {
      prompt,
      selectedChips: chips,
      nutritionMode,
    });
    setPredictionSeed({ prompt, chips });
    setView("thinking");
    window.setTimeout(() => {
      setCurrentIndex(0);
      setView("recommendation");
    }, 3900);
  };

  const showNextDish = () => {
    setCurrentIndex((index) => (index + 1) % rankedDishes.length);
  };

  const showDishById = (dishId: string) => {
    const nextIndex = rankedDishes.findIndex((dish) => dish.id === dishId);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    }
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
    setDinnerDishes([]);
    setTrayOpen(false);
    setPredictionSeed({ prompt: "", chips: [] });
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
            onLike={() => handleFeedback("like")}
            onDislike={() => handleFeedback("dislike")}
            onNext={showNextDish}
            onConfirm={addDishToDinner}
            relatedDishes={relatedDishes}
            onSelectRelatedDish={showDishById}
            favorite={favoriteDishIds.includes(currentDish.id)}
            onToggleFavorite={() => toggleFavoriteDish(currentDish)}
            weatherProfile={weatherProfile}
          />
        )}
        {view === "summary" && dinnerDishes.length > 0 && (
          <DinnerSummary dishes={dinnerDishes} nutritionMode={nutritionMode} onRestart={restart} />
        )}
      </div>
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
    </AppShell>
  );
}
