'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Edit3,
  User,
  Link as LinkIcon,
  Image,
  Calendar,
  History,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Create Post', href: '/create-post', icon: Edit3 },
  { title: 'AI Profile', href: '/profile', icon: User },
  { title: 'URL to Post', href: '/url-to-post', icon: LinkIcon },
  { title: 'Image Studio', href: '/image-studio', icon: Image },
  { title: 'Content Calendar', href: '/calendar', icon: Calendar },
  { title: 'Post History', href: '/history', icon: History },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-20 h-full w-64 border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            LC
          </div>
          <span className="font-semibold text-sm tracking-tight">LinkedIn Creator</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="w-5 h-5" />
                {item.title}
                {!isActive && <ChevronRight className="ml-auto w-3 h-3 text-muted-foreground" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}
