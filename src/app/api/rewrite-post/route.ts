import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import { improvePost } from '@/services/ai/openrouter'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { content, action, tone } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const rewritten = await improvePost(content, action, tone)
    return NextResponse.json({ success: true, content: rewritten })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to rewrite post' },
      { status: 500 },
    )
  }
}
