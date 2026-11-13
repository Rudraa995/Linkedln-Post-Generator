# AI-Powered LinkedIn Content Creator

Full-stack app for generating professional LinkedIn posts with AI. Next.js 16 frontend + Python FastAPI backend, using OpenRouter for text and image generation.

## Tech Stack
- Frontend: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 3)
- Backend: Python FastAPI (OpenRouter AI, URL fetching, image generation)
- Storage: localStorage (temporary)
- UI: shadcn-style components + React Bits animations

## Project Structure
```
linkedin-content-creator/
├── src/                    # Next.js frontend
│   ├── app/                # Pages and API routes
│   ├── components/         # UI and layout components
│   ├── services/           # API clients and AI helpers
│   └── lib/                # Utilities and storage
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── routers/        # API route handlers
│   │   └── services/       # AI, URL, image services
│   └── requirements.txt
├── public/
├── package.json
└── .env.example
```

## Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
cp .env.example .env
# Edit .env and add OPENROUTER_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend: http://localhost:8000  |  Docs: http://localhost:8000/docs

### 2. Frontend (Next.js)
```bash
# In project root
cp .env.example .env
# Ensure NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```
Frontend: http://localhost:3000

## Environment Variables

### Frontend (`.env`)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
IMAGE_GENERATION_API_KEY=your_image_api_key_here
FRONTEND_URL=http://localhost:3000
```

## Features
1. AI profile-based post generation
2. URL-to-post generator (GitHub/blog/article)
3. AI image generation
4. Content calendar
5. Advanced post editor
6. Post history
7. Settings and profile management

## Notes
- Storage is localStorage; data is browser-local.
- Next.js 16 requires dynamic route `params` to be awaited (Promise).
- Images remote patterns allow all https hosts.
- Run frontend and backend separately (no Docker).
