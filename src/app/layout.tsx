import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import MainLayout from '@/components/layout/MainLayout'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
      <body className={`${inter.variable} h-full bg-background text-foreground`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
