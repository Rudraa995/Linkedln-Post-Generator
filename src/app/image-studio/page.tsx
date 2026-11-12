'use client'

import { useState, useCallback } from 'react'
import { Image as ImageIcon, Download, RefreshCw, Wand2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SplitText from '@/components/SplitText'
import Magnet from '@/components/Magnet'
import ShinyText from '@/components/ShinyText'
import { generateImage } from '@/services/api/imageApi'
import { getErrorMessage } from '@/lib/utils'

type ImageStyle =
  | 'professional-banner'
  | 'technology-illustration'
  | 'minimalist-design'
  | 'business-graphic'
  | 'educational-infographic'
  | 'creative-illustration'

type ImageDimension =
  | 'landscape'
  | 'square'
  | 'portrait'

const STYLE_OPTIONS: { value: ImageStyle; label: string; description: string }[] = [
  {
    value: 'professional-banner',
    label: 'Professional Banner',
    description: 'Clean corporate design for LinkedIn headers',
  },
  {
    value: 'technology-illustration',
    label: 'Technology Illustration',
    description: 'Circuit boards, digital nodes, futuristic UI',
  },
  {
    value: 'minimalist-design',
    label: 'Minimalist Design',
    description: 'Clean, simple, ample negative space',
  },
  {
    value: 'business-graphic',
    label: 'Business Graphic',
    description: 'Charts, data visualization, corporate style',
  },
  {
    value: 'educational-infographic',
    label: 'Educational Infographic',
    description: 'Diagrams, step-by-step visual flow',
  },
  {
    value: 'creative-illustration',
    label: 'Creative Illustration',
    description: 'Artistic, imaginative, expressive style',
  },
]

const DIMENSION_OPTIONS: { value: ImageDimension; label: string; size: string }[] = [
  { value: 'landscape', label: 'Landscape', size: '1200 × 627' },
  { value: 'square', label: 'Square', size: '1080 × 1080' },
  { value: 'portrait', label: 'Portrait', size: '1080 × 1350' },
]

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<ImageStyle>('professional-banner')
  const [dimension, setDimension] = useState<ImageDimension>('landscape')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter an image prompt.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await generateImage({ prompt: prompt.trim(), style, dimension })
      setImageUrl(data.imageUrl)
      setUsedPrompt(data.prompt)
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to generate image.')
    } finally {
      setLoading(false)
    }
  }, [prompt, style, dimension])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `linkedin-image-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [imageUrl])

  const handleRegenerate = useCallback(() => {
    setImageUrl(null)
    handleGenerate()
  }, [handleGenerate])

  const handleFromPost = useCallback((postContent: string, postStyle: ImageStyle) => {
    setPrompt(postContent)
    setStyle(postStyle)
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SplitText text="Image Studio" tag="h1" className="text-3xl font-bold tracking-tight" effect="blur" trigger="load" />
          <ShinyText text="Generate AI images for your LinkedIn posts. Choose a style and dimension that matches your content." className="text-muted-foreground" speed={3} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Image Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Style</label>
                <div className="space-y-2">
                  {STYLE_OPTIONS.map((s) => (
                    <label
                      key={s.value}
                      className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                        style === s.value
                          ? 'border-primary bg-primary/10'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={style === s.value}
                        onChange={() => setStyle(s.value)}
                        className="sr-only"
                        readOnly
                      />
                      <div className="font-medium text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dimensions</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIMENSION_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDimension(d.value)}
                      className={`aspect-square flex flex-col items-center gap-1 rounded-lg border border-input px-2 py-2 text-xs transition-colors ${
                        dimension === d.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{d.label}</div>
                      <div>{d.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Magnet>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" /> Generate Image
                    </>
                  )}
                </Button>
              </Magnet>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preview</CardTitle>
              {imageUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-3 h-3" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRegenerate}>
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
              {imageUrl ? (
                <div className="relative w-full max-w-md aspect-[3/2] rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src={imageUrl}
                    alt="Generated image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm text-white font-medium">
                      {usedPrompt?.slice(0, 80)}...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center mb-4 border border-dashed border-border">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your generated image will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
