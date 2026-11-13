'use client'

import React from 'react'
import Link from 'next/link'
import { Sun, Moon, Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Header() {
 const [darkMode, setDarkMode] = React.useState(true)
 const [user, setUser] = React.useState<string | null>(null)

 React.useEffect(() => {
  if (typeof window !== 'undefined') {
   setUser(localStorage.getItem('linkedin_creator_user'))
   const stored = localStorage.getItem('linkedin_creator_theme')
   if (stored) setDarkMode(stored === 'dark')
   else setDarkMode(true)
  }
 }, [])

 React.useEffect(() => {
  if (darkMode) {
   document.documentElement.classList.add('dark')
   localStorage.setItem('linkedin_creator_theme', 'dark')
  } else {
   document.documentElement.classList.remove('dark')
   localStorage.setItem('linkedin_creator_theme', 'light')
  }
 }, [darkMode])

 const toggleTheme = () => setDarkMode((prev) => !prev)

 return (
  <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur px-6">
   {/* Brand */}
   <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
     LA
    </div>
    <span className="font-semibold text-sm tracking-tight">linkedlnAI</span>
   </Link>

   {/* Centered search */}
   <div className="flex flex-1 items-center justify-center">
    <div className="flex items-center gap-2 w-full max-w-[420px] bg-muted rounded-full px-3 h-9">
     <Search className="w-4 h-4 text-muted-foreground shrink-0" />
     <input
      type="search"
      placeholder="Search posts, profiles, templates..."
      className="text-sm placeholder:text-muted-foreground focus:outline-none w-full bg-transparent"
     />
    </div>
   </div>

   {/* Actions */}
   <div className="flex items-center gap-3 shrink-0">
    <Button variant="ghost" size="icon" aria-label="Notifications">
     <Bell className="w-5 h-5" />
    </Button>
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
     {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
    {user && (
     <Link
      href="/profile"
      className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80"
     >
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
       {user.charAt(0).toUpperCase()}
      </div>
      <span>{user}</span>
     </Link>
    )}
   </div>
  </header>
 )
}