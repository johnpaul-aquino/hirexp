import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalNavigation } from '@/components/conditional-navigation'
import { SessionProvider } from '@/components/providers/session-provider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HireXp - Train Free, Hire Smart',
  description: 'Free AI-powered English training for call center careers. Connect pre-trained talent with hiring companies.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ConditionalNavigation />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}