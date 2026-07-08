import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DinnerSummary } from "./components/DinnerSummary";
import { DishCard } from "./components/DishCard";
import { HomeView } from "./components/HomeView";
import { ThinkingView } from "./components/ThinkingView";
import { offlineDishes } from "./data/offlineDishes";
import { useDeviceProfile } from "./hooks/useDeviceProfile";
import { useLocalPreferences } from "./hooks/useLocalPreferences";
import type { DinnerDish } from "./types/dinner";
import { rankDishes } from "./utils/preferenceEngine";
import { getRelatedDishes } from "./utils/relatedDishes";

type View = "home" | "thinking" | "recommendation" | "summary";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [prompt, setPrompt] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [nutritionMode, setNutritionMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedDish, setConfirmedDish] = useState<DinnerDish | null>(null);
  const deviceProfile = useDeviceProfile();
  const { preferences, recordFeedback } = useLocalPreferences();

  const rankedDishes = useMemo(
    () => rankDishes(offlineDishes, preferences, nutritionMode),
    [nutritionMode, preferences],
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
    setView("thinking");
    window.setTimeout(() => {
      setCurrentIndex(0);
      setView("recommendation");
    }, 1700);
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

  const handleFeedback = (feedback: "like" | "dislike") => {
    recordFeedback(currentDish, feedback);
    showNextDish();
  };

  const confirmDish = () => {
    setConfirmedDish(currentDish);
    setView("summary");
  };

  const restart = () => {
    setConfirmedDish(null);
    setView("home");
  };

  return (
    <AppShell deviceProfile={deviceProfile}>
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
          onConfirm={confirmDish}
          relatedDishes={relatedDishes}
          onSelectRelatedDish={showDishById}
        />
      )}
      {view === "summary" && confirmedDish && (
        <DinnerSummary dish={confirmedDish} nutritionMode={nutritionMode} onRestart={restart} />
      )}
    </AppShell>
  );
}
