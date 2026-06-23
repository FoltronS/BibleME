# BibleMe

A Christian daily devotional web app with an AI companion named Bibly. Built for Indonesian Christians, with English and Mandarin support.

## Features

- Daily verse selection tailored to the user's personal struggle
- AI-generated devotional story, reflection, and personal letter
- Bibly chat — a streaming spiritual companion
- Text-to-speech reading in all three languages
- Voice input (speech-to-text) for chat
- Fully offline-capable after load (localStorage caching)
- Responsive layout — works on mobile and desktop
- No login, no database — all data stored locally

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| i18n | next-intl (ID / EN / ZH) |
| AI | OpenAI-compatible API (swappable via env vars) |
| Bible API | api.bible (EN, ZH) + mayicu.id Alkitab (ID) |
| TTS / ASR | Web Speech API (browser-native) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
AI_BASE_URL=https://your-provider.com/v1
AI_API_KEY=your-api-key
AI_MODEL=your-model-name
BIBLE_API_KEY=your-api-bible-key
```

To get a Bible API key, register at [api.bible](https://api.bible).

To swap AI providers, change the three `AI_` variables — no code changes required.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── verse/route.ts        # Verse selection + Bible fetch + relevance check
│   │   ├── devotional/route.ts   # Devotional + letter generation
│   │   └── chat/route.ts         # Bibly chat (streaming)
│   └── [locale]/
│       ├── page.tsx              # Home: daily devotional (verse / reflection / letter tabs)
│       ├── chat/page.tsx         # Bibly chat
│       └── onboarding/page.tsx   # First-visit setup
├── components/
│   ├── devotional/               # VerseCard, ReflectionCard, MotivationCard, TtsButton
│   ├── layout/                   # AppHeader, BottomNav, Sidebar
│   └── settings/                 # SettingsPanel
├── hooks/                        # useDevotional, useChat, useTTS, useASR
├── lib/                          # ai-client, bible-api, bible-ids, prompts, tts, asr, storage, types
├── context/                      # UserContext (nickname, struggle, locale, ttsSpeed)
└── messages/                     # id.json, en.json, zh.json
```