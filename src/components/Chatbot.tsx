'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendChatMessage, ChatMessage } from '@/services/api/chatApi'
import { getPosts, getProfile } from '@/lib/storage'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am your LinkedIn AI assistant. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const buildContext = () => {
    const posts = getPosts()
    const profile = getProfile()
    const drafts = posts.filter((p) => p.status === 'draft').length
    const scheduled = posts.filter((p) => p.status === 'scheduled').length
    const planned = posts.filter((p) => p.status === 'planned').length
    const published = posts.filter((p) => p.status === 'published').length
    const username = (typeof window !== 'undefined' && localStorage.getItem('linkedin_creator_user')) || profile?.fullName || 'user'
    const calendar = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('linkedin_creator_calendar') || '[]') : []
    const postList = posts.map((p, i) => `${i + 1}. ${p.topic} (${p.postType}, ${p.status})`).join('\\n')
    const skills = profile?.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)).join(', ') || 'none'
    const projects = profile?.projects?.map((p: any) => p.name).join(', ') || 'none'
    return [
      `Username: ${username}`,
      `Profile name: ${profile?.fullName || 'not set'}`,
      `Headline: ${profile?.headline || 'not set'}`,
      `Skills: ${skills}`,
      `Projects: ${projects}`,
      `Total posts generated: ${posts.length}`,
      `Drafts: ${drafts}`,
      `Planned: ${planned}`,
      `Scheduled: ${scheduled}`,
      `Published: ${published}`,
      `Calendar events: ${Array.isArray(calendar) ? calendar.length : 0}`,
      `Posts:\\n${postList || 'none'}`,
    ].join('\\n')
  }

  const directAnswer = (text: string): string | null => {
    const q = text.toLowerCase().replace(/darft/g, 'draft').replace(/postes/g, 'posts')
    if (q.includes('other user') || q.includes('another user') || q.includes('someone else') || q.includes('different user') || q.includes('other person')) {
      return 'I can only access and discuss information belonging to the currently logged-in user.'
    }
    const posts = getPosts()
    const profile = getProfile()
    const drafts = posts.filter((p) => p.status === 'draft').length
    const scheduled = posts.filter((p) => p.status === 'scheduled').length
    const planned = posts.filter((p) => p.status === 'planned').length
    const published = posts.filter((p) => p.status === 'published').length
    const username = (typeof window !== 'undefined' && localStorage.getItem('linkedin_creator_user')) || profile?.fullName || 'user'
    const calendar = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('linkedin_creator_calendar') || '[]') : []
    if (q.includes('total post') || q.includes('how many post') || q.includes('posts generated')) {
      return `total post generated ${username} is ${posts.length}.`
    }
    if (q.includes('draft')) {
      return `drafts ${username} is ${drafts}.`
    }
    if (q.includes('scheduled')) {
      return `scheduled posts ${username} is ${scheduled}.`
    }
    if (q.includes('planned')) {
      return `planned posts ${username} is ${planned}.`
    }
    if (q.includes('published')) {
      return `published posts ${username} is ${published}.`
    }
    if (q.includes('calendar') || q.includes('event')) {
      return `calendar events ${username} is ${Array.isArray(calendar) ? calendar.length : 0}.`
    }
    if (q.includes('skill')) {
      const skills = profile?.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)).join(', ') || 'none'
      return `Your skills: ${skills}.`
    }
    if (q.includes('project')) {
      const projects = profile?.projects?.map((p: any) => p.name).join(', ') || 'none'
      return `Your projects: ${projects}.`
    }
    if (q.includes('profile') || q.includes('my name') || q.includes('who am i') || q.includes('headline')) {
      if (!profile) return 'No profile saved yet.'
      return `Name: ${profile.fullName || 'not set'}. Headline: ${profile.headline || 'not set'}.`
    }
    if (q.includes('list') && q.includes('post')) {
      if (posts.length === 0) return 'No posts generated yet.'
      return posts.map((p, i) => `${i + 1}. ${p.topic} (${p.status})`).join('\\n')
    }
    if (q.includes('what') && q.includes('post')) {
      if (posts.length === 0) return 'No posts generated yet.'
      return posts.map((p, i) => `${i + 1}. ${p.topic} (${p.status})`).join('\\n')
    }
    // Catch-all for any project-related question: return accurate summary
    const ideaKeywords = ['idea','generate','write','create','suggest','give me','post ideas','content ideas']
    if (ideaKeywords.some((k) => q.includes(k))) {
      return [
        'Here are some LinkedIn post ideas:',
        '1. Share a recent learning or skill you picked up.',
        '2. Post about a project you completed and what you learned.',
        '3. Share a challenge you faced and how you solved it.',
        '4. Write about an internship or work experience.',
        '5. Share a career milestone or achievement.',
        '6. Post a tip or insight for your industry.',
        '7. Share a resource or tool you found useful.',
        '8. Talk about a mistake and what it taught you.',
        '9. Highlight a collaborator or mentor.',
        '10. Share your goals for the next quarter.',
      ].join('\\n')
    }
    const countKeywords = ['how many','count','number of','total']
    if (countKeywords.some((k) => q.includes(k))) {
      const skills = profile?.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)).join(', ') || 'none'
      const projects = profile?.projects?.map((p: any) => p.name).join(', ') || 'none'
      const postLines = posts.length ? posts.map((p, i) => `${i + 1}. ${p.topic} (${p.status})`).join('\\n') : 'none'
      return [
        `Username: ${username}`,
        `Profile: ${profile?.fullName || 'not set'}`,
        `Headline: ${profile?.headline || 'not set'}`,
        `Skills: ${skills}`,
        `Projects: ${projects}`,
        `Total posts: ${posts.length}`,
        `Drafts: ${drafts}`,
        `Planned: ${planned}`,
        `Scheduled: ${scheduled}`,
        `Published: ${published}`,
        `Calendar events: ${Array.isArray(calendar) ? calendar.length : 0}`,
        `Posts:\\n${postLines}`,
      ].join('\\n')
    }
    const projectKeywords = ['post','profile','skill','project','calendar','event','draft','scheduled','planned','published','history','setting','data','info','information','app']
    if (projectKeywords.some((k) => q.includes(k))) {
      const skills = profile?.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)).join(', ') || 'none'
      const projects = profile?.projects?.map((p: any) => p.name).join(', ') || 'none'
      const postLines = posts.length ? posts.map((p, i) => `${i + 1}. ${p.topic} (${p.status})`).join('\\n') : 'none'
      return [
        `Username: ${username}`,
        `Profile: ${profile?.fullName || 'not set'}`,
        `Headline: ${profile?.headline || 'not set'}`,
        `Skills: ${skills}`,
        `Projects: ${projects}`,
        `Total posts: ${posts.length}`,
        `Drafts: ${drafts}`,
        `Planned: ${planned}`,
        `Scheduled: ${scheduled}`,
        `Published: ${published}`,
        `Calendar events: ${Array.isArray(calendar) ? calendar.length : 0}`,
        `Posts:\\n${postLines}`,
      ].join('\\n')
    }
    return null
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    const local = directAnswer(text)
    if (local) {
      setMessages((prev) => [...prev, { role: 'assistant', content: local }])
      setLoading(false)
      return
    }
    try {
      const reply = await sendChatMessage([...messages, userMsg], buildContext())
      const clean = reply.replace(/\*/g, '')
      setMessages((prev) => [...prev, { role: 'assistant', content: clean }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        aria-label="Open AI chatbot"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">LinkedIn AI Assistant</span>
            </div>
            <button
              type="button"
              aria-label="Close chatbot"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
