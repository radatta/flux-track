# FluxTrack

> An AI-powered wellness tracker that combines mood & energy journaling with real-time rehab exercise feedback.

---

## Overview

- **Purpose** - Help individuals understand and improve their mental and physical well-being through quick daily logs, insightful analytics, and guided rehabilitation sessions.
- **Target Audience** - Anyone who wants an intuitive, privacy-first tool to track how they feel, spot trends, and stay accountable with physiotherapy routines.
- **Problem Solved** - Traditional journals collect data but seldom generate actionable insight. FluxTrack turns raw entries into concise summaries, sentiment scores, personalized prompts, and exercise feedback – all in one place.

---

## Features

- 📝 **Instant Mood & Energy Logging** - One-tap sliders for mood (-5 ➜ +5) and energy (-5 ➜ +5) with optional notes.
- 🤖 **AI Insights**
  - 🔬 Sentiment analysis & emotion detection.
  - ✏️ Auto-generated five-word summaries and keyword tags.
  - 🧮 Embeddings stored via pgvector for semantic search and RAG workflows.
- 📈 **Trend Visualisation** - Weekly averages, monthly charts, and streak counters built with Recharts.
- 🔍 **Semantic Search** - Find similar past entries using cosine similarity on OpenAI embeddings.
- 💬 **Conversational Assistant** - Chat with an LLM that can reference your historical data (stored in `conversations` table).
- 🏋️ **Rehab Module**
  - 📹 Exercise library with video or image instructions.
  - 🤸 Real-time pose estimation in the browser using TensorFlow.js.
  - ✅ Immediate accuracy feedback, rep counting, hold-time measurement, and session analytics.
- 🔐 **Authentication & Authorisation** - Supabase Auth (email/password + Google One Tap).
- 💻 **Responsive UI** - Tailwind CSS + shadcn/ui (Radix primitives) for dark-mode-friendly components.
- ⚡ **Built for Bun** - Super-fast dev server and installs.

---

## Tech Stack

| Layer     | Tech                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| Language  | TypeScript 5, SQL                                                                      |
| Front-End | React 18, Next.js 14 (App Router, Server Actions)                                      |
| Styling   | Tailwind CSS, shadcn/ui, Lucide Icons                                                  |
| Data      | Supabase (PostgreSQL, pgvector, Storage, Auth)                                         |
| AI        | OpenAI GPT-4o, Vercel AI SDK,`@ai-sdk/openai`                                          |
| ML / Pose | TensorFlow.js Pose Detection (MoveNet)                                                 |
| Tooling   | Bun, Supabase CLI, ESLint & Prettier, Husky, Supazod (type-safe Zod schema generation) |

**Architecture Notes**

- Fully serverless - front-end and API routes run on Vercel edge/functions.
- Strongly typed DB models via Supazod & Zod.
- Vector search on `logs.embedding` with `ivfflat` index for sub-second semantic queries.

---

## How It Works

1. **User Authenticates** ➜ Supabase returns a JWT stored in a secure cookie.
2. **Log Entry** ➜ `/api/log` (POST) stores mood, energy, and notes.
3. **Background Insight** ➜ `/api/ai/insights` enriches the row with a summary, sentiment, tags, and an embedding.
4. **Dashboard** ➜ `/api/log` (GET) aggregates data for charts and averages.
5. **Chat** ➜ Messages stream to OpenAI; on completion the conversation is persisted.
6. **Rehab Session**
   - Live webcam feed analysed frame-by-frame.
   - Keypoints compared against exercise config.
   - Feedback rendered; session stats pushed to `exercise_sessions`.

---

## Setup & Installation

### Prerequisites

- **Bun ≥ 1.1**
- **Supabase CLI** for local development
- **Git**

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key # needed for local migrations
OPENAI_API_KEY=sk-...
```

### Steps

```bash
# 1. Clone
git clone https://github.com/radatta/flux-track.git && cd flux-track

# 2. Install dependencies
bun install

# 3. Start Supabase locally (database + auth + storage)
supabase start

# 4. Run migrations & generate typed schemas
bunx supazod gen

# 5. Development server
bun run dev
```

The site is now available at [http://localhost:3000](http://localhost:3000).

---

## Usage Examples

### Add a Log via cURL

```bash
curl -X POST http://localhost:3000/api/log \
  -H "Content-Type: application/json" \
  -d '{"mood":3,"energy":4,"notes":"Had a productive morning run"}'
```

### Run Lint & Type-Check

```bash
bun run lint && bun run check-types
```

### Generate DB Types after SQL change

```bash
bunx supazod gen
```

---

## Project Structure

```
flux-track/
├─ src/
│  ├─ app/             # Next.js pages & API routes (App Router)
│  │   ├─ api/         # REST endpoints – logs, AI, rehab, chat …
│  │   ├─ dashboard/   # Mood/energy dashboard UI
│  │   └─ rehab/       # Exercise canvas, progress pages, settings
│  ├─ components/      # Reusable UI & domain components
│  │   └─ rehab/       # Pose estimation widgets
│  ├─ lib/             # Server-side helpers (Supabase client, db utils)
│  ├─ hooks/           # Custom React hooks
│  ├─ utils/           # Draw helpers, exercise configs, etc.
│  └─ middleware.ts    # Supabase auth middleware
├─ supabase/           # SQL migrations & seed scripts
├─ tailwind.config.ts  # Design tokens
└─ bun.lockb           # Bun lockfile
```

---

## Challenges & Learnings

- Integrating **pgvector** with Supabase and keeping embedding dimensions in sync.
- Designing **Zod schemas** so OpenAI responses can be parsed deterministically.
- Balancing **pose-detection performance** against battery usage on mobile devices.
- Adopting **Bun** with Next.js, which required patching some Node-only packages.
- Using **Server Actions** & Edge Functions to keep latency low.

---

## Future Improvements

- 🔔 **Push Notifications & PWA**: reminders and offline mode.
- 🤝 **Personalized Recommendations**: activity suggestions based on combined mood and rehab data.
- 📊 **Advanced Analytics**: clustering, anomaly detection, and seasonal decomposition.
- 🎥 **Onboarding Videos**: in-app tutorial walkthroughs.
- 🧪 **Comprehensive Test Suite**: coverage with Vitest and Playwright.
- 🌐 **Internationalization & Accessibility**: i18n support and full ARIA audit.

---

## Credits

- **shadcn/ui** & **Radix UI** for component patterns.
- **Supabase docs** for vector search examples.
- **OpenAI cookbook** and **Vercel AI SDK** for streaming chat patterns.
- **Google MoveNet** research for fast pose detection.

> Built with ❤️, caffeine, and a passion for mindful living.
