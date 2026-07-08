# Roadmap

## Current Version: V1.0

- Local-first dinner planner prototype
- Offline dish library with generated recommendations
- Like/dislike preference learning
- Related dish suggestions
- GitHub Pages deployment

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
