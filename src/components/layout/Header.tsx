'use client'

import React from 'react'
import { Sun, Moon, Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Header() {
  const [darkMode, setDarkMode] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linkedin_creator_theme')
      if (stored) setDarkMode(stored === 'dark')
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-background bg-background/80 backdrop-blur px-6">
      <button
        onClick={() => {
          // Mobile toggle handled by layout CSS
        }}
        className="-mr-2 p-2 text-muted-foreground hover:text-foreground"
        aria-label="Open main menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="ml-4 flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts, profiles, templates..."
            className="text-sm placeholder:text-muted-foreground focus:outline-none w-64"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button className="hidden sm:flex">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
