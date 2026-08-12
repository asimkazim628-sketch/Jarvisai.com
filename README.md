# JARVIS AI Assistant Platform

A production-oriented full-stack starter for an Iron Man inspired JARVIS assistant. It includes a neon glassmorphism dashboard, multilingual chat, browser speech-to-text and text-to-speech, JWT authentication, MongoDB conversation memory, OpenAI-compatible AI responses, website generation planning, PDF summaries, and OCR endpoints.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and bcrypt password hashing
- **AI:** OpenAI-compatible API via configurable `OPENAI_BASE_URL`
- **Deployment:** Vercel for `apps/web`, Render for `apps/api`

## Project Structure

```text
apps/
  api/
    src/config       Environment and MongoDB configuration
    src/controllers  Auth, AI, and tool controllers
    src/middleware   JWT authorization middleware
    src/models       User and conversation schemas
    src/routes       Express route modules
    src/services     OpenAI-compatible AI service
  web/
    app              Next.js app router files
    components       Dashboard and voice UI components
    lib              API client helpers
```

## Setup

1. Install Node.js 20+ and MongoDB.
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Fill `JWT_SECRET`, `MONGODB_URI`, and `OPENAI_API_KEY` in `.env`.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start both apps:
   ```bash
   npm run dev
   ```

The web app runs on `http://localhost:3000`; the API runs on `http://localhost:4000`.

## API Guide

### Authentication

- `POST /api/auth/signup` with `name`, `email`, `password`, and optional `preferredLanguage`.
- `POST /api/auth/login` with `email` and `password`.
- Use the returned token as `Authorization: Bearer <token>` for AI and tools routes.

### AI Assistant

- `POST /api/ai/chat` stores conversation memory in MongoDB and returns a multilingual JARVIS response.
- `POST /api/ai/website` creates a professional website plan and file map from a requirement.

### AI Tools

- `POST /api/tools/summary` accepts a `file` upload for PDF or text summarization.
- `POST /api/tools/ocr` accepts an `image` upload and returns extracted text.
- `GET/POST /api/productivity/notes` stores personal notes for authenticated users.
- `GET/POST /api/productivity/reminders` stores future reminders for authenticated users.
- `GET/POST /api/memory` stores long-term user preferences and profile facts.
- `GET /api/projects` lists generated projects, and `POST /api/projects/generate` creates and saves a downloadable-style project file map.

## Voice Support

The dashboard uses browser Web Speech APIs for speech-to-text and text-to-speech. Support depends on the browser; Chrome-based browsers are recommended. It also includes local command handling for opening Google, YouTube, Facebook, Gmail, calculator, weather searches, email drafts, notes, reminders, date, and time without waiting for an AI completion. Advanced panels let users authenticate, save long-term memories, and generate full project file maps from natural-language requirements.

## Deployment

### Vercel

- Set root directory to `apps/web` or deploy from the monorepo with `npm run build:web`.
- Configure `NEXT_PUBLIC_API_URL` to point to your Render API URL.

### Render

- Build command: `npm install && npm run build:api`
- Start command: `node apps/api/dist/server.js`
- Add all server environment variables from `.env.example`.
