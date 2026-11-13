"""
Image Generation Service - Python equivalent of provider.ts
"""

import os
import httpx

IMAGE_API_KEY = os.getenv("IMAGE_GENERATION_API_KEY")
IMAGE_PROVIDER = os.getenv("IMAGE_GENERATION_PROVIDER", "openrouter")
IMAGE_MODEL = os.getenv("IMAGE_GENERATION_MODEL", "black-forest-labs/flux-1-schnell")
IMAGE_BASE_URL = os.getenv("IMAGE_GENERATION_BASE_URL", "https://openrouter.ai/api/v1")
NEXT_PUBLIC_APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

STYLE_PROMPTS = {
    "professional-banner": "A professional LinkedIn banner image, clean corporate design, subtle gradient background, modern typography space, business aesthetic, high quality, 3d render, soft lighting",
    "technology-illustration": "A technology illustration, circuit board elements, digital network nodes, futuristic UI, neon accents, isometric view, vibrant colors, high detail",
    "minimalist-design": "A minimalist design, clean white background, simple geometric shapes, ample negative space, elegant typography, monochromatic color scheme, modern",
    "business-graphic": "A business graphic, professional charts and data visualization, clean infographic style, corporate blue and gray palette, vector art, crisp edges",
    "educational-infographic": "An educational infographic, clear diagrams, step-by-step visual flow, friendly illustrations, accessible color palette, easy to read, poster design",
    "creative-illustration": "A creative illustration, artistic and imaginative, bold colors, unique composition, hand-drawn elements mixed with digital, expressive style",
}

DIMENSION_SIZES = {
    "landscape": {"width": 1200, "height": 627},
    "square": {"width": 1080, "height": 1080},
    "portrait": {"width": 1080, "height": 1350},
}


def build_image_prompt(prompt: str, style: str, dimension: str) -> str:
    style_prompt = STYLE_PROMPTS.get(style, "")
    size = DIMENSION_SIZES.get(dimension, DIMENSION_SIZES["landscape"])
    return f"{prompt}. {style_prompt}. Aspect ratio {size['width']}:{size['height']}, high resolution, professional quality, suitable for LinkedIn social media post."


def _is_configured() -> bool:
    key = IMAGE_API_KEY
    if not key:
        return False
    if key.strip().lower().startswith("your_") or "your_image_api_key" in key.lower():
        return False
    return True

def is_configured() -> bool:
    return _is_configured()


async def generate_image(prompt: str, style: str, dimension: str) -> dict:
    if not _is_configured():
        size = DIMENSION_SIZES.get(dimension, DIMENSION_SIZES["landscape"])
        w, h = size["width"], size["height"]
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-size="24" font-family="sans-serif">Generated Image</text></svg>'
        import base64
        placeholder = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()
        return {
            "imageUrl": placeholder,
            "prompt": build_image_prompt(prompt, style, dimension),
            "provider": "demo",
            "model": "placeholder",
        }
    if not IMAGE_API_KEY:
        raise ValueError("Image generation API key is not configured. Set IMAGE_GENERATION_API_KEY in your .env file to enable image generation.")

    full_prompt = build_image_prompt(prompt, style, dimension)
    size = DIMENSION_SIZES.get(dimension, DIMENSION_SIZES["landscape"])

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{IMAGE_BASE_URL}/images/generations",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {IMAGE_API_KEY}",
                "HTTP-Referer": NEXT_PUBLIC_APP_URL,
                "X-Title": "LinkedIn Content Creator",
            },
            json={
                "model": IMAGE_MODEL,
                "prompt": full_prompt,
                "width": size["width"],
                "height": size["height"],
            },
        )

    if response.status_code != 200:
        error_text = response.text
        raise ValueError(f"Image generation failed (HTTP {response.status_code}): {error_text or response.reason_phrase}")

    data = response.json()
    image_url = None
    if "data" in data and len(data["data"]) > 0:
        image_url = data["data"][0].get("url") or data["data"][0].get("b64_json")
    if not image_url:
        image_url = data.get("url")

    if not image_url:
        raise ValueError("Image generation returned no image URL.")

    if not image_url.startswith("http") and "b64_json" in (data.get("data", [{}])[0] or {}):
        image_url = f"data:image/png;base64,{data['data'][0]['b64_json']}"

    return {
        "imageUrl": image_url,
        "prompt": full_prompt,
        "provider": IMAGE_PROVIDER,
        "model": IMAGE_MODEL,
    }
