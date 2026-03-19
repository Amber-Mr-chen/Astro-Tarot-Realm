# AstraTarot 🔮

> Free AI Tarot Reading & Astrology — [astrotarot.com](https://astrotarot.com)

AI-powered tarot card readings and daily horoscopes for the modern mystic.

## Features (Phase 1 MVP)

- 🃏 **Daily Tarot** — Draw a card and get a personalized AI reading
- ✨ **Yes or No Tarot** — Ask any question, get an instant answer
- ♈ **Daily Horoscope** — Love, career & money forecast for all 12 signs

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** Gemini 2.0 Flash (free tier) → DeepSeek V3 (growth)
- **Deploy:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in your API key
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required variables.

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Amber-Mr-chen/AstraTarot)

## Roadmap

- [ ] Phase 2: Birth chart, zodiac compatibility, Stripe subscription
- [ ] Phase 3: AI follow-up chat, daily email digest
