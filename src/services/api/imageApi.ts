/**
 * Image API Service - calls Python FastAPI backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface GenerateImageParams {
  prompt: string
  style: string
  dimension: string
}

export async function generateImage(params: GenerateImageParams): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate image')
  }
  return data
}
