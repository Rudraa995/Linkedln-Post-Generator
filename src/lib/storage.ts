/**
 * localStorage data service layer.
 *
 * This module is intentionally storage-agnostic. All UI components
 * interact with these functions rather than accessing localStorage
 * directly, so Supabase PostgreSQL can replace this layer in a future
 * phase without rewriting components.
 *
 * All functions are client-side only. Do not import during SSR.
 */

import {
  UserProfile,
  LinkedInPost,
  CalendarEvent,
  AppSettings,
} from '@/types'

const STORAGE_KEYS = {
  PROFILE: 'linkedin_creator_profile',
  POSTS: 'linkedin_creator_posts',
  CALENDAR: 'linkedin_creator_calendar',
  SETTINGS: 'linkedin_creator_settings',
} as const

const isBrowser = typeof window !== 'undefined'

/**
 * Safe localStorage wrapper that handles private mode / quota errors.
 */
function safeGetItem(key: string): string | null {
  if (!isBrowser) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser) return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeRemoveItem(key: string): boolean {
  if (!isBrowser) return false
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** ---------- Profile ---------- */

export function getProfile(): UserProfile | null {
  const raw = safeGetItem(STORAGE_KEYS.PROFILE)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function updateProfile(profile: UserProfile): boolean {
  const updated = { ...profile, updatedAt: new Date().toISOString() }
  return safeSetItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
}

export function deleteProfile(): boolean {
  return safeRemoveItem(STORAGE_KEYS.PROFILE)
}

/** ---------- Posts ---------- */

export function getPosts(): LinkedInPost[] {
  const raw = safeGetItem(STORAGE_KEYS.POSTS)
  if (!raw) return []
  try {
    const posts = JSON.parse(raw) as LinkedInPost[]
    return posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch {
    return []
  }
}

export function savePost(post: LinkedInPost): boolean {
  const posts = getPosts()
  const existingIndex = posts.findIndex((p) => p.id === post.id)
  const updated = { ...post, updatedAt: new Date().toISOString() }

  if (existingIndex >= 0) {
    posts[existingIndex] = updated
  } else {
    posts.unshift(updated)
  }

  return safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
}

export function updatePost(id: string, patch: Partial<LinkedInPost>): boolean {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index < 0) return false

  posts[index] = { ...posts[index], ...patch, updatedAt: new Date().toISOString() }
  return safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
}

export function deletePost(id: string): boolean {
  const posts = getPosts().filter((p) => p.id !== id)
  return safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
}

export function duplicatePost(id: string): boolean {
  const posts = getPosts()
  const post = posts.find((p) => p.id === id)
  if (!post) return false

  const copy: LinkedInPost = {
    ...post,
    id: crypto.randomUUID?.() ?? `post_${Date.now()}`,
    topic: `${post.topic} (Copy)`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: undefined,
  }

  posts.unshift(copy)
  return safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(posts))
}

/** ---------- Calendar ---------- */

export function getCalendarEvents(): CalendarEvent[] {
  const raw = safeGetItem(STORAGE_KEYS.CALENDAR)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CalendarEvent[]
  } catch {
    return []
  }
}

export function saveCalendarEvent(event: CalendarEvent): boolean {
  const events = getCalendarEvents()
  const existingIndex = events.findIndex((e) => e.id === event.id)
  const updated = { ...event, updatedAt: new Date().toISOString() }

  if (existingIndex >= 0) {
    events[existingIndex] = updated
  } else {
    events.push(updated)
  }

  return safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events))
}

export function deleteCalendarEvent(id: string): boolean {
  const events = getCalendarEvents().filter((e) => e.id !== id)
  return safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events))
}

/** ---------- Settings ---------- */

export function getSettings(): AppSettings | null {
  const raw = safeGetItem(STORAGE_KEYS.SETTINGS)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AppSettings
  } catch {
    return null
  }
}

export function updateSettings(settings: AppSettings): boolean {
  const updated = { ...settings, updatedAt: new Date().toISOString() }
  return safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
}

/** ---------- Utilities ---------- */

export function clearAllData(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => safeRemoveItem(key))
    return true
  } catch {
    return false
  }
}
