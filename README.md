# AI-Powered LinkedIn Content Creator

A full-stack application for generating professional LinkedIn posts using AI.

## Architecture

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Python FastAPI (OpenRouter AI, URL fetching, Image generation)
- **Storage**: localStorage (temporary, will be replaced with Supabase PostgreSQL)

## Project Structure

```
linkedin-content-creator/
├── frontend/          # Next.js frontend (root-level src/, components, etc.)
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── main.py    # FastAPI app entry point
│   │   ├── models/    # Pydantic schemas
│   │   ├── routers/   # API route handlers
│   │   └── services/  # AI, URL, Image services
│   ├── requirements.txt
│   └── .env.example
├── .env               # Frontend environment variables
├── .env.example
└── package.json
```

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Frontend (Next.js)

```bash
# In project root
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (backend/.env)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
IMAGE_GENERATION_API_KEY=your_image_api_key_here
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/generate-post | Generate LinkedIn post |
| POST | /api/generate-post-from-url | Generate post from URL content |
| POST | /api/analyze-url | Analyze and extract URL content |
| POST | /api/rewrite-post | Rewrite/improve post |
| POST | /api/regenerate-section | Regenerate post section |
| POST | /api/generate-hashtags | Generate hashtags |
| POST | /api/generate-image | Generate image |
| GET/POST/DELETE | /api/calendar-events | Calendar CRUD |
| GET/PUT/DELETE | /api/posts/{id} | Post CRUD |

## Features

1. **AI Profile-Based Post Generation** - Personalized posts using user profile
2. **URL-to-Post Generator** - Convert GitHub/blog/article URLs to LinkedIn posts
3. **AI Image Generation** - Generate images for posts
4. **Content Calendar** - Plan and schedule posts
5. **Advanced Post Editor** - Edit, rewrite, regenerate sections
6. **Post History** - Search, filter, manage saved posts
7. **Settings** - Default preferences

## Future Plans

- Supabase PostgreSQL integration (replace localStorage)
- Supabase Auth (user authentication)
- LinkedIn publishing integration
- Advanced analytics
