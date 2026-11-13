/**
 * Image generation service — server-side only.
 *
 * Configurable provider via environment variables. API credentials stay
 * server-side and are never exposed to the browser.
 *
 * If IMAGE_GENERATION_API_KEY is not configured, the service throws a
 * clear configuration error so the rest of the app stays functional.
 */

const IMAGE_API_KEY = process.env.IMAGE_GENERATION_API_KEY
const IMAGE_PROVIDER =
 process.env.IMAGE_GENERATION_PROVIDER || 'openrouter'
const IMAGE_MODEL =
 process.env.IMAGE_GENERATION_MODEL || 'black-forest-labs/flux-1-schnell'
const IMAGE_BASE_URL =
 process.env.IMAGE_GENERATION_BASE_URL || 'https://openrouter.ai/api/v1'

if (!IMAGE_API_KEY && IMAGE_PROVIDER === 'openrouter') {
 console.warn(
 '[image] IMAGE_GENERATION_API_KEY is not set. Image generation will be disabled until configured.',
 )
}

export type ImageStyle =
 | 'professional-banner'
 | 'technology-illustration'
 | 'minimalist-design'
 | 'business-graphic'
 | 'educational-infographic'
 | 'creative-illustration'

export type ImageDimension =
 | 'landscape' // 1200 × 627
 | 'square' // 1080 × 1080
 | 'portrait' // 1080 × 1350

export interface ImageGenerationInput {
 prompt: string
 style: ImageStyle
 dimension: ImageDimension
}

export interface ImageGenerationResult {
 imageUrl: string
 prompt: string
 provider: string
 model: string
}

const STYLE_PROMPTS: Record<ImageStyle, string> = {
 'professional-banner':
 'A professional LinkedIn banner image, clean corporate design, subtle gradient background, modern typography space, business aesthetic, high quality, 3d render, soft lighting',
 'technology-illustration':
 'A technology illustration, circuit board elements, digital network nodes, futuristic UI, neon accents, isometric view, vibrant colors, high detail',
 'minimalist-design':
 'A minimalist design, clean white background, simple geometric shapes, ample negative space, elegant typography, monochromatic color scheme, modern',
 'business-graphic':
 'A business graphic, professional charts and data visualization, clean infographic style, corporate blue and gray palette, vector art, crisp edges',
 'educational-infographic':
 'An educational infographic, clear diagrams, step-by-step visual flow, friendly illustrations, accessible color palette, easy to read, poster design',
 'creative-illustration':
 'A creative illustration, artistic and imaginative, bold colors, unique composition, hand-drawn elements mixed with digital, expressive style',
}

const DIMENSION_SIZES: Record<ImageDimension, { width: number; height: number }> = {
 landscape: { width: 1200, height: 627 },
 square: { width: 1080, height: 1080 },
 portrait: { width: 1080, height: 1350 },
}

/**
 * Builds a full image-generation prompt from the user prompt, style, and dimension.
 */
function buildImagePrompt(input: ImageGenerationInput): string {
 const stylePrompt = STYLE_PROMPTS[input.style]
 const size = DIMENSION_SIZES[input.dimension]
 return `${input.prompt}. ${stylePrompt}. Aspect ratio ${size.width}:${size.height}, high resolution, professional quality, suitable for LinkedIn social media post.`
}

/**
 * Generates an image using the configured provider.
 * Currently supports OpenRouter (image models) as the default.
 */
export async function generateImage(
 input: ImageGenerationInput,
): Promise<ImageGenerationResult> {
 if (!IMAGE_API_KEY) {
 throw new Error(
 'Image generation API key is not configured. Set IMAGE_GENERATION_API_KEY in your .env file to enable image generation.',
 )
 }

 const fullPrompt = buildImagePrompt(input)
 const size = DIMENSION_SIZES[input.dimension]

 // OpenRouter image generation endpoint
 const response = await fetch(`${IMAGE_BASE_URL}/images/generations`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${IMAGE_API_KEY}`,
 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
 'X-Title': 'LinkedIn Content Creator',
 },
 body: JSON.stringify({
 model: IMAGE_MODEL,
 prompt: fullPrompt,
 width: size.width,
 height: size.height,
 }),
 })

 if (!response.ok) {
 const errorText = await response.text().catch(() => '')
 throw new Error(
 `Image generation failed (HTTP ${response.status}): ${errorText || response.statusText}`,
 )
 }

 const data = await response.json()

 const imageUrl =
 data.data?.[0]?.url ||
 data.data?.[0]?.b64_json ||
 data.url

 if (!imageUrl) {
 throw new Error('Image generation returned no image URL.')
 }

 // If base64, convert to data URL
 let finalUrl = imageUrl
 if (data.data?.[0]?.b64_json && !imageUrl.startsWith('http')) {
 finalUrl = `data:image/png;base64,${data.data[0].b64_json}`
 }

 return {
 imageUrl: finalUrl,
 prompt: fullPrompt,
 provider: IMAGE_PROVIDER,
 model: IMAGE_MODEL,
 }
}

/**
 * Checks whether image generation is configured and available.
 */
export function isImageGenerationConfigured(): boolean {
 return !!IMAGE_API_KEY
}
