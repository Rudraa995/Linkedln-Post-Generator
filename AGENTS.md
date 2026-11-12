# AGENTS.md

## Project
AI-Powered LinkedIn Content Creator. Next.js 16 (App Router, React 19, Tailwind 3) frontend + Python FastAPI backend. AI via OpenRouter. Storage is localStorage (temporary).

## Commands
Frontend:
- `npm install`
- `npm run dev` (port 3000, Turbopack)
- `npm run build`
- `npm run lint`

Backend:
- `cd backend && pip install -r requirements.txt`
- `cd backend && uvicorn app.main:app --reload --port 8000`
- Docs: http://localhost:8000/docs

## Environment
- Root `.env` from `.env.example`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` (frontend calls FastAPI)
- `backend/.env` from `backend/.env.example`: `OPENROUTER_API_KEY` required; `FRONTEND_URL=http://localhost:3000`

## Architecture
- `src/app/*` pages; `src/app/api/*` Next.js API routes (alternate path, uses `src/services/ai/openrouter.ts`)
- `src/services/api/*` client calls FastAPI backend
- `backend/app/main.py` FastAPI entry; routers in `backend/app/routers/`
- Path alias `@/*` -> `src/*`

## Quirks
- Next.js 16: dynamic route `params` is a `Promise`; await it (see `src/app/api/posts/[id]/route.ts`).
- Tailwind 3 with `tailwind.config.js`; global styles in `src/app/globals.css` (imports Google Fonts CDN).
- UI uses shadcn-style components in `src/components/ui` plus React Bits in `src/components/*`.
- `next.config.js` allows all https remote image hosts.
- MainLayout wraps children in `max-w-7xl`; sidebar is `w-64`.
- Storage is client-side localStorage; do not assume a DB.
- Docker removed; run services manually.
