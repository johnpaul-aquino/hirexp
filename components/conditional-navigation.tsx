'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'

export function ConditionalNavigation() {
  const pathname = usePathname()

  // Hide navigation on dashboard and profile pages
  const isDashboard = pathname?.startsWith('/dashboard')
  const isProfile = pathname === '/profile'

  if (isDashboard || isProfile) {
    return null
  }

  return <Navigation />
}
