import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
  icon: LucideIcon
  title: string
  description: string
  timestamp: string
  iconColor?: string
  className?: string
}

export function ActivityItem({
  icon: Icon,
  title,
  description,
  timestamp,
  iconColor = 'text-primary',
  className
}: ActivityItemProps) {
  return (
    <div className={cn("flex gap-4 pb-4 last:pb-0", className)}>
      <div className={cn("p-2 h-fit rounded-lg bg-primary/10", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  )
}
