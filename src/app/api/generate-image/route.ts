import { NextRequest, NextResponse } from 'next/server'
import { generateImage, isImageGenerationConfigured } from '@/services/image/provider'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (!isImageGenerationConfigured()) {
      return NextResponse.json(
        {
          error:
            'Image generation is not configured. Set IMAGE_GENERATION_API_KEY in your .env file.',
        },
        { status: 503 },
      )
    }

    const body = await req.json()
    const { prompt, style, dimension } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateImage({
      prompt,
      style,
      dimension,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('[generate-image] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image.' },
      { status: 500 },
    )
  }
}
