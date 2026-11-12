# AGENTS.md

## Project overview
AI-Powered LinkedIn Content Creator. Full-stack app: Next.js 14 frontend + Python FastAPI backend, using OpenRouter for AI text/image generation.

## Repository layout
- `src/` — Next.js App Router (TypeScript, Tailwind). Pages and components.
- `src/app/api/*` — Next.js API routes (server-side, uses `src/services/ai/openrouter.ts`).
- `src/services/api/*` — Client services that call the FastAPI backend (`NEXT_PUBLIC_API_BASE_URL`).
- `backend/` — FastAPI app (`app/main.py`). Routers in `app/routers/`, services in `app/services/`.

## Commands
### Frontend
- Install: `npm install`
- Dev: `npm run dev` (port 3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Start (prod): `npm start`

### Backend
- Install: `cd backend && pip install -r requirements.txt`
- Run: `cd backend && uvicorn app.main:app --reload --port 8000`
- API docs: http://localhost:8000/docs

## Environment
- Root `.env` (from `.env.example`): `OPENROUTER_API_KEY`, `NEXT_PUBLIC_*`.
- `backend/.env` (from `backend/.env.example`): `OPENROUTER_API_KEY`, `IMAGE_GENERATION_API_KEY`, `FRONTEND_URL`.
- Never commit `.env` files.

## Conventions
- TypeScript strict mode; path alias `@/*` → `src/*`.
- Frontend calls FastAPI backend for most features; Next.js API routes are an alternate server-side path.
- Storage is localStorage (temporary).
- Images remote patterns allowed for all https hosts in `next.config.js`.

## Notes
- `.next/`, `node_modules/`, `__pycache__/`, `.env` are gitignored.
- Nested `Linkedln-Post-Generator/` is a separate (legacy) repo and is gitignored.