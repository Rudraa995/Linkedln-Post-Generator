'use client'

import { useState, useCallback } from 'react'
import { Link as LinkIcon, Copy, Download, RefreshCw, AlertTriangle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { analyzeUrl, generatePostFromUrl } from '@/services/api/postApi'
import { generateImage } from '@/services/api/imageApi'

type Step = 'input' | 'extracted' | 'generating' | 'result'

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
 const [extracted, setExtracted] = useState<any>(null)
 const [form, setForm] = useState<FormValues>(DEFAULT_FORM)
 const [generated, setGenerated] = useState<any>(null)
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(false)

 // image state
 const [imageUrl, setImageUrl] = useState<string | null>(null)
 const [imageLoading, setImageLoading] = useState(false)
 const [imageError, setImageError] = useState<string | null>(null)
 const [imageSize, setImageSize] = useState<'landscape' | 'square' | 'portrait'>('landscape')

 const handleAnalyze = useCallback(async () => {
  if (!url.trim()) {
   setError('Please enter a URL.')
   return
  }
  setLoading(true)
  setError(null)
  try {
   const content = await analyzeUrl(url.trim())
   setExtracted(content)
   setForm((prev) => ({
    ...prev,
    topic: content.title || prev.topic,
   }))
   setStep('extracted')
  } catch (err: any) {
   setError(err.message || 'Failed to analyze URL.')
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
  setForm((prev) => ({ ...prev, topic: 'Manual Content' }))
  setStep('extracted')
  setError(null)
 }, [manualContent])

 const handleGenerate = useCallback(async () => {
  if (!extracted) return
  setLoading(true)
  setError(null)
  try {
   const post = await generatePostFromUrl({
    ...form,
    sourceContent: extracted.content,
    sourceTitle: extracted.title,
    sourceUrl: extracted.sourceUrl,
   })
   // save to storage for dashboard count
   try {
    const { savePost } = await import('@/lib/storage')
    savePost({
     ...post,
     id: post.id || `post_${Date.now()}`,
     topic: form.topic || extracted.title,
     postType: form.postType,
     tone: form.tone,
     targetAudience: form.targetAudience,
     length: form.length,
     language: form.language,
     emojiPreference: form.emojiPreference,
     hashtagsEnabled: form.hashtagsEnabled,
     useProfileContext: form.useProfileContext,
     content: post.content || post.fullContent || '',
     status: 'draft',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
    } as any)
   } catch {}
   setGenerated(post)
   setStep('result')
  } catch (err: any) {
   setError(err.message || 'Failed to generate post.')
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

 const handleGenerateImage = useCallback(async () => {
  if (!extracted?.content) return
  setImageLoading(true)
  setImageError(null)
  try {
   const data = await generateImage({
    prompt: extracted.content.slice(0, 500),
    style: 'professional-banner',
    dimension: imageSize,
   })
   setImageUrl(data.imageUrl)
  } catch (err: any) {
   setImageError(err.message || 'Failed to generate image.')
  } finally {
   setImageLoading(false)
  }
 }, [extracted, imageSize])

 const handleImageDownload = useCallback(() => {
  if (!imageUrl) return
  const a = document.createElement('a')
  a.href = imageUrl
  a.download = `linkedin-image-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
 }, [imageUrl])

 return (
  <div className="max-w-6xl mx-auto space-y-4">
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
     <h1 className="text-2xl font-semibold tracking-tight">URL to Post</h1>
     <p className="text-muted-foreground">
      Convert a GitHub repository, blog article, or documentation page into a LinkedIn post. AI analyzes the content and creates a shareable post.
     </p>
    </div>
   </div>

   {error && (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
     {error}
    </div>
   )}

   {/* Step 1: Input */}
   {step === 'input' && (
    <Card>
     <CardHeader>
      <CardTitle>1. Enter URL or Paste Content</CardTitle>
      <CardDescription>Paste a public URL to analyze, or paste content manually.</CardDescription>
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
        className="pl-10"
       />
       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <LinkIcon className="w-4 h-4" />
       </div>
      </div>
      <Button onClick={handleAnalyze} disabled={loading || !url.trim()} className="w-full">
       {loading ? 'Analyzing...' : 'Analyze URL'}
      </Button>

      <div className="relative flex items-center gap-2 my-2">
       <div className="flex-1 h-px bg-border" />
       <span className="text-xs text-muted-foreground">OR</span>
       <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Paste content manually</label>
       <Textarea
        value={manualContent}
        onChange={(e) => setManualContent(e.target.value)}
        placeholder="Paste the article or repository content here..."
        rows={4}
       />
       <Button
        variant="outline"
        onClick={handleUseManual}
        disabled={loading || !manualContent.trim()}
        className="w-full"
       >
        Use Manual Content
       </Button>
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
       <CardDescription>Review and edit the extracted content before generating.</CardDescription>
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
          {extracted.description || 'Content extracted'}
         </p>
        </div>
       </div>

       <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Extracted content (editable)</label>
        <Textarea
         value={extracted.content}
         onChange={(e) => setExtracted({ ...extracted, content: e.target.value })}
         rows={8}
        />
        <div className="flex gap-2 flex-wrap">
         <Button
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(extracted.content)}
         >
          <Copy className="w-4 h-4 mr-1" /> Copy
         </Button>
         <Button variant="outline" size="sm" onClick={() => setStep('input')}>
          Change URL
         </Button>
         <Button
          size="sm"
          onClick={() => {
           if (typeof window !== 'undefined') {
            sessionStorage.setItem('url_to_post_extracted', JSON.stringify(extracted))
           }
           window.location.assign('/url-to-post/generate')
          }}
         >
          Next: Generate Content & Image →
         </Button>
        </div>
       </div>
      </CardContent>
     </Card>

     {/* Generate Post and Image moved to next page */}
     <div className="text-sm text-muted-foreground text-center py-4">
      Click &quot;Next: Generate Content &amp; Image&quot; above to generate post and image.
     </div>
    </>
   )}

   {/* Step 3: Result */}
   {step === 'result' && generated && (
    <Card>
     <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Generated LinkedIn Post</CardTitle>
      <Badge variant="secondary">From URL</Badge>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="bg-card rounded-lg border border-border p-4">
       <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {generated.fullContent || generated.content}
       </div>
       {generated.hashtags && generated.hashtags.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-primary mt-3">
         {generated.hashtags.map((tag: string) => (
          <span key={tag} className="hover:underline">
           #{tag}
          </span>
         ))}
        </div>
       )}
      </div>
      <div className="flex gap-3 flex-wrap">
       <Button onClick={handleCopy} variant="outline">
        <Copy className="w-4 h-4 mr-1" /> Copy
       </Button>
       <Button onClick={handleDownload} variant="outline">
        <Download className="w-4 h-4 mr-1" /> Download
       </Button>
       <Button variant="outline" onClick={handleRegenerate}>
        <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
       </Button>
       <Button variant="outline" onClick={() => setStep('input')}>
        Start Over
       </Button>
      </div>
     </CardContent>
    </Card>
   )}
  </div>
 )
}
