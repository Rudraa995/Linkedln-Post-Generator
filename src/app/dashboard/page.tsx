'use client'

import { useEffect, useState } from 'react'
import {
 getPosts,
 getProfile,
 getCalendarEvents,
 getSettings,
} from '@/lib/storage'
import { formatDate } from '@/lib/utils'
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from '@/components/ui/card'
import {
 Link as LinkIcon,
 Edit3,
 User,
 Image as ImageIcon,
 Calendar,
 History,
 LayoutDashboard,
 TrendingUp,
 Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatCardProps {
 title: string
 value: string
 change?: string
 icon: React.ElementType
 href?: string
 gradient?: string
}

function StatCard({ title, value, change, icon: Icon, href, gradient }: StatCardProps) {
 return (
  <Card
   onClick={() => href && window.location.assign(href)}
   className="cursor-pointer overflow-hidden relative hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
  >
   <div className={`absolute inset-0 opacity-5 ${gradient ?? 'bg-primary'}`} />
   <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
     <Icon className="h-4 w-4 text-primary" />
    </div>
   </CardHeader>
   <CardContent className="relative">
    <div className="text-2xl font-semibold tracking-tight">{value}</div>
    {change && <p className="text-xs text-muted-foreground mt-1">{change}</p>}
   </CardContent>
  </Card>
 )
}

export default function DashboardPage() {
 const [posts, setPosts] = useState<{ total: number; recent: any[] }>({
  total: 0,
  recent: [],
 })
 const [profile, setProfile] = useState<any>(null)
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
  <div className="space-y-8">
   {/* Welcome Header */}
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
     <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
      Welcome back,{profile ? ` ${profile.fullName.split(' ')[0]}` : ''}
     </h1>
     <p className="text-muted-foreground mt-1">
      Create, edit, and schedule your LinkedIn content with AI.
     </p>
    </div>
    <Button
     className="px-6 py-2.5 text-sm font-semibold shadow-sm"
     onClick={() => {
      if (typeof window !== 'undefined') {
       window.location.assign('/create-post')
      }
     }}
    >
     <Edit3 className="mr-2 h-4 w-4" /> Create New Post
    </Button>
   </div>

   {/* Stats Row */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <StatCard
     title="Total Posts Generated"
     value={String(posts.total)}
     icon={LayoutDashboard}
     gradient="bg-primary"
    />
    <StatCard
     title="Saved Drafts"
     value={String(draftCount)}
     icon={Edit3}
     href="/history"
     gradient="bg-primary"
    />
    <StatCard
     title="Planned Posts"
     value={String(plannedCount)}
     icon={Calendar}
     href="/calendar"
     gradient="bg-primary"
    />
   </div>

   {/* Quick Actions & Recent Posts */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Quick Actions */}
    <div className="lg:col-span-1">
     <Card className="h-full">
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> Quick Actions
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
       {[
        { label: 'Create Post', icon: Edit3, href: '/create-post' },
        { label: 'Manage AI Profile', icon: User, href: '/profile' },
        { label: 'URL to Post', icon: LinkIcon, href: '/url-to-post' },
        { label: 'Generate Image', icon: ImageIcon, href: '/image-studio' },
        { label: 'Content Calendar', icon: Calendar, href: '/calendar' },
       ].map((a) => {
        const Icon = a.icon
        return (
         <Button
          key={a.label}
          variant="outline"
          className="w-full justify-start text-left hover:bg-accent hover:shadow-sm transition-all duration-150"
          onClick={() => window.location.assign(a.href)}
         >
          <Icon className="mr-2 h-4 w-4 text-primary" />
          {a.label}
         </Button>
        )
       })}
      </CardContent>
     </Card>
    </div>

    {/* Recent Posts */}
    <div className="lg:col-span-2">
     <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
       <CardTitle>Recent Generated Posts</CardTitle>
       <a href="/history" className="text-sm text-primary hover:underline">
        View all
       </a>
      </CardHeader>
      <CardContent>
       {posts.recent.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
         <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-40" />
         No posts yet. Create your first LinkedIn post.
        </div>
       ) : (
        <div className="space-y-3">
         {posts.recent.map((post) => (
          <div
           key={post.id}
           className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/40 cursor-pointer transition-all duration-150"
           onClick={() =>
            window.location.assign(`/history?post=${post.id}`)
           }
          >
           <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
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
 const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold '
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