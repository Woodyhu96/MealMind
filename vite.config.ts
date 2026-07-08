import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages project sites, update this to "/your-repository-name/".
  // For a user or organization site, keep it as "/".
  base: "/MealMind/",
});
