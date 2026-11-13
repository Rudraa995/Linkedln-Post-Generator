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
  <div className="h-full flex flex-col">
   {/* Navigation */}
   <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
    {NAV_ITEMS.map((item) => {
     const isActive = pathname === item.href
     const Icon = item.icon
     return (
      <Link
       key={item.title}
       href={item.href}
       className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium',
        isActive
         ? 'bg-primary text-primary-foreground shadow-sm'
         : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
       )}
      >
       <Icon className="w-[18px] h-[18px] shrink-0" />
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
       localStorage.removeItem('linkedin_creator_auth')
       localStorage.removeItem('linkedin_creator_user')
       window.location.href = '/login'
      }
     }}
    >
     <LogOut className="w-4 h-4 mr-2" />
     Logout
    </Button>
   </div>
  </div>
 )
}