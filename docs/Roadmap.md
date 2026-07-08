# Roadmap

## Current Version: V1.1

- Local-first dinner planner prototype
- Offline dish library with generated recommendations
- Like/dislike preference learning
- Related dish suggestions with conversational labels
- Multi-dish dinner tray with remove controls
- Combined shopping list and cooking steps summary
- Tray overlay with solid panel and blurred background page
- GitHub Pages deployment

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

- Add live weather through a backend proxy
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
