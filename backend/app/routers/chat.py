"""Chat router for AI assistant."""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.ai_service import chat_with_ai

router = APIRouter()


@router.post("/chat")
async def chat(request: Dict[str, Any]):
    try:
        messages = request.get("messages", [])
        if not isinstance(messages, list):
            messages = []
        context = request.get("context")
        reply = chat_with_ai(messages, context)
        return {"success": True, "reply": reply}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
