import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthFormCard({ title, description, children, footer }: AuthFormCardProps) {
  return (
    <Card className="border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>}
    </Card>
  )
}
