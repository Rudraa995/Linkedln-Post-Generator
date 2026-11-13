import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import { fetchAndExtractContent } from '@/services/url/fetcher'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 },
      )
    }

    const content = await fetchAndExtractContent(url)

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error: unknown) {
    console.error('[analyze-url] Error:', error)
    return NextResponse.json(
      {
        error:
          getErrorMessage(error) || 'Failed to analyze the URL. Please try again.',
      },
      { status: 500 },
    )
  }
}
