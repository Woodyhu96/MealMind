# Product

AI Dinner Planner helps the user answer one question: "What should I eat tonight?"

The product is intentionally narrow. It is not a recipe search engine, grocery app, restaurant finder, or nutrition tracker. It is a fast dinner decision assistant that learns from simple feedback.

## Phase 1 Scope

- Mobile-first single-page web app
- Offline recommendation flow with an optional local Online mode proxy
- Live approximate weather context with keyless public APIs
- Local preference learning
- One dish recommendation at a time
- Final dinner summary with shopping list and cooking steps
- GitHub Pages deployment

## Core Interaction

The user opens the app, describes tonight's dinner mood, taps any useful quick chips, and asks for a recommendation. The app shows a short thinking state, then presents one dinner card at a time. Offline mode ranks local dishes; local Online mode can generate structured dishes through a server-side OpenAI proxy when configured. The user can replace, favorite, or confirm dishes into the dinner tray.

## Preference Learning

Feedback stays local. When the user likes a dish, each tag gains 5 points. When the user dislikes a dish, each tag loses 5 points. These tag scores influence future ranking.
