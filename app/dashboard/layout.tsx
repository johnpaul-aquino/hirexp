import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - HireXp',
  description: 'HireXp Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  )
}
