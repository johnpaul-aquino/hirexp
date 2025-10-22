'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProfileAvatar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user's profile avatar
    const fetchProfileAvatar = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileAvatar(data.avatar)
        }
      } catch (error) {
        console.error('Error fetching profile avatar:', error)
      }
    }

    if (session?.user) {
      fetchProfileAvatar()
    }
  }, [session])

  if (!session?.user) return null

  const userName = session.user.name || session.user.email || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  // Priority: 1) Profile avatar, 2) Google SSO image, 3) Fallback to initials
  const avatarUrl = profileAvatar || session.user.image || undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src={avatarUrl}
              alt={userName}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/auth/logout')}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
