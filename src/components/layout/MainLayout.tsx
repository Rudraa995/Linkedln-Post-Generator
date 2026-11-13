'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname()
 const router = useRouter()
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const [isMobile, setIsMobile] = useState(false)
 const [authChecked, setAuthChecked] = useState(false)

 const isLogin = pathname === '/login'

 useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 1024)
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
 }, [])

 useEffect(() => {
  if (isLogin) {
   setAuthChecked(true)
   return
  }
  const auth = typeof window !== 'undefined' ? localStorage.getItem('linkedin_creator_auth') : null
  if (auth !== 'true') {
   router.replace('/login')
  } else {
   setAuthChecked(true)
  }
 }, [isLogin, pathname, router])

 if (isLogin) {
  return <>{children}</>
 }

 if (!authChecked) {
  return null
 }

 return (
  <div className="min-h-screen bg-background text-foreground">
   <Header />

   <div className="flex">
    <aside
     className={cn(
      'fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-\[232px\] transform transition-transform duration-300 overflow-y-auto',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'sm:static sm:translate-x-0 sm:transform-none',
     )}
    >
     <Sidebar />
    </aside>

    {isMobile && sidebarOpen && (
     <div
      className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
      onClick={() => setSidebarOpen(false)}
     />
    )}

    <main className="flex-1 min-w-0 px-6 py-6 max-w-[1200px] mx-auto w-full">
     {children}
    </main>
   </div>

   {isMobile && !sidebarOpen && (
    <button
     onClick={() => setSidebarOpen(true)}
     className="fixed left-2 top-20 z-30 h-9 w-9 flex items-center justify-center rounded-md border border-border bg-background shadow-sm text-muted-foreground"
     aria-label="Open sidebar"
    >
     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
     </svg>
    </button>
   )}
  </div>
 )
}