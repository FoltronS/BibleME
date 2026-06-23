# BibleMe 🕊️

BibleMe is a personal Christian daily devotional app powered by AI. Every day, it chooses a Bible verse relevant to what you are going through, then generates a devotional story, a personal reflection, and a warm letter — all written by Bibly, your AI spiritual companion.

Built primarily for Indonesian Christians, with full support for English and Mandarin.

---

## How It Works (for users)

1. **First visit** — Enter your nickname and optionally share what you are struggling with right now (e.g. "feeling lost", "family conflict", "loneliness"). This is private and stays on your device.

2. **Daily devotional** — Every day, Bibly selects a Bible verse that speaks directly to your situation. You get three things:
   - **Firman / Verse** — The verse of the day in your language (Indonesian Terjemahan Baru, English NKJV, or Mandarin OCCB)
   - **Renungan / Reflection** — A short story-driven devotional built around the verse
   - **Surat / Letter** — A warm personal letter from Bibly addressed to you

3. **Chat with Bibly** — Open the chat tab to talk to Bibly about anything on your heart. Bibly responds with empathy, grounded in scripture, in whatever language you write in.

4. **Listen** — Tap the speaker icon on any card to have it read aloud. Works in all three languages.

5. **Speak** — In chat, tap the microphone to speak instead of type. Your words appear in real time.

6. **Settings** — Change your name, update your current struggle, switch language, or adjust reading speed anytime from the settings panel.

Your data (name, struggle, language preference, and cached devotionals) is stored only on your own device. No account required, no data sent to any server except the AI and Bible API calls.

---

## Features

- Daily verse tailored to your personal struggle, verified for relevance by AI
- Story-driven devotional — real historical figures, Bible characters, or meaningful parables
- Personal letter from Bibly signed as a caring spiritual friend
- Streaming AI chat companion (Bibly)
- Text-to-speech in Indonesian (Gadis), English (Zira), and Mandarin (Yaoyao)
- Voice input for chat with live transcript as you speak
- Daily content cached locally — no repeated API calls on refresh
- Same verse preserved when switching languages
- Responsive — works on mobile and desktop
- No login, no database, all data stays on your device

---

## For Developers

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| i18n | next-intl (ID / EN / ZH) |
| AI | OpenAI-compatible API (swappable via env vars) |
| Bible API | api.bible (EN, ZH) + mayicu.id Alkitab (ID) |
| TTS / ASR | Web Speech API (browser-native) |

### Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**3. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_BASE_URL` | Base URL of your OpenAI-compatible API (e.g. `https://api.openai.com/v1`) |
| `AI_API_KEY` | Your API key |
| `AI_MODEL` | Model name (e.g. `gpt-4o`, `claude-3-5-sonnet`) |
| `BIBLE_API_KEY` | API key from [api.bible](https://api.bible) — free to register |

To swap AI providers, only change the three `AI_` variables. No code changes required.

### Project Structure

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
