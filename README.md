# SwipeLearn

> Sequential, swipe-driven learning cards. Built for focused people who want to actually retain what they study.

![SwipeLearn](https://img.shields.io/badge/status-active-c8761a?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-3a2912?style=flat-square) ![React](https://img.shields.io/badge/React-18-c8761a?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-3a2912?style=flat-square&logo=vite) ![PWA](https://img.shields.io/badge/PWA-ready-c8761a?style=flat-square)

---

## What is SwipeLearn?

SwipeLearn is a **progressive, sequential card-learning system** — not a flashcard app.

Most learning tools shuffle cards randomly and treat all knowledge as equal. SwipeLearn is built on a different philosophy: **order matters**. Later concepts depend on earlier ones. The card sequence is the curriculum.

The interaction model is borrowed from Tinder's swipe mechanic, but applied to structured learning — each swipe is a deliberate cognitive signal, not a passive scroll.

---

## How it works

| Gesture | Action |
|---|---|
| ← Swipe Left | Got it — advance forward |
| → Swipe Right | Need to review — queued for later |
| ↑ Swipe Up | Reveal deep dive context |
| Flag button | Mark for deeper research |

Cards are **ordered**. You move through a topic sequentially. When you finish, you see your review queue and flagged cards — and can run through them again in one tap.

---

## Features

- **Swipe mechanics** — drag cards with spring physics and momentum, or use the action buttons
- **Sequential progression** — cards advance in order, later concepts build on earlier ones
- **Deep dive layer** — every card has a hidden context layer revealed on upswipe
- **Review queue** — right-swipe flags cards for revisiting at the end of a session
- **Research flags** — mark cards you need to investigate further
- **Resume from where you left off** — per-topic progress saved automatically
- **Full CRUD** — create directories, topics, and cards entirely in-app
- **JSON import** — paste any topic JSON to add new content instantly
- **Nested library** — organize topics into folders and sub-folders
- **PWA** — installs on iPhone and Android home screen, works offline
- **Haptics** — tactile feedback on every swipe and interaction (iOS/Android)
- **Rustic Autumn palette** — dark bark backgrounds, worn leather cards, burnt amber accent

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
| Storage | localStorage (persists on device) |
| Styling | Inline React styles — zero CSS files |
| Deployment | Vercel |
| Package manager | npm |

No backend. No database. No authentication. Everything lives on the user's device.

---

## Getting started

### Prerequisites

- Node.js 18+ → [nodejs.org](https://nodejs.org)
- npm (comes with Node)
- Git

### Local development

```bash
# Clone the repo
git clone https://github.com/i-am-mushfiq/swipelearn.git
cd swipelearn

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

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

Follow the prompts, accept all defaults. Your app is live in under a minute.

**Or via GitHub auto-deploy:**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select `swipelearn` → Deploy
4. Every `git push` auto-deploys from now on

### Other platforms

The `/dist` output is a static site — it deploys to Netlify, Cloudflare Pages, GitHub Pages, or any static host with zero configuration.

---

## Installing on iPhone

1. Deploy to Vercel (get your live URL)
2. Open the URL in **Safari** on your iPhone (must be Safari)
3. Tap the **Share** button `⬆`
4. Tap **Add to Home Screen**
5. Tap **Add**

SwipeLearn now lives on your home screen. Full screen, no browser chrome, works offline. Indistinguishable from a native app.

---

## Content — JSON schema

SwipeLearn is content-agnostic. You feed it topics via JSON. The structure:

```json
{
  "id": "gradient-descent",
  "title": "Gradient Descent",
  "type": "topic",
  "path": ["Machine Learning", "Optimization"],
  "cards": [
    {
      "id": "gradient-descent-1",
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
| `id` | string | Unique slug, e.g. `gradient-descent` |
| `title` | string | Display name of the topic |
| `type` | string | Always `"topic"` for importable content |
| `path` | string[] | Breadcrumb, e.g. `["Machine Learning", "Optimization"]` |
| `cards[].id` | string | Unique card ID, e.g. `gradient-descent-1` |
| `cards[].order` | number | Integer — cards render in ascending order |
| `cards[].title` | string | Short concept name |
| `cards[].body` | string | Core explanation, 2–4 sentences, one idea only |
| `cards[].context` | string | Deep dive — revealed on ↑ swipe, answers "but why?" |
| `cards[].tags` | string[] | Lowercase labels, e.g. `["foundational", "mechanism"]` |
| `cards[].difficulty` | number | `1` = Intro, `2` = Core, `3` = Advanced |

### Generating content with AI

Use this prompt with any LLM to generate valid SwipeLearn JSON:

> You are a curriculum designer. Break down the topic **[YOUR TOPIC]** into a sequential learning card set. Output only valid JSON matching this schema: `{ id, title, type: "topic", path, cards: [{ id, order, title, body, context, tags, difficulty }] }`. Cards must be ordered so each concept builds on the previous. One idea per card. Body = 2–4 sentences. Context = the deeper "why". Difficulty 1–3. No markdown, no preamble — raw JSON only.

---

## Project structure

```
swipelearn/
├── public/
│   ├── icon-192.png        ← PWA icon (iOS home screen)
│   └── icon-512.png        ← PWA icon (splash screen)
├── src/
│   ├── main.jsx            ← React entry point
│   └── App.jsx             ← Entire application (single file)
├── index.html              ← HTML shell with iOS PWA meta tags
├── vite.config.js          ← Vite + PWA plugin config
├── package.json
└── README.md
```

The entire application lives in `src/App.jsx`. No component files, no routing library, no state management library — just React hooks and localStorage.

---

## Design system

SwipeLearn uses a **Rustic Autumn** palette — dark, warm, and intentional.

| Token | Hex | Usage |
|---|---|---|
| Background | `#1c1208` | App background — dark charred bark |
| Surface | `#251a0a` | Elevated surfaces |
| Card | `#3a2912` | Card background — worn leather |
| Card hover | `#43301a` | Interactive card hover state |
| Accent | `#c8761a` | Burnt amber — primary accent, progress bars, CTAs |
| Accent hover | `#e08920` | Warm ember — hover state |
| Text primary | `#f5e6cc` | Parchment cream |
| Text secondary | `#a88b6a` | Dry clay |
| Text faint | `#5c4530` | Dried leaf shadow |
| Danger | `#b83222` | Deep crimson — review/error states |
| Difficulty 1 | `#7daa52` | Sage green — Intro |
| Difficulty 2 | `#c8761a` | Burnt amber — Core |
| Difficulty 3 | `#b83222` | Crimson — Advanced |

Typography follows the system font stack with SF Pro Rounded as the preferred face on iOS — no external font dependencies, zero layout shift.

---

## Roadmap

- [ ] AI-generated card content (Claude API integration)
- [ ] Export progress as JSON
- [ ] Spaced repetition scheduling for the review queue
- [ ] Multiple library profiles
- [ ] Card search
- [ ] Streak tracking (without toxic gamification)
- [ ] Share topics as links

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "add your feature"`
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