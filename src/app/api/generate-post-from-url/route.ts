import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import { generatePostFromUrl } from '@/services/ai/openrouter'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      topic,
      postType,
      tone,
      targetAudience,
      length,
      language,
      emojiPreference,
      hashtagsEnabled,
      useProfileContext,
      sourceContent,
      sourceTitle,
      sourceUrl,
      profile,
    } = body

    if (!sourceContent) {
      return NextResponse.json(
        { error: 'Source content is required' },
        { status: 400 },
      )
    }

    const post = await generatePostFromUrl({
      topic,
      postType,
      tone,
      targetAudience,
      length,
      language,
      emojiPreference,
      hashtagsEnabled: hashtagsEnabled === true,
      sourceContent,
      sourceTitle,
      sourceUrl,
      profile: useProfileContext ? profile : undefined,
    })

    return NextResponse.json({ success: true, post })
  } catch (error: unknown) {
    console.error('[generate-post-from-url] Error:', error)
    return NextResponse.json(
      {
        error:
          getErrorMessage(error) || 'Failed to generate post from URL.',
      },
      { status: 500 },
    )
  }
}
