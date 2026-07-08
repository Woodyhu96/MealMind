# Product

AI Dinner Planner helps the user answer one question: "What should I eat tonight?"

The product is intentionally narrow. It is not a recipe search engine, grocery app, restaurant finder, or nutrition tracker. It is a fast dinner decision assistant that learns from simple feedback.

## Phase 1 Scope

- Mobile-first single-page web app
- Mock AI recommendation flow
- Mock weather context
- Local preference learning
- One dish recommendation at a time
- Final dinner summary with shopping list and cooking steps
- GitHub Pages deployment

## Core Interaction

The user opens the app, describes tonight's dinner mood, taps any useful quick chips, and asks for a recommendation. The app simulates a short thinking state, then shows one dinner card. The user can like, dislike, replace, or confirm.

## Preference Learning

Feedback stays local. When the user likes a dish, each tag gains 5 points. When the user dislikes a dish, each tag loses 5 points. These tag scores influence future ranking.
