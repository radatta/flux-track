# FluxTrack

> An AI-powered rehabilitation assistant that provides real-time exercise feedback using advanced pose detection technology.

---

## Overview

- **Purpose** - Help individuals improve their rehabilitation outcomes through real-time exercise feedback, precise form correction, and comprehensive progress tracking.
- **Target Audience** - Patients undergoing physical therapy, rehabilitation professionals, and anyone seeking to improve their exercise form and recovery progress.
- **Problem Solved** - Traditional rehabilitation exercises lack real-time feedback, making it difficult to ensure proper form and track meaningful progress. FluxTrack provides instant, AI-powered guidance to optimize recovery outcomes.

---

## Features

- 🎥 **Real-Time Pose Detection** - Advanced AI pose estimation using TensorFlow.js for instant exercise feedback.
- 📹 **Exercise Library** - Comprehensive collection of rehabilitation exercises with video instructions and proper form guidance.
- 🎯 **Form Correction** - Immediate visual and audio feedback to ensure proper exercise execution.
- 📊 **Session Analytics** - Detailed tracking of reps, hold times, accuracy scores, and session duration.
- 📈 **Progress Tracking** - Monitor improvement over time with comprehensive analytics and progress reports.
- ⚡ **Instant Feedback** - Real-time accuracy scoring and confidence measurements during exercises.
- 🔐 **Authentication & Authorization** - Secure user accounts with Supabase Auth (email/password + Google One Tap).
- 💻 **Responsive UI** - Tailwind CSS + shadcn/ui components optimized for both desktop and mobile use.
- ⚡ **Built for Performance** - Optimized with Bun for fast development and deployment.

---

## Tech Stack

| Layer     | Tech                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| Language  | TypeScript 5, SQL                                                                  |
| Front-End | React 18, Next.js 14 (App Router, Server Actions)                                  |
| Styling   | Tailwind CSS, shadcn/ui, Lucide Icons                                              |
| Data      | Supabase (PostgreSQL, Auth, Storage)                                               |
| AI/ML     | TensorFlow.js Pose Detection (MoveNet), OpenAI GPT-4o (optional)                   |
| Tooling   | Bun, Supabase CLI, ESLint & Prettier, Husky, Supazod (type-safe schema generation) |

**Architecture Notes**

- Fully serverless - front-end and API routes run on Vercel edge/functions.
- Strongly typed database models via Supazod & Zod.
- Real-time pose detection runs entirely in the browser for privacy and performance.

---

## How It Works

1. **User Authenticates** ➜ Supabase returns a JWT stored in a secure cookie.
2. **Exercise Selection** ➜ User chooses from the exercise library with detailed instructions.
3. **Real-Time Feedback** ➜ Camera feed analyzed frame-by-frame with pose keypoints extracted.
4. **Form Analysis** ➜ Pose data compared against exercise configuration for accuracy scoring.
5. **Session Tracking** ➜ Reps, hold times, and accuracy metrics stored in database.
6. **Progress Analytics** ➜ Historical data aggregated for progress visualization and insights.

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
OPENAI_API_KEY=sk-... # optional, for future AI features
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

### Start an Exercise Session

```bash
# Navigate to the exercise library
curl -X GET http://localhost:3000/api/rehab/exercise

# Start a specific exercise session
curl -X POST http://localhost:3000/api/rehab/session \
  -H "Content-Type: application/json" \
  -d '{"exercise_id":"head-tilt-right"}'
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
│  │   ├─ api/rehab/   # REST endpoints for exercises, sessions, progress
│  │   ├─ rehab/       # Exercise canvas, progress pages, settings
│  │   └─ auth/        # Authentication pages
│  ├─ components/      # Reusable UI components
│  │   ├─ rehab/       # Pose estimation, exercise library, progress widgets
│  │   └─ ui/          # shadcn/ui components
│  ├─ lib/             # Server-side helpers (Supabase client, utilities)
│  ├─ hooks/           # Custom React hooks
│  ├─ utils/           # Draw helpers, exercise configs, pose utilities
│  └─ middleware.ts    # Supabase auth middleware
├─ supabase/           # SQL migrations for rehabilitation tables
├─ tailwind.config.ts  # Design tokens and styling configuration
└─ bun.lockb           # Bun lockfile
```

---

## Exercise Configuration

Exercises are configured in `src/utils/exerciseConfig.ts` with the following structure:

```typescript
export const exerciseConfig = {
  "head-tilt-right": {
    name: "Head Tilt Right",
    instructions: "Gently tilt your head to the right...",
    keypoints: ["nose", "left_ear", "right_ear"],
    targetAngle: 15,
    holdTime: 3,
    reps: 10,
  },
  // ... more exercises
};
```

---

## Challenges & Learnings

- Optimizing **pose detection performance** for real-time feedback without compromising accuracy.
- Designing **exercise configurations** that work across different body types and camera angles.
- Implementing **smooth pose tracking** with noise reduction and confidence thresholds.
- Balancing **battery usage** with detection frequency on mobile devices.
- Creating **intuitive visual feedback** that guides users without overwhelming them.

---

## Future Improvements

- 🔔 **Push Notifications & PWA**: Exercise reminders and offline mode support.
- 🤖 **AI Exercise Recommendations**: Personalized exercise suggestions based on progress.
- 📊 **Advanced Analytics**: Injury risk assessment and recovery predictions.
- 🎥 **Video Recording**: Session playback and form analysis.
- 🧪 **Comprehensive Test Suite**: Coverage with Vitest and Playwright.
- 🌐 **Internationalization**: Multi-language support for global accessibility.
- 👥 **Therapist Dashboard**: Professional tools for monitoring patient progress.

---

## Credits

- **shadcn/ui** & **Radix UI** for component patterns and accessibility.
- **Supabase** for backend infrastructure and real-time capabilities.
- **TensorFlow.js** and **Google MoveNet** for pose detection technology.
- **Vercel** for seamless deployment and edge computing.

> Built with ❤️, precision, and a commitment to better rehabilitation outcomes.
