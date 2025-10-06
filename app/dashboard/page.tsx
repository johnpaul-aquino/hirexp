import Link from 'next/link'
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to HireXp Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your portal to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/trainee">
            <Card className="border-2 hover:border-primary transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Trainee Portal</CardTitle>
                <CardDescription className="text-base">
                  Access your training modules, track progress, and earn your certificate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full group-hover:bg-primary">
                  Go to Trainee Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/company">
            <Card className="border-2 hover:border-primary transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Briefcase className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Company Portal</CardTitle>
                <CardDescription className="text-base">
                  Browse candidates, review performance data, and manage hiring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full group-hover:bg-primary">
                  Go to Company Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
