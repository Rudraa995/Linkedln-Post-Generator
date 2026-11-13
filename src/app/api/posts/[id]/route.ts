import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'
import { getPosts, updatePost, deletePost } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const posts = getPosts()
    const post = posts.find((p) => p.id === id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, post })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to fetch post' },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = updatePost(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, post: updated })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to update post' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const deleted = deletePost(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to delete post' },
      { status: 500 },
    )
  }
}
