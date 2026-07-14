# AI Dinner Planner

A personal local-first dinner decision assistant that helps Woody decide tonight's dinner in about two minutes.

Phase 1 is an interactive prototype for GitHub Pages. It uses React, TypeScript, Tailwind CSS, offline dish data, browser localStorage, and keyless location/weather APIs. Local development can also use a Vite server proxy for Online mode, while the published GitHub Pages build remains static and falls back to offline recommendations when no backend is available.

## Current Version

V1.4 is the Online-mode foundation release. It adds a local server-side OpenAI proxy for generated dishes, keeps API keys out of the browser bundle, shows a dismissible floating error notice when Online mode is not configured, and tightens fish-protein matching.

## V1.4 Update Notes

- Added an Online recommendation API path through the local Vite dev server at `/api/online-dinner`.
- Added structured OpenAI Responses API mapping so generated dishes use the same card, tray, shopping list, and cooking-step flow as offline dishes.
- Moved OpenAI credentials to server-side `.env` variables: `OPENAI_API_KEY` and optional `OPENAI_MODEL`.
- Added `.env.example` and `.gitignore` safeguards so private keys are not committed or bundled into the frontend.
- Added a floating, dismissible error notice for missing Online configuration and failed Online requests.
- Kept GitHub Pages static-safe: published builds fall back to offline recommendations when no API backend is available.
- Fixed fish protein matching so dishes such as `鱼香肉丝` are not treated as fish dishes, while actual fish dishes still rank correctly.
- Documented the versioning rule: major releases use `V1.0 -> V2.0`, medium feature updates use `V1.1 -> V1.2`, and bug/minor fixes use `V1.1.0 -> V1.1.1`.

## V1.3 Update Notes

- Expanded the offline Chinese home-cooking menu from 184 to 204 dishes.
- Added coverage for every Protein x flavor filter combination, with at least two dishes that visibly match both selected elements.
- Tightened flavor matching so labels such as `蒜香`, `黑椒`, `咖喱`, and `酸甜` must appear in the dish name, description, or tags rather than only in hidden seasonings.
- Fixed `鸡肉` matching so it no longer incorrectly matches `鸡蛋`.
- Fixed protein matching so dishes like `鱼香肉丝` and `鱼香茄子` are not treated as fish dishes.
- Updated local ranking so the user's current selections outrank weather and historical preference signals.
- Verified key examples: `牛肉 + 蒜香` recommends `黑椒蒜香牛肉粒`; `鸡肉 + 酸甜` recommends `宫保鸡丁`.

## Online Mode Setup

Online mode can call the OpenAI Responses API and map structured recommendations into the same MealMind card, tray, and dinner summary flow.

Create a local `.env` file from `.env.example`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

The key is intentionally not committed or exposed to the browser bundle. Local development uses the Vite dev server as a small proxy at `/api/online-dinner`. GitHub Pages builds without a backend and falls back to offline recommendations when online generation is unavailable.

ChatGPT web SSO is not used as an API credential. Online generation should use a server-side OpenAI API key or a future backend auth flow; browser-side ChatGPT login cookies should not be reused by MealMind.

## V1.2 Update Notes

- Added keyless approximate location lookup with `ipapi.co`, falling back to `ipwho.is` when needed.
- Added Open-Meteo current weather lookup for city, temperature, apparent temperature, weather condition, and season.
- Updated the home page and recommendation page to show the current city/weather context.
- Weather now adjusts local ranking: hot weather favors light, refreshing dishes; cold/rainy weather favors soups, casseroles, and warming dishes.
- Expanded the offline menu with additional Chinese home-style quick dishes.
- Removed internal source tags such as `大厨` and `搜索补充` from dish tags so they are not used as recommendation indexes.
- Kept V1.1 dinner tray, favorites, conversational labels, and combined summary behavior.

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

Published Phase 1 behavior runs in the browser:

- Offline dishes live in `src/data/offlineDishes.ts`.
- Preferences live in localStorage.
- Likes and dislikes update tag scores locally.
- Recommendation ranking is simulated in `src/utils/preferenceEngine.ts`.
- Approximate city/weather context is fetched client-side from keyless public APIs.
- Shopping lists are generated from local dish data.

The local development server can optionally proxy Online mode requests to OpenAI when `OPENAI_API_KEY` is configured. The static GitHub Pages app has no backend, database, login system, or exposed API keys.

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
- Weather context is already available client-side; a backend proxy can replace it later for stricter privacy/control.
- User choice controls for better recommendation steering
- Automatic capture of each online-requested dish back into the offline menu
- Secrets stored only in Azure, never in frontend code

## Security Warning

Do not put OpenAI API keys, Weather API keys, or any private secrets in frontend code, `.env` files committed to GitHub, or GitHub Pages builds.
