import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DinnerSummary } from "./components/DinnerSummary";
import { DinnerTray } from "./components/DinnerTray";
import { DishCard } from "./components/DishCard";
import { HomeView } from "./components/HomeView";
import { ThinkingView } from "./components/ThinkingView";
import { offlineDishes } from "./data/offlineDishes";
import { useDeviceProfile } from "./hooks/useDeviceProfile";
import { useLocalPreferences } from "./hooks/useLocalPreferences";
import type { DinnerDish } from "./types/dinner";
import { rankDishesByLocalPrediction } from "./utils/preferenceEngine";
import { getRelatedDishes } from "./utils/relatedDishes";

type View = "home" | "thinking" | "recommendation" | "summary";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [prompt, setPrompt] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [nutritionMode, setNutritionMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dinnerDishes, setDinnerDishes] = useState<DinnerDish[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  const [predictionSeed, setPredictionSeed] = useState({ prompt: "", chips: [] as string[] });
  const deviceProfile = useDeviceProfile();
  const { preferences, recordFeedback } = useLocalPreferences();

  const rankedDishes = useMemo(
    () =>
      rankDishesByLocalPrediction(
        offlineDishes,
        preferences,
        nutritionMode,
        predictionSeed.prompt,
        predictionSeed.chips,
      ),
    [nutritionMode, preferences, predictionSeed],
  );

  const currentDish = rankedDishes[currentIndex % rankedDishes.length];

  const relatedDishes = useMemo(
    () => getRelatedDishes(currentDish, rankedDishes, deviceProfile === "desktop-chrome" ? 8 : 6),
    [currentDish, deviceProfile, rankedDishes],
  );

  const toggleChip = (chip: string) => {
    setSelectedChips((current) =>
      current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip],
    );
  };

  const generateRecommendations = () => {
    console.info("[AI Dinner Planner] Mock generation input", {
      prompt,
      selectedChips,
      nutritionMode,
    });
    setPredictionSeed({ prompt, chips: selectedChips });
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
    const excludedDishIds = new Set([...dinnerDishes.map((dish) => dish.id), extraExcludedDishId].filter(Boolean));
    const nextDish = relatedDishes.find(({ dish }) => !excludedDishIds.has(dish.id))?.dish;

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

  const addDishToDinner = () => {
    const dishToAdd = currentDish;

    setDinnerDishes((current) => {
      if (current.some((dish) => dish.id === dishToAdd.id)) {
        return current;
      }

      return [...current, dishToAdd];
    });
    window.setTimeout(() => showNextRelatedDish(dishToAdd.id), 820);
    window.setTimeout(() => recordFeedback(dishToAdd, "like"), 1050);
  };

  const restart = () => {
    setDinnerDishes([]);
    setTrayOpen(false);
    setView("home");
  };

  return (
    <AppShell deviceProfile={deviceProfile}>
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
