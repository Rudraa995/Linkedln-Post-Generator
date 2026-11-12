import type { Metadata } from 'next'
import './globals.css'
import MainLayout from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'LinkedIn Content Creator',
  description: 'AI-Powered LinkedIn Content Creator for professionals, creators, and entrepreneurs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background text-foreground font-sans">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
