'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Edit3, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import SplitText from '@/components/SplitText'
import Magnet from '@/components/Magnet'
import AnimatedContent from '@/components/AnimatedContent'
import ShinyText from '@/components/ShinyText'
import PostEditor from '@/components/post-editor/PostEditor'
import LinkedInPreview from '@/components/post-editor/LinkedInPreview'
import { getErrorMessage } from '@/lib/utils'
import { savePost, getPosts, getProfile } from '@/lib/storage'
import { generatePost } from '@/services/api/postApi'
import { type LinkedInPost, type PostType, type Tone, type Length, type Language, type EmojiPreference, type TargetAudience } from '@/types'

type Step = 'form' | 'editor'

const POST_TYPES: PostType[] = [
  'project-announcement', 'achievement', 'learning-experience',
  'internship-experience', 'job-update', 'technical-knowledge',
  'personal-story', 'industry-insights', 'career-advice', 'product-launch',
]

const TONES: Tone[] = ['professional', 'friendly', 'storytelling', 'inspirational', 'technical', 'humorous', 'conversational']
const AUDIENCES: TargetAudience[] = ['recruiters', 'developers', 'hr-professionals', 'students', 'entrepreneurs', 'business-owners', 'tech-community', 'general-audience']
const LENGTHS: Length[] = ['short', 'medium', 'long']
const LANGUAGES: Language[] = ['english', 'hindi', 'gujarati']
const EMOJIS: EmojiPreference[] = ['none', 'minimal', 'creative']

const labelMap: Record<string, string> = {
  'project-announcement': 'Project Announcement',
  'achievement': 'Achievement',
  'learning-experience': 'Learning Experience',
  'internship-experience': 'Internship Experience',
  'job-update': 'Job Update',
  'technical-knowledge': 'Technical Knowledge',
  'personal-story': 'Personal Story',
  'industry-insights': 'Industry Insights',
  'career-advice': 'Career Advice',
  'product-launch': 'Product Launch',
}

export default function CreatePostPage() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    topic: '',
    postType: 'project-announcement' as PostType,
    tone: 'professional' as Tone,
    targetAudience: 'general-audience' as TargetAudience,
    length: 'medium' as Length,
    language: 'english' as Language,
    emojiPreference: 'minimal' as EmojiPreference,
    hashtagsEnabled: true,
    useProfileContext: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<LinkedInPost | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!form.topic.trim()) {
      setError('Please enter a topic.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Read profile from client-side localStorage
      const profile = form.useProfileContext ? (getProfile() ?? undefined) : undefined
      const post = await generatePost({ ...form, profile })
      setGenerated(post)
      setStep('editor')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to generate post. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [form])

  const handleSaveDraft = useCallback((post: LinkedInPost) => {
    // Already saved in editor via storage service
  }, [])

  const handleBack = useCallback(() => {
    setStep('form')
    setGenerated(null)
    setError(null)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Step 1: Generation Form */}
      {step === 'form' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SplitText text="Create Post" tag="h1" className="text-2xl font-bold tracking-tight sm:text-3xl" effect="pop" trigger="load" />
            <div className="flex items-center gap-2">
              <ShinyText text="AI-powered generation" className="text-sm text-muted-foreground" speed={3} />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/50 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <AnimatedContent trigger="mount" distance={24}>
            <Card>
              <CardHeader>
              <CardTitle>Post Generation</CardTitle>
              <CardDescription>
                Fill in the details below to generate a personalized LinkedIn post using AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Topic</label>
                <Input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. My experience building an AI project"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Post Type</label>
                <select
                  value={form.postType}
                  onChange={(e) => setForm({ ...form, postType: e.target.value as PostType })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {POST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {labelMap[t] || t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tone</label>
                  <select
                    value={form.tone}
                    onChange={(e) => setForm({ ...form, tone: e.target.value as Tone })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Audience</label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value as TargetAudience })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Length</label>
                  <select
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value as Length })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {LENGTHS.map((l) => (
                      <option key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value as Language })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Emoji Preference</label>
                  <select
                    value={form.emojiPreference}
                    onChange={(e) => setForm({ ...form, emojiPreference: e.target.value as EmojiPreference })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {EMOJIS.map((e) => (
                      <option key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/50 pt-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.useProfileContext}
                      onChange={(e) => setForm({ ...form, useProfileContext: e.target.checked })}
                      className="rounded border-input bg-background text-primary focus:ring-0 peer"
                    />
                    <span className="text-sm text-foreground">
                      Use My Professional Profile
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Include saved profile context (skills, projects, experience)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.hashtagsEnabled}
                      onChange={(e) => setForm({ ...form, hashtagsEnabled: e.target.checked })}
                      className="rounded border-input bg-background text-primary focus:ring-0 peer"
                    />
                    <span className="text-sm text-foreground">
                      Enable Hashtags
                    </span>
                  </label>
                </div>
              </div>

              <Magnet>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !form.topic.trim()}
                  className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating…' : <><Edit3 className="mr-2 h-4 w-4" /> Generate Post</>}
                </Button>
              </Magnet>
            </CardContent>
          </Card>
          </AnimatedContent>
        </>
      )}

      {/* Step 2: Editor */}
      {step === 'editor' && generated && (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <span className="text-xs text-muted-foreground">Editing generated post</span>
          </div>
          <PostEditor
            initialPost={generated as LinkedInPost}
            onSave={handleSaveDraft}
            onBack={handleBack}
          />
        </>
      )}
    </div>
  )
}
