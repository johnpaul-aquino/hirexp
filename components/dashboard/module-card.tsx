import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModuleStatus = 'not-started' | 'in-progress' | 'completed' | 'locked'

interface ModuleCardProps {
  icon: LucideIcon
  title: string
  description: string
  progress: number
  status: ModuleStatus
  score?: number
  onClick?: () => void
  className?: string
}

const statusConfig = {
  'not-started': {
    label: 'Not Started',
    variant: 'secondary' as const,
    buttonText: 'Start Module'
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'default' as const,
    buttonText: 'Continue'
  },
  'completed': {
    label: 'Completed',
    variant: 'outline' as const,
    buttonText: 'Review'
  },
  'locked': {
    label: 'Locked',
    variant: 'secondary' as const,
    buttonText: 'Locked'
  }
}

export function ModuleCard({
  icon: Icon,
  title,
  description,
  progress,
  status,
  score,
  onClick,
  className
}: ModuleCardProps) {
  const config = statusConfig[status]
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <Card className={cn(
      "border hover:border-foreground/50 transition-all duration-300 relative overflow-hidden",
      isLocked && "opacity-60",
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-lg",
            isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
          )}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : isLocked ? (
              <Lock className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Icon className="h-6 w-6 text-primary" />
            )}
          </div>
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Score display */}
          {score !== undefined && score > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Score</span>
              <span className="font-bold">{score}%</span>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={onClick}
            disabled={isLocked}
            className="w-full"
            variant={isCompleted ? "outline" : "default"}
          >
            {config.buttonText}
            {!isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
