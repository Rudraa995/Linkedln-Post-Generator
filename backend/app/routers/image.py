"""Image generation router."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateImageRequest
from app.services.image_service import generate_image, is_configured

router = APIRouter()


@router.post("/generate-image")
async def generate_image_endpoint(request: GenerateImageRequest):
    try:
        result = await generate_image(request.prompt, request.style, request.dimension)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")
