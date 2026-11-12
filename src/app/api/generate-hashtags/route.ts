import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import { generateHashtags } from '@/services/ai/openrouter'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { topic, content, count } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const hashtags = await generateHashtags(topic, content || '', count || 5)
    return NextResponse.json({ success: true, hashtags })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to generate hashtags' },
      { status: 500 },
    )
  }
}
