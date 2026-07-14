# Roadmap

## Current Version: V1.4

- Local-first dinner planner prototype
- Offline dish library with generated recommendations
- Like/dislike preference learning
- Live approximate city and weather context through keyless public APIs
- Weather-aware recommendation ranking for hot, cold, rainy, and mild conditions
- Explicit Protein x flavor combination coverage with at least two visibly matching dishes per combination
- Current user selections outrank weather and historical preference signals
- Local Online mode proxy for OpenAI-generated dishes in development
- Server-side `.env` API key handling for Online mode
- Floating dismissible error notices for missing Online configuration
- Related dish suggestions with conversational labels
- Multi-dish dinner tray with remove controls
- Combined shopping list and cooking steps summary
- Tray overlay with solid panel and blurred background page
- GitHub Pages deployment

## V1.4 Release Notes

- Added local Online mode generation through the Vite dev server at `/api/online-dinner`.
- Added structured OpenAI Responses API mapping into existing MealMind dish cards, trays, summaries, shopping lists, and cooking steps.
- Moved Online credentials to server-side `.env` variables and kept API keys out of browser bundles.
- Added a dismissible floating error notice when Online mode is missing configuration or a request fails.
- Kept GitHub Pages static-safe by falling back to offline recommendations when no backend is available.
- Fixed fish-protein matching so `鱼香肉丝` and similar fish-fragrant dishes do not rank as fish.
- Adopted release versioning: major updates use `V1.0 -> V2.0`, medium feature updates use `V1.1 -> V1.2`, and bug/minor fixes use `V1.1.0 -> V1.1.1`.

## V1.3 Release Notes

- Expanded the offline Chinese home-cooking library from 184 to 204 dishes.
- Added enough dishes to cover every Protein x flavor filter combination with at least two visible matches.
- Changed flavor matching so `蒜香`, `黑椒`, `咖喱`, and `酸甜` must be present in the dish name, description, or tags.
- Fixed `鸡肉` matching so chicken filters do not match egg-only dishes.
- Strengthened ranking so current selections have priority over weather and stored preference history.
- Verified example combinations: `牛肉 + 蒜香` and `鸡肉 + 酸甜`.

## V1.2 Release Notes

- Added approximate location lookup with `ipapi.co`, falling back to `ipwho.is`.
- Added Open-Meteo current weather lookup for temperature, apparent temperature, weather condition, and local season.
- Home and recommendation views now show live city/weather context.
- Recommendations now adapt to weather: hot weather boosts light and refreshing dishes, while cold or rainy weather boosts soups, casseroles, and warming dishes.
- Expanded the offline Chinese home-cooking dish library.
- Removed internal source tags from dish tags so `大厨` and `搜索补充` are not used as recommendation indexes.

## V1.1 Release Notes

- Confirming a dish now adds it to the dinner tray instead of immediately opening the final summary.
- The tray can hold multiple dishes, remove dishes, and start dinner when ready.
- The recommendation page no longer shows numeric scores or relevance values to the user.
- Recommendation labels now use simple language such as "爽口!", "很下饭!", "最像这口!", and "最佳搭配!".
- The recommendation card top label now says "为你推荐"; weather context remains inside the weather reason module.
- Selection feedback now uses a visible green highlight and button color change.
- Opening the tray blurs the background recommendation page and keeps the tray panel solid white.
- Local prediction now uses current prompt intent, selected chips, and stored local preferences.

## Phase 1: Local Prototype

- React + TypeScript + Vite app
- Tailwind CSS styling
- Mock dinner data
- Mock thinking state
- Local preference scoring
- Shopping list grouping
- GitHub Pages deployment

## Phase 2: Real Context

- Optionally move weather/location lookup behind a backend proxy for stricter privacy and request control
- Add richer preference controls
- Add explicit user selection controls for cuisine, time, ingredients, and nutrition intent
- Add pantry-aware recommendations
- Add saved dinner history

## Phase 3: AI Recommendations

- Add Azure Function API proxy
- Connect OpenAI from the server side only
- Generate recommendations from preferences, weather, nutrition mode, and pantry notes
- Add ChatGPT/OpenAI API online recommendation mode
- Store every online-requested dish into the offline menu after the user accepts or requests it
- Keep API keys out of frontend code

## Phase 4: Personal Assistant Polish

- Swipe gestures
- Share image export
- Weekly dinner memory
- Adaptive suggestions based on season and routine
