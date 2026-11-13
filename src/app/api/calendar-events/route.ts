import { NextRequest, NextResponse } from 'next/server'
import { generateId, getErrorMessage } from '@/lib/utils'
import {
  getCalendarEvents,
  saveCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const events = getCalendarEvents()
    return NextResponse.json({ success: true, events })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to fetch calendar events' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId, title, date, time, status } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 },
      )
    }

    const event = {
      id: generateId(),
      postId,
      title,
      date,
      time,
      status: status || 'planned',
      createdAt: new Date().toISOString(),
    }

    const saved = saveCalendarEvent(event)
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save calendar event' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, event })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to create calendar event' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const deleted = deleteCalendarEvent(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to delete calendar event' },
      { status: 500 },
    )
  }
}
