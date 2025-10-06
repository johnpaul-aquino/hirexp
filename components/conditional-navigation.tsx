'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'

export function ConditionalNavigation() {
  const pathname = usePathname()

  // Hide navigation on dashboard pages
  const isDashboard = pathname?.startsWith('/dashboard')

  if (isDashboard) {
    return null
  }

  return <Navigation />
}
