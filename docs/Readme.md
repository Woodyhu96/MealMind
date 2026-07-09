# 🍽️ AI Dinner Planner

> A local-first AI dinner decision assistant that helps you decide what to eat tonight based on your preferences, nutrition goals, weather, and past choices.

---

# Current Version

V1.2 adds live approximate city/weather context, weather-aware local ranking, an expanded offline Chinese home-cooking menu, and cleaned dish tags that exclude internal source labels from recommendation indexing.

---

# 1. Product Vision

## Problem

Every day, deciding "what should I eat tonight?" creates unnecessary mental effort.

Existing solutions usually focus on:

* Recipe searching
* Ingredient databases
* Cooking instructions
* Nutrition tracking

However, they do not solve the actual decision problem:

> "Given my preferences, my schedule, my goals, and today's environment, what dinner is best for me?"

---

## Vision

AI Dinner Planner aims to become a personal dinner assistant that can:

* Understand personal taste preferences
* Consider local weather and season
* Recommend suitable dinner options
* Learn from likes/dislikes
* Generate shopping lists and cooking instructions
* Create beautiful shareable dinner cards

The goal:

> Decide tonight's dinner within 2 minutes.

---

# 2. Product Positioning

## This is NOT:

❌ Recipe application
❌ Nutrition tracking application
❌ Grocery shopping application
❌ Restaurant recommendation application

## This IS:

✅ AI Dinner Decision Assistant

The product focuses on one question:

> "What should I eat tonight?"

---

# 3. Design Philosophy

## Apple-inspired Experience

The product follows Apple-style design principles:

* Minimal interaction
* Content-first UI
* Clean typography
* Smooth animations
* Calm visual experience
* Mobile-first design

The user should feel:

> "The app understands me."

Not:

> "I am configuring an AI system."

---

# 4. Core User Flow

```
Open App

    ↓

Input today's request

    ↓

AI analyzes:
- Personal preference
- Weather
- Nutrition goals
- Cooking time

    ↓

Generate dinner candidates

    ↓

Swipe dishes

    ↓

Like / Dislike / Replace

    ↓

Confirm dinner

    ↓

Generate Dinner Plan

    ↓

Share / Screenshot
```

---

# 5. MVP Scope (Phase 1)

## Must Have Features

### 1. Dinner Input

Users can provide:

* Natural language requests

Examples:

```
I want something warm today.

Need high protein after badminton.

Something spicy.

I have chicken at home.
```

Quick options:

* 🌶 Spicy
* 🥩 High Protein
* 🍲 Soup
* ⏱ Under 30 minutes
* 🥗 Light meal

---

### 2. Weather Context

The system automatically retrieves:

* Location
* Temperature
* Weather condition
* Season

Example:

```
Toronto
-8°C
Snow
Winter
```

The AI adjusts recommendations:

Cold weather:

Prefer:

* Soup
* Stew
* Warm dishes

Avoid:

* Cold salads
* Light summer meals

Hot weather:

Prefer:

* Seafood
* Light dishes
* Fresh vegetables

Avoid:

* Heavy stews

---

### 3. AI Dinner Recommendation

Generate 5 dinner candidates.

Each candidate contains:

* Dish name
* Taste description
* Recommendation reason
* Nutrition information
* Cooking time
* Tags

Example:

```
Tomato Beef Stew

Sweet and sour tomato broth,
tender beef with a rich flavor.

Why recommended:

❄ Toronto winter weather
❤️ You often enjoy beef dishes
💪 High protein goal

650 kcal
48g protein
45 minutes
```

---

### 4. Tinder-style Interaction

Users interact through:

❤️ Like

❌ Dislike

🔄 Replace

Feedback influences future recommendations.

---

### 5. Dinner Summary Card

After confirmation:

Generate:

```
Tonight's Dinner

🍲 Tomato Beef Stew

Weather:
Toronto -5°C

Nutrition:
650 kcal
48g Protein

Shopping List:
☐ Beef
☐ Tomato
☐ Onion

Cooking Time:
45 min
```

Designed for:

