import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInPost } from '@/services/ai/openrouter'

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
 profile,
 } = body

 // Validation
 if (!topic || typeof topic !== 'string') {
 return NextResponse.json(
 { error: 'Topic is required' },
 { status: 400 },
 )
 }

 // Profile is passed from the client (localStorage), not read server-side
 const post = await generateLinkedInPost({
 topic,
 postType,
 tone,
 targetAudience,
 length,
 language,
 emojiPreference,
 hashtagsEnabled: hashtagsEnabled === true,
 useProfileContext: useProfileContext === true,
 profile: useProfileContext ? profile : undefined,
 })

 return NextResponse.json({ success: true, post })
 } catch (error: any) {
 console.error('[generate-post] Error:', error)
 return NextResponse.json(
 {
 error:
 error.message || 'Failed to generate post. Please try again.',
 },
 { status: 500 },
 )
 }
}
