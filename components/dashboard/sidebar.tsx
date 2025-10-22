'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  MessageSquare,
  Video,
  Keyboard,
  Phone,
  Award,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Lock,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  type: 'trainee' | 'company' | 'admin'
}

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

// Icon mapping for navigation keys
const iconMap: Record<string, LucideIcon> = {
  dashboard: Home,
  assessments: BookOpen,
  chat: MessageSquare,
  interview: Video,
  typing: Keyboard,
  'mock-call': Phone,
  certificate: Award,
}

// Default navigation items (fallback if API fails)
const defaultTraineeNavItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/trainee' },
  { icon: MessageSquare, label: 'AI Chat', href: '/dashboard/trainee/chat' },
  { icon: Phone, label: 'Mock Call', href: '/dashboard/trainee/mock-call' },
]

const companyNavItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/company' },
  { icon: Users, label: 'Candidate Pool', href: '/dashboard/company/candidates' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/company/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/company/settings' },
]

const adminNavItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
  { icon: Shield, label: 'Roles', href: '/dashboard/admin/roles' },
  { icon: Lock, label: 'Permissions', href: '/dashboard/admin/permissions' },
  { icon: Settings, label: 'Settings', href: '/dashboard/admin/settings' },
]

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [traineeNavItems, setTraineeNavItems] = useState<NavItem[]>(defaultTraineeNavItems)
  const [isLoadingNav, setIsLoadingNav] = useState(type === 'trainee')

  // Fetch navigation items for trainee role
  useEffect(() => {
    if (type === 'trainee') {
      fetchNavigationItems()
    }
  }, [type])

  const fetchNavigationItems = async () => {
    try {
      setIsLoadingNav(true)
      const response = await fetch('/api/navigation')

      if (response.ok) {
        const data = await response.json()

        // Map API response to NavItem format
        const mappedItems: NavItem[] = data.navigationItems.map((item: any) => ({
          icon: iconMap[item.navigationKey] || Home,
          label: item.label,
          href: item.href,
        }))

        setTraineeNavItems(mappedItems)
      } else {
        // Use default items on error
        console.error('Failed to fetch navigation items, using defaults')
        setTraineeNavItems(defaultTraineeNavItems)
      }
    } catch (error) {
      console.error('Error fetching navigation items:', error)
      // Use default items on error
      setTraineeNavItems(defaultTraineeNavItems)
    } finally {
      setIsLoadingNav(false)
    }
  }

  const navItems = type === 'trainee'
    ? traineeNavItems
    : type === 'company'
    ? companyNavItems
    : adminNavItems

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-24 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background border-r z-40 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold">HireXp</div>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {type === 'trainee' ? 'Trainee Portal' : type === 'company' ? 'Company Portal' : 'Admin Portal'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={cn("h-5 w-5 relative z-10")} />
                    <span className="relative z-10 text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