* Screenshot
* Sharing
* Saving

---

# 6. Personal Preference Engine

## Goal

The system gradually learns user preferences.

No manual configuration required.

---

## Preference Model

Each dish contains tags:

Example:

```
Tomato Beef Stew

Tags:

beef
soup
warm
winter
high_protein
sweet
sour
```

---

## Scoring System

Positive feedback:

```
Like:

beef +5
soup +3
warm +3
winter +2
```

Negative feedback:

```
Dislike:

fried -5
oily -3
```

---

Example user profile:

```
Taste:

Spicy       +35
Sour        +20
Sweet       +10


Protein:

Beef        +40
Chicken     +20


Cooking Style:

Soup        +30
Stew        +25


Avoid:

Cilantro    -100
Fried       -30
```

---

# 7. Local-First Architecture

## Philosophy

Personal preference data stays on the user's device.

No account required.

---

Architecture:

```
             iPhone / Browser

                    |
                    |

             React PWA App

                    |

        ------------------------

        |                      |

 Local Storage          API Service

        |                      |

 Preferences             OpenAI API

 History                 Weather API

```

---

# 8. Technology Stack

## Frontend

Recommended:

* React
* TypeScript
* Tailwind CSS
* PWA

Responsibilities:

* UI rendering
* Swipe interaction
* Local storage
* Share card generation

---

## Backend

Lightweight serverless API:

Recommended:

* Azure Functions
* Python

Responsibilities:

* Protect API keys
* Call OpenAI
* Retrieve weather
* Process AI requests

---

## External Services

### AI

OpenAI API

Used for:

* Dinner generation
* Taste explanation
* Cooking instructions

### Weather

Open-Meteo API

Used for:

* Current temperature
* Weather condition
* Seasonal context

---

# 9. Project Structure

```
ai-dinner-planner/

│
├── README.md
│
├── docs/
│   ├── Product.md
│   ├── Design.md
│   ├── Prompt.md
│   ├── Architecture.md
│   └── Roadmap.md
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── utils/
│
├── backend/
│   ├── api/
│   ├── weather/
│   └── ai/
│
├── prompts/
│   ├── dinner_generation.md
│   ├── preference_learning.md
│   └── shopping_list.md
│
└── data/
    └── sample_menu.json
```

---

# 10. Development Roadmap

## Sprint 1 — Product Prototype

Goal:

Create a realistic UI prototype.

Tasks:

* Apple-style UI
* Dinner card
* Swipe interaction
* Share card design
* Mock data

Status:

🟡 In Progress

---

## Sprint 2 — AI Integration

Goal:

Replace mock data with real AI.

Tasks:

* OpenAI API integration
* JSON response schema
* Prompt engineering
* Error handling

---

## Sprint 3 — Weather Intelligence

Goal:

Make recommendations context-aware.

Tasks:

* Weather API integration
* Season logic
* Temperature-based recommendation

---

## Sprint 4 — Personal Preference Learning

Goal:

Make AI understand user.

Tasks:

* Like/dislike tracking
* Preference scoring
* Recommendation ranking

---

## Sprint 5 — Optimization

Future:

* Pantry management
* Calendar integration
* Grocery price integration
* Push notifications
* Multiple users
* Native mobile app

---

# 11. Future Vision

Long-term:

AI Dinner Planner becomes a personal food assistant:

Morning:

"Your dinner plan is ready."

After workout:

"You burned more calories today. Consider higher protein."

Before shopping:

"Only 3 ingredients needed."

During cooking:

"Step 2 is complete. Continue."

---

# 12. Success Metrics

The product succeeds if:

* User decides dinner within 2 minutes
* Recommendations improve over time
* User frequently chooses AI suggestions
* Final dinner card is worth sharing

---

# Current Status

Version:

`v1.2 Weather-aware local prototype`

Current focus:

1. Tune weather-aware local recommendations
2. Add richer user selection controls
3. Prepare ChatGPT/OpenAI API integration through a backend proxy
4. Store accepted online dishes back into the offline menu

---

Created as a personal AI dinner planning project.
