'use client'

import { useState, useCallback, useEffect } from 'react'
import { Link as LinkIcon, Copy, Download, RefreshCw, Wand2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generatePost, generatePostFromUrl } from '@/services/api/postApi'
import { generateImage } from '@/services/api/imageApi'
import { savePost } from '@/lib/storage'

export default function UrlToPostGeneratePage() {
 const [extracted, setExtracted] = useState<any>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 // post form
 const [postType, setPostType] = useState('Project Announcement')
 const [tone, setTone] = useState('Professional')
 const [length, setLength] = useState('Medium')
 const [language, setLanguage] = useState('English')
 const [generated, setGenerated] = useState<any>(null)
 const [copied, setCopied] = useState(false)

 // image
 const [imageSize, setImageSize] = useState<'landscape' | 'square' | 'portrait'>('landscape')
 const [imageUrl, setImageUrl] = useState<string | null>(null)
 const [imageLoading, setImageLoading] = useState(false)
 const [imageError, setImageError] = useState<string | null>(null)

 useEffect(() => {
  if (typeof window !== 'undefined') {
   const raw = sessionStorage.getItem('url_to_post_extracted')
   if (raw) {
    try {
     const data = JSON.parse(raw)
     setExtracted(data)
    } catch {
     setExtracted(null)
    }
   }
  }
 }, [])

 const handleGeneratePost = useCallback(async () => {
  if (!extracted) return
  setLoading(true)
  setError(null)
  try {
   const post = await generatePostFromUrl({
    postType,
    tone,
    targetAudience: 'General Audience',
    length,
    language,
    emojiPreference: 'Minimal Emojis',
    hashtagsEnabled: true,
    useProfileContext: false,
    sourceContent: extracted.content,
    sourceTitle: extracted.title,
    sourceUrl: extracted.sourceUrl,
   })
   try {
    savePost({
     ...post,
     id: post.id || `post_${Date.now()}`,
     topic: extracted.title || 'URL Content',
     postType,
     tone,
     targetAudience: 'General Audience',
     length,
     language,
     emojiPreference: 'Minimal Emojis',
     hashtagsEnabled: true,
     useProfileContext: false,
     content: post.content || post.fullContent || '',
     status: 'draft',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
    } as any)
   } catch {}
   setGenerated(post)
  } catch (err: any) {
   setError(err.message || 'Failed to generate post.')
  } finally {
   setLoading(false)
  }
 }, [extracted, postType, tone, length, language])

 const handleCopyPost = useCallback(() => {
  if (!generated?.fullContent && !generated?.content) return
  navigator.clipboard.writeText(generated.fullContent || generated.content)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }, [generated])

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

 if (!extracted) {
  return (
   <div className="max-w-6xl mx-auto space-y-4">
    <Card>
     <CardContent className="p-6 text-center text-muted-foreground">
      No extracted content found. Please analyze a URL first.
      <div className="mt-4">
       <Button variant="outline" onClick={() => (window.location.href = '/url-to-post')}>
        Go Back
       </Button>
      </div>
     </CardContent>
    </Card>
   </div>
  )
 }

 return (
  <div className="max-w-6xl mx-auto space-y-4">
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
     <h1 className="text-2xl font-semibold tracking-tight">Generate from URL Content</h1>
     <p className="text-muted-foreground text-sm">
      Use the extracted content to generate a LinkedIn post and image.
     </p>
    </div>
    <Button variant="outline" size="sm" onClick={() => (window.location.href = '/url-to-post')}>
     Back to Extract
    </Button>
   </div>

   {error && (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
     {error}
    </div>
   )}

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Generate LinkedIn Content */}
    <Card>
     <CardHeader>
      <CardTitle>Generate LinkedIn Content</CardTitle>
      <CardDescription>Generate an AI caption from the extracted content.</CardDescription>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Topic</label>
       <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
        {extracted.title || 'Extracted content'}
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Post Type</label>
       <select
        value={postType}
        onChange={(e) => setPostType(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
       >
        <option>Project Announcement</option>
        <option>Achievement</option>
        <option>Learning Experience</option>
        <option>Technical Knowledge</option>
        <option>Industry Insights</option>
        <option>Career Advice</option>
       </select>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Tone</label>
       <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
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
       <label className="text-sm font-medium text-foreground">Length</label>
       <select
        value={length}
        onChange={(e) => setLength(e.target.value)}
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
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
       >
        <option>English</option>
        <option>Hindi</option>
        <option>Gujarati</option>
       </select>
      </div>
      <Button onClick={handleGeneratePost} disabled={loading} className="w-full">
       {loading ? 'Generating...' : 'Generate Content'}
      </Button>
      {generated && (
       <div className="space-y-2 mt-2">
        <div className="rounded-md border border-border bg-card p-3 text-sm whitespace-pre-wrap">
         {generated.fullContent || generated.content}
        </div>
        <Button
         variant="outline"
         size="sm"
         onClick={handleCopyPost}
         className="w-full"
        >
         <Copy className="w-4 h-4 mr-1" /> {copied ? 'Copied!' : 'Copy Caption'}
        </Button>
       </div>
      )}
     </CardContent>
    </Card>

    {/* Generate LinkedIn Image */}
    <Card>
     <CardHeader>
      <CardTitle>Generate LinkedIn Image</CardTitle>
      <CardDescription>Use the extracted content as the image topic.</CardDescription>
     </CardHeader>
     <CardContent className="space-y-4">
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Topic</label>
       <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
        {extracted.title || 'Extracted content'}
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Image size / aspect ratio</label>
       <div className="grid grid-cols-3 gap-2">
        {(['landscape', 'square', 'portrait'] as const).map((d) => (
         <button
          key={d}
          onClick={() => setImageSize(d)}
          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs ${
           imageSize === d
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:bg-accent'
          }`}
         >
          <div className="font-medium capitalize">{d}</div>
          <div>{d === 'landscape' ? '1200 × 627' : d === 'square' ? '1080 × 1080' : '1080 × 1350'}</div>
         </button>
        ))}
       </div>
      </div>
      {imageError && (
       <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
        {imageError}
       </div>
      )}
      <Button onClick={handleGenerateImage} disabled={imageLoading} className="w-full">
       {imageLoading ? 'Generating...' : 'Generate Image'}
      </Button>
      {imageUrl && (
       <div className="space-y-2">
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border border-border">
         <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
        </div>
        <Button variant="outline" size="sm" onClick={handleImageDownload} className="w-full">
         <Download className="w-4 h-4 mr-1" /> Download Image
        </Button>
       </div>
      )}
     </CardContent>
    </Card>
   </div>
  </div>
 )
}