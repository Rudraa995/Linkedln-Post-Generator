"""Posts router (in-memory for API compatibility)."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import LinkedInPost
from typing import Dict
import uuid
from datetime import datetime

router = APIRouter()

# In-memory storage (frontend primarily uses localStorage)
_posts: Dict[str, dict] = {}


@router.get("/posts/{post_id}")
async def get_post(post_id: str):
    if post_id not in _posts:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True, "post": _posts[post_id]}


@router.put("/posts/{post_id}")
async def update_post(post_id: str, update_data: dict):
    if post_id not in _posts:
        raise HTTPException(status_code=404, detail="Post not found")
    _posts[post_id].update(update_data)
    _posts[post_id]["updatedAt"] = datetime.utcnow().isoformat()
    return {"success": True, "post": _posts[post_id]}


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    if post_id not in _posts:
        raise HTTPException(status_code=404, detail="Post not found")
    del _posts[post_id]
    return {"success": True}
