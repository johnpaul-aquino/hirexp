import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CandidateCardProps {
  id: string
  name: string
  englishLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  overallScore: number
  modulesCompleted: number
  totalModules: number
  typingSpeed: number
  interviewRating: number
  available: boolean
  onViewProfile?: () => void
  className?: string
}

export function CandidateCard({
  id,
  name,
  englishLevel,
  overallScore,
  modulesCompleted,
  totalModules,
  typingSpeed,
  interviewRating,
  available,
  onViewProfile,
  className
}: CandidateCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'Intermediate':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'Advanced':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <Card className={cn("border hover:border-foreground/50 transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-bold">
                {id.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">ID: {id}</p>
            </div>
          </div>
          <Badge className={getLevelColor(englishLevel)} variant="secondary">
            {englishLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className="text-2xl font-bold">{overallScore}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Modules</p>
            <p className="text-2xl font-bold">{modulesCompleted}/{totalModules}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Typing Speed</p>
            <p className="text-lg font-semibold">{typingSpeed} WPM</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interview</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < interviewRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "Available" : "Hired"}
          </Badge>
          <Button onClick={onViewProfile} variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
