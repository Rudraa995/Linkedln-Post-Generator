/**
 * TypeScript interfaces for the LinkedIn Content Creator.
 * These models are designed to be storage-agnostic so localStorage
 * can be replaced with Supabase PostgreSQL in a future phase.
 */

export type PostStatus = 'draft' | 'planned' | 'scheduled' | 'published'
export type PostType =
  | 'project-announcement'
  | 'achievement'
  | 'learning-experience'
  | 'internship-experience'
  | 'job-update'
  | 'technical-knowledge'
  | 'personal-story'
  | 'industry-insights'
  | 'career-advice'
  | 'product-launch'

export type Tone =
  | 'professional'
  | 'friendly'
  | 'storytelling'
  | 'inspirational'
  | 'technical'
  | 'humorous'
  | 'conversational'

export type Length = 'short' | 'medium' | 'long'

export type Language = 'english' | 'hindi' | 'gujarati'

export type EmojiPreference = 'none' | 'minimal' | 'creative'

export type TargetAudience =
  | 'recruiters'
  | 'developers'
  | 'hr-professionals'
  | 'students'
  | 'entrepreneurs'
  | 'business-owners'
  | 'tech-community'
  | 'general-audience'

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

export interface Skill {
  id: string
  name: string
}

export interface Experience {
  id: string
  role: string
  company: string
  duration: string
  description: string
  type: 'work' | 'internship'
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
}

export interface UserProfile {
  id: string
  fullName: string
  headline: string
  aboutMe: string
  currentRole: string
  education: string
  collegeUniversity: string
  skills: Skill[]
  workExperience: Experience[]
  internshipExperience: Experience[]
  projects: Project[]
  certifications: Certification[]
  achievements: Achievement[]
  professionalInterests: string[]
  createdAt: string
  updatedAt: string
}

export interface LinkedInPost {
  id: string
  topic: string
  postType: PostType
  tone: Tone
  targetAudience: TargetAudience
  length: Length
  language: Language
  emojiPreference: EmojiPreference
  hashtagsEnabled: boolean
  useProfileContext: boolean
  content: string
  hook?: string
  mainContent?: string
  conclusion?: string
  hashtags: string[]
  cta?: string
  imageUrl?: string
  imagePrompt?: string
  status: PostStatus
  scheduledAt?: string
  sourceUrl?: string
  sourceTitle?: string
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  postId: string
  title: string
  date: string // ISO date string
  time?: string // HH:MM
  status: PostStatus
  updatedAt?: string
  createdAt: string
}

export interface AppSettings {
  defaultLanguage: Language
  defaultTone: Tone
  defaultLength: Length
  defaultEmojiPreference: EmojiPreference
  defaultHashtagPreference: boolean
  defaultPostType: PostType
  defaultTargetAudience: TargetAudience
  updatedAt: string
}

export interface GeneratePostRequest {
  topic: string
  postType: PostType
  tone: Tone
  targetAudience: TargetAudience
  length: Length
  language: Language
  emojiPreference: EmojiPreference
  hashtagsEnabled: boolean
  useProfileContext: boolean
  profile?: UserProfile
}

export interface GeneratePostResponse {
  post: LinkedInPost
  hook: string
  mainContent: string
  conclusion: string
  hashtags: string[]
  cta: string
}

export interface AnalyzeUrlRequest {
  url: string
}

export interface AnalyzeUrlResponse {
  title: string
  description: string
  content: string
  sourceUrl: string
  extractedAt: string
}

export interface GenerateImageRequest {
  prompt: string
  style: ImageStyle
  dimension: ImageDimension
}

export interface GenerateImageResponse {
  imageUrl: string
  prompt: string
}

export interface RewritePostRequest {
  content: string
  action: 'improve' | 'professional' | 'engaging' | 'shorten' | 'expand' | 'grammar' | 'tone'
  tone?: Tone
}

export interface RegenerateSectionRequest {
  content: string
  section: 'hook' | 'main' | 'conclusion' | 'hashtags' | 'cta'
  context: {
    topic: string
    tone: Tone
    length: Length
    language: Language
  }
}
