'use client'

import { useEffect, useState } from 'react'
import {
  getPosts,
  getProfile,
  getCalendarEvents,
  getSettings,
} from '@/lib/storage'
import { formatDate } from '@/lib/utils'
import type { UserProfile } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import SplitText from '@/components/SplitText'
import CountUp from '@/components/CountUp'
import SpotlightCard from '@/components/SpotlightCard'
import AnimatedContent from '@/components/AnimatedContent'
import GradientText from '@/components/GradientText'
import ShinyText from '@/components/ShinyText'
import Magnet from '@/components/Magnet'
import Aurora from '@/components/Aurora'
import {
  Link as LinkIcon,
  Edit3,
  User,
  Image as ImageIcon,
  Calendar,
  History,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatCardProps {
  title: string
  value: string
  change?: string
  icon: React.ElementType
  href?: string
}

function StatCard({ title, value, change, icon: Icon, href }: StatCardProps) {
  return (
    <SpotlightCard
      theme="light"
      onClick={() => href && window.location.assign(href)}
      className="cursor-pointer"
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold">
        <CountUp to={Number(value) || 0} duration={1.2} />
      </div>
      {change && <p className="text-xs text-muted-foreground">{change}</p>}
    </SpotlightCard>
  )
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<{ total: number; recent: any[] }>({
    total: 0,
    recent: [],
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])

  useEffect(() => {
    const allPosts = getPosts()
    setPosts({
      total: allPosts.length,
      recent: allPosts.slice(0, 5),
    })
    setProfile(getProfile())
    setCalendarEvents(getCalendarEvents())
  }, [])

  const plannedCount = calendarEvents.filter(
    (e) => e.status === 'planned' || e.status === 'scheduled',
  ).length
  const draftCount = posts.recent.filter((p) => p.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl p-6">
        <Aurora className="absolute inset-0 -z-10 opacity-40" colorStops={['#0077b5', '#005887', '#eef3f8']} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SplitText
            text={`Welcome back${profile ? `, ${profile.fullName.split(' ')[0]}` : ''}`}
            tag="h1"
            className="text-3xl font-bold tracking-tight"
            effect="wave"
            trigger="load"
          />
          <ShinyText
            text="Create, edit, and schedule your LinkedIn content with AI."
            className="text-muted-foreground"
            speed={3}
          />
        </div>
        <div className="flex items-center gap-3">
          <Magnet>
            <Button
              className="px-6 py-2.5 text-sm font-semibold"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/create-post')
                }
              }}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Create New Post
            </Button>
          </Magnet>
        </div>
      </div>
      </div>

      {/* Stats Row */}
      <AnimatedContent trigger="mount" distance={24}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Posts Generated"
          value={String(posts.total)}
          icon={LayoutDashboard}
        />
        <StatCard
          title="Saved Drafts"
          value={String(draftCount)}
          icon={Edit3}
          href="/history"
        />
        <StatCard
          title="Planned Posts"
          value={String(plannedCount)}
          icon={Calendar}
          href="/calendar"
        />
      </div>
      </AnimatedContent>

      {/* Quick Actions & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                <GradientText colors={['#0077b5', '#005887', '#0077b5']} animationSpeed={4}>
                  Quick Actions
                </GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => window.location.assign('/create-post')}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Create Post
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => window.location.assign('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Manage AI Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => window.location.assign('/url-to-post')}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                URL to Post
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => window.location.assign('/image-studio')}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => window.location.assign('/calendar')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Content Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <GradientText colors={['#0077b5', '#005887', '#0077b5']} animationSpeed={4}>
                  Recent Generated Posts
                </GradientText>
              </CardTitle>
              <a href="/history" className="text-sm text-primary hover:underline">
                View all
              </a>
            </CardHeader>
            <CardContent>
              {posts.recent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet. Create your first LinkedIn post.
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.recent.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() =>
                        window.location.assign(`/history?post=${post.id}`)
                      }
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <History className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {post.topic}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.content.slice(0, 100)}...
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <BadgeVariant variantProp="secondary" className="text-xs">
                            {post.postType}
                          </BadgeVariant>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BadgeVariant({ className, children, variantProp }: { className?: string; children: React.ReactNode; variantProp?: string }) {
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors'
  const variants: Record<string, string> = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground border-input',
  }
  return (
    <span className={`${base} ${variants[variantProp || 'default']} ${className ?? ''}`}>
      {children}
    </span>
  )
}
