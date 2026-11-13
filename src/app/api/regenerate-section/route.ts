import { NextRequest, NextResponse } from 'next/server'
import { regeneratePostSection } from '@/services/ai/openrouter'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
 try {
 const { content, section, context } = await req.json()

 if (!content || !section || !context) {
 return NextResponse.json(
 { error: 'Content, section, and context are required' },
 { status: 400 },
 )
 }

 const result = await regeneratePostSection({ content, section, context })
 return NextResponse.json({ success: true, [section]: result })
 } catch (error: any) {
 return NextResponse.json(
 { error: error.message || 'Failed to regenerate section' },
 { status: 500 },
 )
 }
}
