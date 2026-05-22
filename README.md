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
- **AI rate limiting** — 1000 AI cards per day (free tier); resets at 00:00 GMT. Usage bar in sidebar with live remaining count. Enforced server-side per authenticated user, client-side for anonymous sessions.
- **Community decks** — curated topics (Stoic Philosophy, Financial Literacy, Public Speaking) ready to add
- **Full library CRUD** — create directories, topics, and cards entirely in-app
- **JSON import** — paste any compatible topic JSON to add new content instantly
- **Nested library** — organise topics into folders and sub-folders

### Sync & Account
- **Sign in with Google** — one tap, OAuth via Supabase
- **Magic link** — sign in via email, no password required
- **Offline-first** — all reads and writes go to localStorage first; cloud sync is best-effort, never blocking
- **Cloud sync** — library and progress sync automatically across devices (2-second debounce)
- **Retry on reconnect** — if sync fails while offline, the app retries automatically the moment connectivity returns. No data loss.
- **Conflict resolution** — when signing in on a new device with existing local data, choose to upload local or pull from cloud
- **Clean sign-out** — signing out resets the app to demo-deck defaults; the next session starts as a clean slate

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
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API | Auth + cloud sync |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Auth + cloud sync |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role | Server-side AI rate limiting |

> `SUPABASE_SERVICE_ROLE_KEY` is server-only — no `VITE_` prefix. Never expose it to the browser.

**Everything works without these** — AI generation shows an error, auth/sync is silently disabled, and the app runs fully offline-only.

### Supabase setup (one-time)

If using auth + AI rate limiting, create the `ai_usage` table in your Supabase SQL editor:

```sql
CREATE TABLE public.ai_usage (
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date  date        NOT NULL,
  cards_count integer     NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage: own rows only"
  ON public.ai_usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

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
│   └── generate.js                   ← Vercel serverless — Groq AI proxy + rate limiting
├── e2e/
│   ├── learn-flow.spec.js            ← Playwright E2E — learn screen, completion, sidebar
│   └── persistence.spec.js           ← Playwright E2E — localStorage survives reloads
├── public/
│   ├── icon-192.png                  ← PWA icon (iOS home screen)
│   └── icon-512.png                  ← PWA icon (splash screen)
├── src/
│   ├── main.jsx                      ← React entry point
│   ├── App.jsx                       ← Orchestrator (~307 lines): state, routing, callbacks
│   ├── lib.js                        ← Pure utility functions (tree traversal, localStorage)
│   ├── supabase.js                   ← Supabase client (null when unconfigured)
│   ├── theme.js                      ← Theme constants + mutable style singleton (S, F)
│   ├── audio.js                      ← Web Audio engine (hap, snd, synthesized sounds)
│   ├── ai.js                         ← generateCards(), AI_TIERS, todayGMT()
│   ├── constants.js                  ← DEMO_DATA, COMMUNITY_DECKS
│   ├── hooks/
│   │   ├── useSync.js                ← Cloud sync, offline detection, retry on reconnect
│   │   └── useAiUsage.js             ← AI usage state, GMT rollover, localStorage persistence
│   ├── components/
│   │   ├── ui/
│   │   │   ├── SpotifyBtn.jsx        ← Reusable pill button
│   │   │   ├── Modal.jsx             ← Base modal wrapper
│   │   │   └── Field.jsx             ← Labelled input field
│   │   ├── library/
│   │   │   ├── LibraryEditor.jsx     ← Library root panel
│   │   │   ├── EditorTree.jsx        ← Recursive tree renderer
│   │   │   ├── DirectoryNode.jsx     ← Single directory/topic row
│   │   │   ├── CardSetManager.jsx    ← Card list + reorder within a topic
│   │   │   ├── DirectoryModal.jsx    ← Create/rename directory dialog
│   │   │   ├── TopicModal.jsx        ← Create/rename topic dialog
│   │   │   ├── CardModal.jsx         ← Create/edit card dialog
│   │   │   └── ImportModal.jsx       ← JSON import dialog
│   │   ├── ai/
│   │   │   ├── PromptContent.jsx     ← AI generation form + results
│   │   │   └── PromptModal.jsx       ← Modal wrapper for PromptContent
│   │   ├── DraggableCard.jsx         ← Swipeable card with spring physics
│   │   ├── ActionBar.jsx             ← Swipe action buttons
│   │   ├── ProgressBar.jsx           ← Session progress indicator
│   │   ├── CompletionScreen.jsx      ← End-of-deck summary
│   │   ├── AuthModal.jsx             ← Google OAuth + magic link sign-in
│   │   ├── MergeModal.jsx            ← Cloud vs local conflict resolution
│   │   └── Sidebar.jsx               ← Nav, theme switcher, sync status, AI usage bar
│   ├── test/
│   │   ├── setup.js                  ← Vitest global setup + browser API mocks
│   │   ├── server.js                 ← MSW server instance
│   │   └── handlers.js               ← Default MSW network handlers
│   └── __tests__/
│       ├── fixtures.js               ← Shared test data
│       ├── unit/                     ← Pure function tests
│       ├── api/                      ← Serverless handler tests
│       └── integration/              ← Full app render tests (MSW + Supabase spies)
├── vite.config.js                    ← Vite + PWA + Workbox caching config
├── playwright.config.js              ← E2E test config
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
- [x] Offline-first architecture — localStorage primary, cloud best-effort, retry on reconnect
- [x] AI rate limiting — 1000 cards/day (free tier), server-enforced, daily usage bar in sidebar
- [x] Clean sign-out — full local state reset on sign-out
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

---

## License

MIT — do whatever you want with it.

---

## Author

Built by [@i-am-mushfiq](https://github.com/i-am-mushfiq)

---

> _"The order of cards matters because later concepts depend on earlier understanding."_
