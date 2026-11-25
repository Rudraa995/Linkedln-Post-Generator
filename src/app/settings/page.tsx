'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Brain, Linkedin, Image as ImageIcon, Calendar, Bell, Shield, UserCircle,
  Plus, Trash2, Save, LogOut, AlertTriangle, Upload, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ProfileForm from '@/components/profile/ProfileForm'
import { getProfile, clearAllData } from '@/lib/storage'
import { generateId } from '@/lib/utils'

type SettingsTab =
  | 'profile'
  | 'ai'
  | 'linkedin'
  | 'image'
  | 'calendar'
  | 'notifications'
  | 'privacy'
  | 'account'

const TABS: { key: SettingsTab; label: string; icon: any }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'ai', label: 'AI Preferences', icon: Brain },
  { key: 'linkedin', label: 'LinkedIn Preferences', icon: Linkedin },
  { key: 'image', label: 'Image Preferences', icon: ImageIcon },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy & Data', icon: Shield },
  { key: 'account', label: 'Account', icon: UserCircle },
]

const DEFAULT_SETTINGS: any = {
  aiTone: 'professional',
  aiLength: 'medium',
  aiLanguage: 'english',
  aiHashtags: true,
  aiEmojis: true,
  preferredHashtags: [],
  linkedinUrl: '',
  topics: [],
  audience: 'general-audience',
  contentStyle: 'professional',
  imageStyle: 'professional-banner',
  logo: '',
  includeTextOnImage: true,
  imageFormat: 'landscape',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  postingDays: ['monday', 'wednesday', 'friday'],
  defaultPostingTime: '10:00',
  notifications: {
    postGeneration: true,
    imageGeneration: true,
    calendarReminder: true,
    scheduledReminder: true,
    productUpdates: false,
  },
  savePosts: true,
  saveImages: true,
  saveHistory: true,
}

function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = localStorage.getItem('linkedin_creator_settings')
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveSettings(s: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('linkedin_creator_settings', JSON.stringify({ ...s, updatedAt: new Date().toISOString() }))
}

