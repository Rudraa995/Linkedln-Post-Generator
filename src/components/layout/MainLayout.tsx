'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Close sidebar on route change in mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="flex">
        {/* Sidebar - Desktop always visible, Mobile slide-over */}
        <aside
          className={cn(
            'fixed left-0 top-[4rem] z-20 h-full w-64 border-r border-border bg-sidebar text-sidebar-foreground transform transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'sm:relative sm:translate-x-0 sm:static sm:z-auto sm:transform-none',
          )}
        >
          <Sidebar />
          {typeof window !== 'undefined' && window.innerWidth < 1024 && (
            <div className="absolute top-0 right-0 p-2 z-50">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-sidebar-foreground hover:text-sidebar-primary"
                aria-label="Close sidebar"
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          className="flex-1 pt-16 sm:pt-0 pb-8 px-6 sm:px-8 lg:px-12"
          style={{ marginLeft: typeof window !== 'undefined' ? window.innerWidth >= 1024 ? 256 : 0 : 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
