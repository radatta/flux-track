# FluxTrack

## App Concept: Mood & Energy Journal (Working Title)

You’re building a personal Mood & Energy Journal web app designed for individual daily use. The app lets users quickly log their mood and energy levels, add notes, and visualize trends over time. It stands out by leveraging advanced AI to provide smart insights, personalized prompts, sentiment analysis, and actionable recommendations—making it more than just a basic tracker.

### Key Features

- **Quick Mood/Energy Logging:** Simple, fast input for daily states.
- **Notes & Tags:** Optional free-text notes and auto-tagging via AI.
- **Trends & Visualization:** Charts and stats to show patterns over time.
- **AI-Powered Insights:**
  - Sentiment/emotion analysis of entries
  - Summarization and keyword extraction
  - Personalized journal prompts
  - Pattern detection and weekly insights
  - Smart activity and micro-goal suggestions
- **Semantic Search:** Find relevant past entries using AI embeddings.

---

## Development Stack & Approach

- **Framework:** Next.js 14 (App Router, Server Actions, Turbopack for speed)
- **Styling:** Tailwind CSS for rapid, responsive UI
- **UI Components:** shadcn/ui for modern, accessible design
- **State/Storage:** Supabase
- **Deployment:** Vercel for seamless hosting and previews
- **AI Integration:**

  - OpenAI for LLM tasks (prompt chaining, summarization, sentiment, recommendations)
  - Embeddings and vector search (Supabase Vector) for semantic search and clustering
  - Retrieval-augmented generation (RAG) for context-aware AI responses
  - Multi-step LLM workflows for deeper insights (not just single prompts)

- **Developer Tools:**

  - Cursor for AI-assisted coding
  - Prettier/ESLint for code quality
  - Vercel AI SDK for orchestrating advanced AI flows
  - Zod
  - Bun

- **Authentication:** Supabase authentication

This approach ensures you’re using the latest, most effective tools in web and AI development, while keeping the app personal, practical, and extensible for future enhancements.
