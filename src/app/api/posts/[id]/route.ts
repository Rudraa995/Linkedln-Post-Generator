import { NextRequest, NextResponse } from 'next/server'
import { getPosts, updatePost, deletePost } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(
 _req: NextRequest,
 { params }: { params: { id: string } },
) {
 try {
 const posts = getPosts()
 const post = posts.find((p) => p.id === params.id)
 if (!post) {
 return NextResponse.json({ error: 'Post not found' }, { status: 404 })
 }
 return NextResponse.json({ success: true, post })
 } catch (error: any) {
 return NextResponse.json(
 { error: error.message || 'Failed to fetch post' },
 { status: 500 },
 )
 }
}

export async function PUT(
 req: NextRequest,
 { params }: { params: { id: string } },
) {
 try {
 const body = await req.json()
 const updated = updatePost(params.id, body)
 if (!updated) {
 return NextResponse.json({ error: 'Post not found' }, { status: 404 })
 }
 return NextResponse.json({ success: true, post: updated })
 } catch (error: any) {
 return NextResponse.json(
 { error: error.message || 'Failed to update post' },
 { status: 500 },
 )
 }
}

export async function DELETE(
 _req: NextRequest,
 { params }: { params: { id: string } },
) {
 try {
 const deleted = deletePost(params.id)
 if (!deleted) {
 return NextResponse.json({ error: 'Post not found' }, { status: 404 })
 }
 return NextResponse.json({ success: true })
 } catch (error: any) {
 return NextResponse.json(
 { error: error.message || 'Failed to delete post' },
 { status: 500 },
 )
 }
}
