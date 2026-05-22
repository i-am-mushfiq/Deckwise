# Deckwise

> Sequential, swipe-driven learning cards. Built for focused people who want to actually retain what they study.

![Status](https://img.shields.io/badge/status-active-c8761a?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-3a2912?style=flat-square) ![React](https://img.shields.io/badge/React-18-c8761a?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-3a2912?style=flat-square&logo=vite) ![PWA](https://img.shields.io/badge/PWA-ready-c8761a?style=flat-square) ![Tests](https://img.shields.io/badge/tests-180%20passing-4a9e5c?style=flat-square)

---

## What is Deckwise?

Deckwise is a **progressive, sequential card-learning system** — not a flashcard app.

Most learning tools shuffle cards randomly and treat all knowledge as equal. Deckwise is built on a different philosophy: **order matters**. Later concepts depend on earlier ones. The card sequence is the curriculum.

The interaction model is borrowed from Tinder's swipe mechanic, but applied to structured learning — each swipe is a deliberate cognitive signal, not a passive scroll.

---

## How it works

| Gesture / Button | Action |
|---|---|
| ← Swipe Left | Got it — mark complete and advance |
| → Swipe Right | Need to review — queued for later |
| ↑ Expand | Reveal deep dive context |
| Flag button | Mark for deeper research |
| ★ Star button | Bookmark cards to revisit |
| ↩ Back button | Undo the last swipe |

Cards are **ordered**. You move through a topic sequentially. When you finish, you see your review queue, flagged cards, and starred cards — each launchable as its own focused session in one tap.

---

## Features

### Learning
- **Swipe mechanics** — drag cards with spring physics and momentum, or tap the action buttons
- **Sequential progression** — cards advance in order; later concepts build on earlier ones
- **Deep dive layer** — every card has a hidden context layer revealed on Expand
- **Review queue** — right-swipe queues cards for revisiting at the end of a session
- **Flagged cards** — mark cards you need to research further; study them separately
- **Starred cards** — bookmark cards you want to return to; dedicated starred session
- **Undo** — go back one swipe at any point in a session
- **Resume from where you left off** — per-topic progress saved automatically

### Content
- **AI card generation** — type any topic and generate a full sequenced deck via Groq (Llama 3.3 70B)
- **Community decks** — curated topics (Stoic Philosophy, Financial Literacy, Public Speaking) ready to add
- **Full library CRUD** — create directories, topics, and cards entirely in-app
- **JSON import** — paste any compatible topic JSON to add new content instantly
- **Nested library** — organise topics into folders and sub-folders

### Sync & Account
- **Sign in with Google** — one tap, OAuth via Supabase
- **Magic link** — sign in via email, no password required
- **Cloud sync** — library and progress sync automatically across devices (2-second debounce)
- **Conflict resolution** — when signing in on a new device with existing local data, choose to upload local or pull from cloud

### Experience
- **5 themes** — Rustic Autumn, Midnight, Forest, Slate, Obsidian; persists across sessions
- **PWA** — installs on iPhone and Android home screen, works fully offline
- **Haptics** — tactile feedback on every swipe and interaction (Android + supported iOS)
- **Synthesized audio** — all sounds generated via Web Audio API, no audio files

---

## Screenshots

> _Add your screenshots here after deploying_

| Home | Learning | Completion |
|---|---|---|
| `screenshot-home.png` | `screenshot-learn.png` | `screenshot-done.png` |

---

## Tech stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build tool | Vite 5 |
| PWA | vite-plugin-pwa + Workbox |
| Storage | localStorage (primary) + Supabase Postgres (cloud sync) |
| Auth | Supabase (Google OAuth + magic link) |
| AI | Groq API (Llama 3.3 70B) via Vercel serverless function |
| Styling | Inline React styles — zero CSS files |
| Deployment | Vercel |
| Tests | Vitest + MSW + Playwright (180 unit/integration + 29 E2E) |

---

## Getting started

### Prerequisites

- Node.js 18+ → [nodejs.org](https://nodejs.org)
- npm (comes with Node)
- Git

### Local development

```bash
# Clone the repo
git clone https://github.com/i-am-mushfiq/Deckwise.git
cd Deckwise

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`. The app loads with two demo topics (Critical Thinking, How to Learn Anything) and works immediately — no env vars required for basic use.

### Production build

```bash
npm run build
```

Output goes to `/dist` — a fully static site ready to deploy anywhere.

---

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel
```

Follow the prompts. Your app is live in under a minute.

**Or via GitHub auto-deploy:**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select `Deckwise` → Deploy
4. Every `git push` auto-deploys from now on

### Environment variables

Set these in Vercel → Project → Settings → Environment Variables (or `.env.local` for local dev):

| Key | Where to get it | Required for |
|---|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | AI card generation |
| `VITE_SUPABASE_URL` | Supabase project → Settings → API | Auth + cloud sync |
| `VITE_SUPABASE_ANON_KEY` | Supabase project → Settings → API | Auth + cloud sync |

**Everything works without these** — AI generation shows an error, auth/sync is silently disabled, and the app runs fully offline-only.

### Other platforms

The `/dist` output is a static site — it deploys to Netlify, Cloudflare Pages, or GitHub Pages with zero configuration. The `/api/generate` serverless function requires Vercel or another Node.js serverless host.

---

## Installing on iPhone

1. Deploy to Vercel and get your live URL
2. Open the URL in **Safari** on your iPhone (must be Safari)
3. Tap the **Share** button `⬆`
4. Tap **Add to Home Screen** → **Add**

Deckwise now lives on your home screen — full screen, no browser chrome, works offline.

---

## Content — JSON schema

Deckwise is content-agnostic. Import any topic via JSON:

```json
{
  "id": "gradient-descent",
  "title": "Gradient Descent",
  "type": "topic",
  "path": ["Machine Learning", "Optimization"],
  "cards": [
    {
      "id": "gd-1",
      "order": 1,
      "title": "The Problem: Finding the Lowest Point",
      "body": "Training a model means adjusting parameters until predictions are accurate. Gradient descent is the algorithm that finds the best parameter values systematically.",
      "context": "Imagine you are blindfolded on a hilly landscape trying to find the lowest valley. You can feel the slope under your feet. Gradient descent works the same way — it feels the local slope and takes a step downhill.",
      "tags": ["foundational", "analogy"],
      "difficulty": 1
    }
  ]
}
```

### Field reference

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique slug |
| `title` | string | Display name of the topic |
| `type` | string | Always `"topic"` |
| `path` | string[] | Breadcrumb, e.g. `["Machine Learning", "Optimization"]` |
| `cards[].id` | string | Unique card ID |
| `cards[].order` | number | Cards render in ascending order — this IS the curriculum |
| `cards[].title` | string | Short concept name |
| `cards[].body` | string | Core explanation, 2–4 sentences, one idea only |
| `cards[].context` | string | Deep dive — shown on Expand, answers "but why?" |
| `cards[].tags` | string[] | Labels, e.g. `["foundational", "mechanism"]` |
| `cards[].difficulty` | number | `1` = Intro, `2` = Core, `3` = Advanced |

### Generating content with AI

Click **AI Prompt** on the home screen, type a topic, and hit **Generate with AI**. Deckwise calls the Groq API and builds a sequenced deck automatically. You can preview the cards before adding to your library.

Alternatively, use the **Copy Master Prompt** button and paste into any LLM (ChatGPT, Claude, Gemini), then import the JSON output via **Edit Library → Import JSON**.

---

## Project structure

```
Deckwise/
├── api/
│   └── generate.js           ← Vercel serverless — Groq AI proxy
├── e2e/
│   ├── learn-flow.spec.js    ← Playwright E2E — learn screen, completion, sidebar
│   └── persistence.spec.js   ← Playwright E2E — localStorage survives page reloads
├── public/
│   ├── icon-192.png          ← PWA icon (iOS home screen)
│   └── icon-512.png          ← PWA icon (splash screen)
├── src/
│   ├── main.jsx              ← React entry point
│   ├── App.jsx               ← Entire application (~1400 lines)
│   ├── lib.js                ← Pure utility functions (tree traversal, localStorage)
│   ├── supabase.js           ← Supabase client (null when unconfigured)
│   ├── test/
│   │   ├── setup.js          ← Vitest global setup + browser API mocks
│   │   ├── server.js         ← MSW server instance
│   │   └── handlers.js       ← Default MSW network handlers
│   └── __tests__/
│       ├── fixtures.js       ← Shared test data
│       ├── unit/             ← Pure function tests
│       ├── api/              ← Serverless handler tests
│       └── integration/      ← Full app render tests (MSW + Supabase spies)
├── vite.config.js            ← Vite + PWA plugin config
├── playwright.config.js      ← E2E test config
└── package.json
```

---

## Running tests

```bash
# Unit + integration tests (~13s)
npm test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (install browsers first)
npx playwright install
npm run test:e2e

# E2E with interactive UI
npm run test:e2e:ui

# Everything
npm run test:all
```

The test suite covers the full pipeline: swipe logic, library CRUD, AI generation (MSW network interception), Supabase auth and sync (spy mocks), and localStorage persistence across real page reloads (Playwright).

---

## Themes

Switch between five themes in the sidebar:

| Theme | Background | Accent |
|---|---|---|
| **Rustic Autumn** | Dark charred bark `#1c1208` | Burnt amber `#c8761a` |
| **Midnight** | Deep navy `#0d0f18` | Electric blue `#5b8de8` |
| **Forest** | Dark moss `#0a1209` | Sage green `#4a9e5c` |
| **Slate** | Charcoal `#0f1117` | Cool periwinkle `#7c9ef0` |
| **Obsidian** | Pure black `#000000` | Gold `#d4a017` |

Your selected theme persists across sessions via localStorage.

---

## Roadmap

- [x] AI-generated card content (Groq / Llama 3.3 70B)
- [x] Starred cards + dedicated starred sessions
- [x] Undo last swipe
- [x] Cloud sync across devices (Supabase)
- [x] Google OAuth + magic link sign-in
- [x] Multiple themes
- [x] Community decks
- [x] Full behavioral test suite (180 tests)
- [ ] Export progress as JSON backup
- [ ] Spaced repetition scheduling for the review queue
- [ ] Card search
- [ ] Share topics as links
- [ ] Streak tracking

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes — run `npm test` before committing
4. Push: `git push origin feature/your-feature`
5. Open a pull request

See `handoff.md` for a complete engineering reference: architecture, state model, data schemas, and known technical debt.

---

## License

MIT — do whatever you want with it.

---

## Author

Built by [@i-am-mushfiq](https://github.com/i-am-mushfiq)

---

> _"The order of cards matters because later concepts depend on earlier understanding."_
