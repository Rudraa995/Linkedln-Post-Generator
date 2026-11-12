'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, Download, RefreshCw, Wand2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LinkedInPreview from '@/components/post-editor/LinkedInPreview'
import { getPosts, savePost, deletePost, updatePost } from '@/lib/storage'
import { rewritePost, regenerateSection, generateHashtags } from '@/services/api/postApi'
import { type LinkedInPost } from '@/types'

interface PostEditorProps {
  initialPost?: LinkedInPost
  onSave?: (post: LinkedInPost) => void
  onBack?: () => void
}

type EditAction =
  | 'improve'
  | 'professional'
  | 'engaging'
  | 'shorten'
  | 'expand'
  | 'grammar'
  | 'tone'

export default function PostEditor({
  initialPost,
  onSave,
  onBack,
}: PostEditorProps) {
  const [post, setPost] = useState<LinkedInPost | null>(null)
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [name, setName] = useState('You')
  const [headline, setHeadline] = useState('Professional')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [sectionLoading, setSectionLoading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Initialize from existing post or empty state
  useEffect(() => {
    if (initialPost) {
      setPost(initialPost)
      setContent(initialPost.content)
      setHashtags(initialPost.hashtags)
      setImageUrl(initialPost.imageUrl)
    } else {
      const empty: LinkedInPost = {
        id: `post_${Date.now()}`,
        topic: '',
        postType: 'project-announcement',
        tone: 'professional',
        targetAudience: 'general-audience',
        length: 'medium',
        language: 'english',
        emojiPreference: 'minimal',
        hashtagsEnabled: true,
        useProfileContext: false,
        content: '',
        hook: '',
        mainContent: '',
        conclusion: '',
        hashtags: [],
        cta: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPost(empty)
    }
  }, [initialPost])

  // Parse hashtags from content
  useEffect(() => {
    const tags = content.match(/#\w+/g)?.map((t) => t.slice(1)) || []
    setHashtags(tags)
  }, [content])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setSaved(false)
  }, [])

  const handleHashtagChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    setHashtags(tags)
  }, [])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const handleHeadlineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHeadline(e.target.value)
  }, [])

  const handleSave = useCallback(async () => {
    if (!post) return
    setSaving(true)
    try {
      const updated: LinkedInPost = {
        ...post,
        content,
        hashtags,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      }
      savePost(updated)
      setPost(updated)
      setSaved(true)
      onSave?.(updated)
    } finally {
      setSaving(false)
    }
  }, [post, content, hashtags, onSave])

  const handleDelete = useCallback(() => {
    if (!post || !window.confirm('Delete this post?')) return
    deletePost(post.id)
    onBack?.()
  }, [post, onBack])

  const handleAIAction = useCallback(async (action: EditAction, tone?: string) => {
    setActionLoading(action)
    try {
      const rewritten = await rewritePost(content, action, tone)
      setContent(rewritten)
      setSaved(false)
    } catch (err: any) {
      alert(err.message || 'AI rewrite failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }, [content])

  const handleRegenerateSection = useCallback(async (section: string) => {
    if (!post) return
    setSectionLoading(section)
    try {
      const data = await regenerateSection(content, section, {
        topic: post.topic,
        tone: post.tone,
        length: post.length,
        language: post.language,
      })
      if (!data.success) throw new Error(data.error || 'Regeneration failed')

      // Replace the specific section in content
      let newContent = content
      if (section === 'hook') {
        newContent = data.hook + '\n\n' + (post.mainContent || '') + '\n\n' + (post.conclusion || '')
      } else if (section === 'main') {
        newContent = (post.hook || '') + '\n\n' + data.main + '\n\n' + (post.conclusion || '')
      } else if (section === 'conclusion') {
        newContent = (post.hook || '') + '\n\n' + (post.mainContent || '') + '\n\n' + data.conclusion
      } else if (section === 'hashtags') {
        newContent = content.replace(/#\w+/g, '') + '\n\n' + data.hashtags
      } else if (section === 'cta') {
        newContent = content + '\n\n' + data.cta
      }

      setPost((prev) => prev ? { ...prev, [section]: data[section], updatedAt: new Date().toISOString() } : prev)
      setContent(newContent)
      setSaved(false)
    } catch (err: any) {
      alert(err.message || 'Section regeneration failed. Please try again.')
    } finally {
      setSectionLoading(null)
    }
  }, [content, post])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linkedin-post-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [content])

  const actionLabels: Record<EditAction, string> = {
    improve: 'Improve Writing',
    professional: 'Make Professional',
    engaging: 'Make Engaging',
    shorten: 'Shorten Post',
    expand: 'Expand Post',
    grammar: 'Fix Grammar',
    tone: 'Change Tone',
  }

  const sectionLabels: Record<string, string> = {
    hook: 'Regenerate Hook',
    main: 'Regenerate Main Content',
    conclusion: 'Regenerate Conclusion',
    hashtags: 'Regenerate Hashtags',
    cta: 'Regenerate CTA',
  }

  if (!post) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Editor Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Post Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Post Identity</CardTitle>
            <CardDescription>
              Set the name and headline that appear in the LinkedIn preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                value={name}
                onChange={handleNameChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Headline</label>
              <input
                value={headline}
                onChange={handleHeadlineChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Content Editor</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {content.length} characters
              </span>
              {saved && (
                <Badge variant="success" className="text-xs">
                  Saved
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Write your LinkedIn post here..."
                rows={18}
                className="resize-none"
              />
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={post.hashtagsEnabled ?? true}
                    onChange={(e) =>
                      setPost((prev) =>
                        prev ? { ...prev, hashtagsEnabled: e.target.checked } : prev
                      )
                    }
                    className="rounded border-input bg-background text-primary focus:ring-0"
                  />
                  Enable hashtags
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  value={hashtags.join(', ')}
                  onChange={handleHashtagChange}
                  placeholder="hashtag1, hashtag2"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {Object.entries(actionLabels).map(([action, label]) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => handleAIAction(action as EditAction)}
                disabled={actionLoading === action}
                className="flex-1 text-xs"
              >
                {actionLoading === action ? '…' : label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIAction('tone', post.tone)}
              disabled={actionLoading === 'tone'}
              className="flex-1 text-xs"
            >
              Change Tone
            </Button>
          </CardFooter>
        </Card>

        {/* Section Regeneration */}
        <Card>
          <CardHeader>
            <CardTitle>Section Regeneration</CardTitle>
            <CardDescription>
              Regenerate individual sections without rewriting the whole post.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {['hook', 'main', 'conclusion', 'hashtags', 'cta'].map((section) => (
              <Button
                key={section}
                variant="outline"
                size="sm"
                onClick={() => handleRegenerateSection(section)}
                disabled={sectionLoading === section}
                className="text-xs justify-start text-left"
              >
                {sectionLoading === section ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" /> {sectionLabels[section]}
                  </span>
                ) : (
                  sectionLabels[section]
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : <><Save className="mr-2 h-4 w-4" /> Save Draft</>}
              </Button>
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" /> Copy Post
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Download .txt
              </Button>
              {post && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Preview</CardTitle>
            <CardDescription>
              See how your post will appear on LinkedIn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedInPreview
              name={name}
              headline={headline}
              content={content}
              hashtags={hashtags}
              imageUrl={imageUrl}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Topic</label>
              <p className="text-sm text-foreground">{post.topic}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
              <Badge variant="secondary">{post.postType}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Tone</label>
              <Badge variant="outline">{post.tone}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Length</label>
              <span className="text-sm text-foreground">{post.length}</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
              <Badge variant={post.status === 'published' ? 'success' : 'secondary'}>
                {post.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Updated</label>
              <span className="text-sm text-muted-foreground">
                {new Date(post.updatedAt).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
