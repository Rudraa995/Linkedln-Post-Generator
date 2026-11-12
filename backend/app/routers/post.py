"""Post generation router."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import GeneratePostRequest, GeneratePostFromUrlRequest, RewritePostRequest, RegenerateSectionRequest, GenerateHashtagsRequest
from app.services.ai_service import generate_linkedin_post, generate_post_from_url, improve_post, regenerate_section, generate_hashtags, generate_image_prompt

router = APIRouter()


@router.post("/generate-post")
async def generate_post(request: GeneratePostRequest):
    try:
        result = generate_linkedin_post(request.dict())
        return {"success": True, "post": result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate post: {str(e)}")


@router.post("/generate-post-from-url")
async def generate_post_from_url(request: GeneratePostFromUrlRequest):
    try:
        result = generate_post_from_url(request.dict())
        return {"success": True, "post": result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate post from URL: {str(e)}")


@router.post("/rewrite-post")
async def rewrite_post(request: RewritePostRequest):
    try:
        rewritten = improve_post(request.content, request.action, request.tone)
        return {"success": True, "content": rewritten}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rewrite post: {str(e)}")


@router.post("/regenerate-section")
async def regenerate_section_endpoint(request: RegenerateSectionRequest):
    try:
        result = regenerate_section(request.content, request.section, request.context)
        response = {"success": True}
        response[request.section] = result
        return response
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate section: {str(e)}")


@router.post("/generate-hashtags")
async def generate_hashtags_endpoint(request: GenerateHashtagsRequest):
    try:
        hashtags = generate_hashtags(request.topic, request.content, request.count)
        return {"success": True, "hashtags": hashtags}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate hashtags: {str(e)}")
