"""
LinkedIn Content Creator - FastAPI Backend
==========================================

This is the Python FastAPI backend that handles all AI generation,
URL fetching, and image generation. The Next.js frontend calls these
endpoints instead of using Next.js API routes.

Run with: uvicorn app.main:app --reload --port 8000
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv()

# Import routers
from app.routers import post, url, image, calendar, posts

# Initialize FastAPI app
app = FastAPI(
    title="LinkedIn Content Creator API",
    description="Backend API for AI-powered LinkedIn content generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration - allow frontend to call backend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "linkedin-content-creator-backend"}

# Include routers
app.include_router(post.router, prefix="/api", tags=["Post Generation"])
app.include_router(url.router, prefix="/api", tags=["URL to Post"])
app.include_router(image.router, prefix="/api", tags=["Image Generation"])
app.include_router(calendar.router, prefix="/api", tags=["Calendar"])
app.include_router(posts.router, prefix="/api", tags=["Posts"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )
