"""URL-to-Post router."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeUrlRequest
from app.services.url_service import fetch_and_extract

router = APIRouter()


@router.post("/analyze-url")
async def analyze_url(request: AnalyzeUrlRequest):
    try:
        content = await fetch_and_extract(request.url)
        return {"success": True, "content": content}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze URL: {str(e)}")
