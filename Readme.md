# AI Dinner Planner

A personal local-first dinner decision assistant that helps Woody decide tonight's dinner in about two minutes.

Phase 1 is an interactive prototype for GitHub Pages. It uses React, TypeScript, Tailwind CSS, offline dish data, and browser localStorage. It does not call OpenAI, does not use a backend, and does not expose API keys.

## Current Version

V1.1 is the tray-first local dinner planning release. It keeps the local-first offline recommendation engine from V1.0, then adds a clearer multi-dish dinner tray, stronger selection feedback, conversational recommendation labels, and a more polished tray overlay with a real blurred background layer.

## V1.1 Update Notes

- Moved confirmed dishes into a dinner tray instead of jumping directly to the final summary.
- Added a tray popup with selected dishes, remove controls, and a single "开饭" action.
- Combined shopping lists and cooking steps across all tray dishes on the final summary page.
- Replaced numeric recommendation scores and relevance numbers with plain-language cues such as "爽口!", "最像这口!", and "最佳搭配!".
- Changed the recommendation card header to "为你推荐" while keeping the weather reason module.
- Replaced the dish flying animation with clearer green selection feedback on the card and confirm button.
- Added visible background blur when the tray opens, while keeping the tray panel solid and readable.
- Enabled local prediction ranking from prompt intent, chips, and stored preference feedback.

## Product Vision

Dinner planning should feel like asking a calm personal assistant, not browsing a recipe database. The app combines a short natural-language request, quick preference chips, weather-style context, nutrition mode, and like/dislike feedback to recommend one dinner at a time.

## User Flow

1. Open the app on mobile Safari.
2. Type what tonight feels like or tap quick chips.
3. Toggle nutrition mode if useful.
4. Generate mock recommendations.
5. Like, dislike, replace, or confirm a dish.
6. View a shareable dinner summary with shopping list and cooking steps.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- localStorage for preferences and feedback history
- GitHub Pages for static hosting
- GitHub Actions for automatic deployment

## Local-First Architecture

All Phase 1 behavior runs in the browser:

- Offline dishes live in `src/data/offlineDishes.ts`.
- Preferences live in localStorage.
- Likes and dislikes update tag scores locally.
- Recommendation ranking is simulated in `src/utils/preferenceEngine.ts`.
- Shopping lists are generated from local dish data.

No backend, database, login system, weather API, or OpenAI API is used in this phase.

## Run Locally

```bash
npm install
npm run dev
```

Build production files:

```bash
npm run build
```

The production output is written to `dist`.

## GitHub Pages Deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys the `dist` folder to GitHub Pages whenever `main` is pushed.

Before deploying, check `vite.config.ts`:

```ts
base: "/MealMind/"
```

For a project site, set this to `"/your-repository-name/"`. For a user or organization site, set it to `"/"`.

## Future Backend Plan

The intended production architecture is:

- GitHub Pages frontend
- Azure Function API proxy
- OpenAI API for real recommendation generation
- Weather API for live weather context
- User choice controls for better recommendation steering
- Automatic capture of each online-requested dish back into the offline menu
- Secrets stored only in Azure, never in frontend code

## Security Warning

Do not put OpenAI API keys, Weather API keys, or any private secrets in frontend code, `.env` files committed to GitHub, or GitHub Pages builds.