const TOPIC_OPTIONS = ['AI / ML', 'Python', 'Web Development', 'GenAI', 'Data Science', 'Career', 'Technology']
const AUDIENCE_OPTIONS = ['recruiters', 'developers', 'students', 'entrepreneurs', 'general-audience', 'custom']
const CONTENT_STYLES = ['educational', 'personal', 'technical', 'storytelling', 'professional', 'showcase']
const IMAGE_STYLES = ['professional-banner', 'technology-illustration', 'minimalist-design', 'business-graphic', 'creative-illustration']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function SettingsPage() {
  const router = useRouter()
  const [active, setActive] = useState<SettingsTab>('profile')
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS)
  const [savedMsg, setSavedMsg] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    setLogoPreview(s.logo || '')
  }, [])

  const update = (patch: any) => {
    setSettings((prev: any) => ({ ...prev, ...patch }))
  }

  const handleSave = () => {
    saveSettings(settings)
    setSavedMsg('Settings saved successfully.')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const toggleDay = (day: string) => {
    const days = settings.postingDays || []
    if (days.includes(day)) update({ postingDays: days.filter((d: string) => d !== day) })
    else update({ postingDays: [...days, day] })
  }

  const toggleTopic = (t: string) => {
    const topics = settings.topics || []
    if (topics.includes(t)) update({ topics: topics.filter((x: string) => x !== t) })
    else update({ topics: [...topics, t] })
  }

  const addHashtag = () => {
    const v = hashtagInput.trim().replace(/^#/, '')
    if (!v) return
    if (!(settings.preferredHashtags || []).includes(v)) {
      update({ preferredHashtags: [...(settings.preferredHashtags || []), v] })
    }
    setHashtagInput('')
  }

  const removeHashtag = (h: string) => {
    update({ preferredHashtags: (settings.preferredHashtags || []).filter((x: string) => x !== h) })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      setLogoPreview(data)
      update({ logo: data })
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('linkedin_creator_auth')
      localStorage.removeItem('linkedin_creator_user')
    }
    router.push('/login')
  }

  const handleClearHistory = () => {
    if (!window.confirm('Are you sure you want to clear all generated content history? This cannot be undone.')) return
    clearAllData()
    alert('Content history cleared.')
  }

  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure you want to delete your account and all associated data? This action cannot be undone.')) return
    if (!window.confirm('This will permanently delete your account. Continue?')) return
    clearAllData()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('linkedin_creator_auth')
      localStorage.removeItem('linkedin_creator_user')
    }
    router.push('/login')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Settings Nav */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="flex flex-col gap-1">
              {TABS.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      active === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="md:col-span-3 space-y-4">
          {savedMsg && (
            <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
              {savedMsg}
            </div>
          )}

          {active === 'profile' && (
            <div className="space-y-4">
              <ProfileForm />
            </div>
          )}

          {active === 'ai' && (
            <Card>
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
                <CardDescription>These preferences help AI generate posts according to your preferred writing style.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tone</label>
                    <select value={settings.aiTone} onChange={(e) => update({ aiTone: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {['professional', 'friendly', 'casual', 'storytelling', 'educational', 'technical', 'humorous', 'conversational'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Post Length</label>
                    <select value={settings.aiLength} onChange={(e) => update({ aiLength: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Language</label>
                    <select value={settings.aiLanguage} onChange={(e) => update({ aiLanguage: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="gujarati">Gujarati</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.aiHashtags} onChange={(e) => update({ aiHashtags: e.target.checked })} className="rounded border-input" />
                    <span className="text-sm">Include hashtags</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.aiEmojis} onChange={(e) => update({ aiEmojis: e.target.checked })} className="rounded border-input" />
                    <span className="text-sm">Include emojis</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Hashtags</label>
                  <div className="flex gap-2">
                    <Input value={hashtagInput} onChange={(e) => setHashtagInput(e.target.value)} placeholder="Add hashtag" className="flex-1" />
                    <Button type="button" size="sm" onClick={addHashtag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(settings.preferredHashtags || []).map((h: string) => (
                      <Badge key={h} variant="outline" className="flex items-center gap-1">
                        #{h}
                        <button onClick={() => removeHashtag(h)} className="ml-1"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'linkedin' && (
            <Card>
              <CardHeader>
                <CardTitle>LinkedIn Preferences</CardTitle>
                <CardDescription>These preferences help AI generate LinkedIn content tailored to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">LinkedIn Profile URL</label>
                  <Input value={settings.linkedinUrl} onChange={(e) => update({ linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTopic(t)}
                        className={`px-3 py-1 rounded-full text-xs border ${settings.topics.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input value={topicInput} onChange={(e) => setTopicInput(e.target.value)} placeholder="Add custom topic" className="flex-1" />
                    <Button type="button" size="sm" onClick={() => {
                      if (topicInput.trim() && !settings.topics.includes(topicInput.trim())) {
                        update({ topics: [...settings.topics, topicInput.trim()] })
                      }
                      setTopicInput('')
                    }}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.topics.filter((t: string) => !TOPIC_OPTIONS.includes(t)).map((t: string) => (
                      <Badge key={t} variant="outline" className="flex items-center gap-1">
                        {t}
                        <button onClick={() => toggleTopic(t)}><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Audience</label>
                    <select value={settings.audience} onChange={(e) => update({ audience: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Content Style</label>
                    <select value={settings.contentStyle} onChange={(e) => update({ contentStyle: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {CONTENT_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'image' && (
            <Card>
              <CardHeader>
                <CardTitle>Image Preferences</CardTitle>
                <CardDescription>These preferences help AI create visuals that match your preferred LinkedIn style.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image Style</label>
                  <select value={settings.imageStyle} onChange={(e) => update({ imageStyle: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {IMAGE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Brand / Logo</label>
                  <div className="flex items-center gap-3">
                    {logoPreview && <img src={logoPreview} alt="logo" className="w-16 h-16 object-contain border rounded" />}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-accent">
                      <Upload className="w-4 h-4" /> Upload Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {logoPreview && (
                      <Button variant="outline" size="sm" onClick={() => { setLogoPreview(''); update({ logo: '' }) }}>Remove</Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.includeTextOnImage} onChange={(e) => update({ includeTextOnImage: e.target.checked })} className="rounded border-input" />
                    <span className="text-sm">Include text on image</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image Format / Ratio</label>
                  <select value={settings.imageFormat} onChange={(e) => update({ imageFormat: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="landscape">Landscape (1200x627)</option>
                    <option value="square">Square (1080x1080)</option>
                    <option value="portrait">Portrait (1080x1350)</option>
                  </select>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar Settings</CardTitle>
                <CardDescription>Configure your posting schedule preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time Zone</label>
                  <select value={settings.timeZone} onChange={(e) => update({ timeZone: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {Intl.supportedValuesOf('timeZone').map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Posting Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1 rounded-full text-xs border capitalize ${settings.postingDays.includes(d) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Default Posting Time</label>
                  <Input type="time" value={settings.defaultPostingTime} onChange={(e) => update({ defaultPostingTime: e.target.value })} />
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'postGeneration', label: 'Post generation completed', desc: 'Notify me when my LinkedIn post has finished generating.' },
                  { key: 'imageGeneration', label: 'Image generation completed', desc: 'Notify me when an image has finished generating.' },
                  { key: 'calendarReminder', label: 'Content calendar reminder', desc: 'Remind me about upcoming scheduled posts.' },
                  { key: 'scheduledReminder', label: 'Scheduled post reminder', desc: 'Notify me before a scheduled post is published.' },
                  { key: 'productUpdates', label: 'Product / feature updates', desc: 'Receive updates about new features.' },
                ].map((n) => (
                  <div key={n.key} className="flex items-start justify-between gap-4 p-3 rounded-md border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications[n.key]}
                      onChange={(e) => update({ notifications: { ...settings.notifications, [n.key]: e.target.checked } })}
                      className="mt-1"
                    />
                  </div>
                ))}
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>Control how your data is stored.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.savePosts} onChange={(e) => update({ savePosts: e.target.checked })} className="rounded border-input" />
                  <span className="text-sm">Save generated posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.saveImages} onChange={(e) => update({ saveImages: e.target.checked })} className="rounded border-input" />
                  <span className="text-sm">Save generated images</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.saveHistory} onChange={(e) => update({ saveHistory: e.target.checked })} className="rounded border-input" />
                  <span className="text-sm">Save post history</span>
                </label>
                <div className="pt-4">
                  <Button variant="destructive" onClick={handleClearHistory}>Clear Generated Content History</Button>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input value={typeof window !== 'undefined' ? (localStorage.getItem('linkedin_creator_user') || '') : ''} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Change Password</label>
                  <Input type="password" placeholder="New password" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
