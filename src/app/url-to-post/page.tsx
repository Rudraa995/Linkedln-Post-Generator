'use client'

import { useState, useCallback } from 'react'
import { Link as LinkIcon, Copy, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import SplitText from '@/components/SplitText'
import ShinyText from '@/components/ShinyText'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getErrorMessage } from '@/lib/utils'
import { analyzeUrl, generatePostFromUrl } from '@/services/api/postApi'
import type { AnalyzeUrlResponse } from '@/types'
import type { GeneratedPostFromUrl } from '@/services/api/postApi'

type Step = 'input' | 'analyzing' | 'extracted' | 'generating' | 'result' | 'error'

interface FormValues {
  topic: string
  postType: string
  tone: string
  targetAudience: string
  length: string
  language: string
  emojiPreference: string
  hashtagsEnabled: boolean
  useProfileContext: boolean
}

const DEFAULT_FORM: FormValues = {
  topic: '',
  postType: 'Project Announcement',
  tone: 'Professional',
  targetAudience: 'General Audience',
  length: 'Medium',
  language: 'English',
  emojiPreference: 'Minimal Emojis',
  hashtagsEnabled: true,
  useProfileContext: false,
}

export default function UrlToPostPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [manualContent, setManualContent] = useState('')
  const [extracted, setExtracted] = useState<AnalyzeUrlResponse | null>(null)
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM)
  const [generated, setGenerated] = useState<GeneratedPostFromUrl | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL.')
      return
    }

    setStep('analyzing')
    setError(null)
    setLoading(true)

    try {
      const content = await analyzeUrl(url.trim())
      setExtracted(content)
      setForm((prev) => ({
        ...prev,
        topic: content.title || prev.topic,
      }))
      setStep('extracted')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to analyze URL.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleUseManual = useCallback(() => {
    if (!manualContent.trim()) {
      setError('Please paste some content first.')
      return
    }
    setExtracted({
      title: 'Manual Content',
      description: '',
      content: manualContent.trim(),
      sourceUrl: '',
      extractedAt: new Date().toISOString(),
    })
    setStep('extracted')
    setError(null)
  }, [manualContent])

  const handleGenerate = useCallback(async () => {
    if (!extracted) return

    setStep('generating')
    setError(null)
    setLoading(true)

    try {
      const post = await generatePostFromUrl({
        ...form,
        sourceContent: extracted.content,
        sourceTitle: extracted.title,
        sourceUrl: extracted.sourceUrl,
      })
      setGenerated(post)
      setStep('result')
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to generate post.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }, [extracted, form])

  const handleCopy = useCallback(() => {
    if (!generated?.fullContent) return
    navigator.clipboard.writeText(generated.fullContent)
  }, [generated])

  const handleDownload = useCallback(() => {
    if (!generated?.fullContent) return
    const blob = new Blob([generated.fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linkedin-post-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generated])

  const handleRegenerate = useCallback(() => {
    setGenerated(null)
    handleGenerate()
  }, [handleGenerate])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SplitText text="URL to Post" tag="h1" className="text-2xl font-bold tracking-tight sm:text-3xl" effect="skew" trigger="load" />
          <ShinyText text="Convert a GitHub repository, blog article, or documentation page into a LinkedIn post. AI analyzes the content and creates a shareable post." className="text-muted-foreground" speed={3} />
        </div>
      </div>

      {/* Step 1: URL Input */}
      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Enter URL</CardTitle>
            <CardDescription>
              Paste a public GitHub repo, blog, or article URL to analyze.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Paste your GitHub repository, blog, or article URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze()
                }}
                className="pl-10 pr-4 py-3"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LinkIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    Analyzing...
                  </>
                ) : (
                  <><AlertTriangle className="mr-2 h-4 w-4" /> Analyze URL</>
                )}
              </Button>
              <button
                onClick={() => setStep('input')}
                className="text-xs border border-input px-3 py-1.5 rounded hover:bg-accent text-muted-foreground"
              >
                Paste content manually instead
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual content fallback */}
      {step === 'error' && (
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Try a different URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LinkIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Or paste content manually:</label>
                <Textarea
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Paste the article or repository content here..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAnalyze} disabled={loading}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleUseManual} disabled={loading}>
                  Use Manual Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Extracted Content Review */}
      {step === 'extracted' && extracted && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>2. Extracted Content</CardTitle>
              <CardDescription>
                Review what AI extracted from the URL before generating.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {extracted.title}
                    </h3>
                    {extracted.sourceUrl && (
                      <a
                        href={extracted.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open source
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {extracted.description ||
                      'Content extracted from ' + new URL(extracted.sourceUrl).hostname}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Extracted content preview
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {extracted.content.slice(0, 800)}
                  {extracted.content.length > 800 ? '...' : ''}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('input')}
                >
                  Change URL
                </Button>
                <Button onClick={handleGenerate} className="flex-1">
                  Generate Post →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle>3. Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Post Type</label>
                <select
                  value={form.postType}
                  onChange={(e) =>
                    setForm({ ...form, postType: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Project Announcement</option>
                  <option>Achievement</option>
                  <option>Learning Experience</option>
                  <option>Internship Experience</option>
                  <option>Job Update</option>
                  <option>Technical Knowledge</option>
                  <option>Personal Story</option>
                  <option>Industry Insights</option>
                  <option>Career Advice</option>
                  <option>Product Launch</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tone</label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Storytelling</option>
                  <option>Inspirational</option>
                  <option>Technical</option>
                  <option>Humorous</option>
                  <option>Conversational</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) =>
                    setForm({ ...form, targetAudience: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Recruiters</option>
                  <option>Developers</option>
                  <option>HR Professionals</option>
                  <option>Students</option>
                  <option>Entrepreneurs</option>
                  <option>Business Owners</option>
                  <option>Tech Community</option>
                  <option>General Audience</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Length</label>
                <select
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Short</option>
                  <option>Medium</option>
                  <option>Long</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Emoji Preference</label>
                <select
                  value={form.emojiPreference}
                  onChange={(e) =>
                    setForm({ ...form, emojiPreference: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>No Emojis</option>
                  <option>Minimal Emojis</option>
                  <option>Creative Emojis</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.hashtagsEnabled}
                    onChange={(e) =>
                      setForm({ ...form, hashtagsEnabled: e.target.checked })
                    }
                    className="rounded border-input bg-background text-primary focus:ring-0 peer"
                  />
                  <span className="text-sm text-foreground">
                    Enable Hashtags
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.useProfileContext}
                    onChange={(e) =>
                      setForm({ ...form, useProfileContext: e.target.checked })
                    }
                    className="rounded border-input bg-background text-primary focus:ring-0 peer"
                  />
                  <span className="text-sm text-foreground">
                    Use My Professional Profile
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Include saved profile context
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate LinkedIn Post'}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Step 3: Result */}
      {step === 'result' && generated && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>4. Generated LinkedIn Post</CardTitle>
            <Badge variant="info">From URL</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-card rounded-lg border border-border p-4 max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">U</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">User Name</div>
                  <div className="text-xs text-muted-foreground">
                    via URL to Post • Just now
                  </div>
                </div>
              </div>
              <div className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                {generated.fullContent}
              </div>
              {generated.hashtags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-primary mb-3">
                  {generated.hashtags.map((tag: string) => (
                    <span key={tag} className="hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {extracted?.sourceUrl && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>Source: {extracted.sourceUrl}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCopy} variant="outline">
                <Copy className="w-4 h-4" /> Copy
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button variant="outline" onClick={handleRegenerate}>
                <RefreshCw className="w-4 h-4" /> Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
