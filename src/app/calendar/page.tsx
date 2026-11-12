'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getCalendarEvents,
  saveCalendarEvent,
  deleteCalendarEvent,
  getPosts,
} from '@/lib/storage'
import { type CalendarEvent, type PostStatus, type LinkedInPost } from '@/types'
import { formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700',
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEvents(getCalendarEvents())
    setPosts(getPosts())
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  // Calendar day cells
  const dayCells: (Date | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dayCells.push(new Date(year, month, i))
  }

  // Events for current month
  const monthEvents = events.filter((e) => {
    const eventDate = new Date(e.date)
    return (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month
    )
  })

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    monthEvents.forEach((e) => {
      const key = e.date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [monthEvents])

  const prevMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])
  const nextMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const handleDateClick = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = eventsByDate.get(dateStr) || []
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      setSelectedEvent(null)
      setShowEditor(true)
    } else {
      // Create new event for this date
      const newEvent: CalendarEvent = {
        id: `evt_${Date.now()}`,
        postId: '',
        title: 'New Post',
        date: dateStr,
        status: 'draft',
        createdAt: new Date().toISOString(),
      }
      setSelectedEvent(newEvent)
      setShowEditor(true)
    }
  }, [eventsByDate])

  const handleSaveEvent = useCallback((eventData: CalendarEvent) => {
    const saved = saveCalendarEvent(eventData)
    if (saved) {
      setEvents(getCalendarEvents())
      setSelectedEvent(null)
      setShowEditor(false)
    }
  }, [])

  const handleDeleteEvent = useCallback((id: string) => {
    if (!window.confirm('Delete this calendar event?')) return
    deleteCalendarEvent(id)
    setEvents(getCalendarEvents())
    setSelectedEvent(null)
  }, [])

  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return eventsByDate.get(dateStr) || []
  }, [eventsByDate])

  const statusFilter = useCallback((status: PostStatus) => {
    return events.filter((e) => e.status === status).length
  }, [events])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {MONTHS[month]} {year}
          </h1>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {[ 'month', 'week', 'day' ].map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(v as 'month' | 'week' | 'day')}
              className={`text-xs ${view === v ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
          <Button
            onClick={() => {
              const newEvent: CalendarEvent = {
                id: `evt_${Date.now()}`,
                postId: '',
                title: 'New Post',
                date: new Date().toISOString().split('T')[0],
                status: 'draft',
                createdAt: new Date().toISOString(),
              }
              setSelectedEvent(newEvent)
              setShowEditor(true)
            }}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[ 'draft', 'planned', 'scheduled', 'published' ].map((status) => (
          <Card key={status} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
                <p className="text-2xl font-bold">{statusFilter(status as PostStatus)}</p>
              </div>
              <Badge variant="outline" className="h-8 w-8">
                {status.charAt(0).toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-0 border border-border">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center py-3 text-xs font-medium text-muted-foreground border-b border-border bg-muted/50"
                >
                  {day}
                </div>
              ))}
              {dayCells.map((cell, i) => (
                <div
                  key={i}
                  className="aspect-[1.1] border border-border/50 p-2 cursor-pointer hover:bg-accent transition-colors"
                  onClick={cell ? () => handleDateClick(cell) : undefined}
                >
                  {cell && (
                    <div className="flex flex-col h-full">
                      <div className="text-xs font-medium text-foreground">
                        {cell.getDate()}
                      </div>
                      <div className="flex-1 flex items-end gap-1 pt-1">
                        {getEventsForDate(cell).map((ev) => (
                          <div
                            key={ev.id}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-medium border border-current ${STATUS_COLORS[ev.status]}`}
                          >
                            {ev.title.slice(0, 12)}{ev.title.length > 12 ? '…' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event List (for week/day views or selected date) */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedEvent ? `Event Details` : `Upcoming Posts`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEvent ? (
            <EventEditor
              event={selectedEvent}
              posts={posts}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              onClose={() => setSelectedEvent(null)}
            />
          ) : (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No calendar events yet. Create your first post.
                </div>
              ) : (
                events.slice(0, 10).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ev.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDate(ev.date)} {ev.time ? `• ${ev.time}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ev.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl border border-input p-6 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg">
                {selectedEvent ? 'Edit Calendar Event' : 'New Calendar Event'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowEditor(false)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
            {selectedEvent && (
              <EventEditor
                event={selectedEvent}
                posts={posts}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                onClose={() => setShowEditor(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EventEditor({
  event,
  posts,
  onSave,
  onDelete,
  onClose,
}: {
  event: CalendarEvent
  posts: LinkedInPost[]
  onSave: (e: CalendarEvent) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...event })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm({ ...event })
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const updated: CalendarEvent = { ...form, updatedAt: new Date().toISOString() }
    onSave(updated)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Time</label>
        <input
          type="time"
          value={form.time || ''}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="draft">Draft</option>
          <option value="planned">Planned</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Linked Post</label>
        <select
          value={form.postId}
          onChange={(e) => setForm({ ...form, postId: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">None</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.topic || 'Untitled Post'}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving…' : 'Save Event'}
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {event.id.startsWith('evt_') && (
          <Button variant="destructive" onClick={() => onDelete(form.id)}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
