/**
 * Post API Service - calls Python FastAPI backend
 */
import type { UserProfile, LinkedInPost, AnalyzeUrlResponse } from '@/types'

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
  profile?: UserProfile
}

export async function generatePost(params: GeneratePostParams): Promise<LinkedInPost> {
  const res = await fetch(`${API_BASE_URL}/api/generate-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate post')
  }
  return data.post as LinkedInPost
}

export interface GeneratedPostFromUrl {
  hook: string
  mainContent: string
  conclusion: string
  hashtags: string[]
  cta: string
  fullContent: string
}

export async function generatePostFromUrl(params: Record<string, unknown>): Promise<GeneratedPostFromUrl> {
  const res = await fetch(`${API_BASE_URL}/api/generate-post-from-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to generate post from URL')
  }
  return data.post as GeneratedPostFromUrl
}

export async function analyzeUrl(url: string): Promise<AnalyzeUrlResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to analyze URL')
  }
  return data.content as AnalyzeUrlResponse
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

export interface RegenerateSectionResponse {
  success: boolean
  error?: string
  hook?: string
  main?: string
  conclusion?: string
  hashtags?: string | string[]
  cta?: string
  [key: string]: unknown
}

export async function regenerateSection(
  content: string,
  section: string,
  context: { topic: string; tone: string; length: string; language: string },
): Promise<RegenerateSectionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/regenerate-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, section, context }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Failed to regenerate section')
  }
  return data as RegenerateSectionResponse
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
