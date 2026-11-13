import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import MainLayout from '@/components/layout/MainLayout'

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-poppins' })

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
   <body className={`${poppins.variable} h-full bg-background text-foreground font-sans`}>
    <MainLayout>{children}</MainLayout>
   </body>
  </html>
 )
}