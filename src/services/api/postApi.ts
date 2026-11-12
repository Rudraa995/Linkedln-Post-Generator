/**
 * Post API Service - calls Python FastAPI backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface GeneratePostParams {
  topic: string
  postType: string
  tone: string
  targetAudience: string
  length: string
  language: string
  emojiPreference: string
  hashtagsEnabled: boolean
  useProfileContext: boolean
  profile?: any
}

export async function generatePost(params: GeneratePostParams): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/generate-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate post')
  }
  return data.post
}

export async function generatePostFromUrl(params: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/generate-post-from-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate post from URL')
  }
  return data.post
}

export async function analyzeUrl(url: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to analyze URL')
  }
  return data.content
}

export async function rewritePost(content: string, action: string, tone?: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/rewrite-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, action, tone }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to rewrite post')
  }
  return data.content
}

export async function regenerateSection(content: string, section: string, context: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/regenerate-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, section, context }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to regenerate section')
  }
  return data
}

export async function generateHashtags(topic: string, content: string = '', count: number = 5): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/generate-hashtags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, content, count }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate hashtags')
  }
  return data.hashtags
}
