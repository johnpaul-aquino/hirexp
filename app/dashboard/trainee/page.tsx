'use client'

import { motion } from 'framer-motion'
import { BookOpen, MessageSquare, Video, Keyboard, Phone, Trophy, Clock, Target, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ModuleCard } from '@/components/dashboard/module-card'
import { ProgressRing } from '@/components/dashboard/progress-ring'
import { ActivityItem } from '@/components/dashboard/activity-item'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockTraineeData } from '@/lib/mock-data'
import { BlurFade } from '@/components/ui/blur-fade'
import { NumberTicker } from '@/components/ui/number-ticker'

const moduleIcons = {
  assessments: BookOpen,
  chat: MessageSquare,
  interview: Video,
  typing: Keyboard,
  'mock-call': Phone,
}

const activityIcons = {
  chat: MessageSquare,
  interview: Video,
  assessment: BookOpen,
}

export default function TraineeDashboard() {
  const { user, stats, modules, recentActivity, strengths, improvements, recommendations } = mockTraineeData

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your progress and continue your journey to becoming job-ready
              </p>
            </div>
            <Badge className="text-base px-4 py-2" variant="default">
              {user.level} Level
            </Badge>
          </div>
        </BlurFade>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BlurFade delay={0.2}>
            <StatCard
              title="Overall Progress"
              value={<NumberTicker value={stats.overallProgress} />}
              icon={Target}
              description={`${stats.modulesCompleted}/${stats.totalModules} modules completed`}
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <StatCard
              title="Overall Score"
              value={<NumberTicker value={stats.overallScore} />}
              icon={Trophy}
              trend={{ value: 5, isPositive: true }}
            />
          </BlurFade>
          <BlurFade delay={0.3}>
            <StatCard
              title="Time Spent"
              value={`${stats.timeSpent}h`}
              icon={Clock}
              description="This month"
            />
          </BlurFade>
          <BlurFade delay={0.35}>
            <StatCard
              title="Streak"
              value={<><NumberTicker value={stats.streakDays} /> days</>}
              icon={Zap}
              description="Keep it going!"
            />
          </BlurFade>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <BlurFade delay={0.4} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Overall completion status
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ProgressRing
                  progress={stats.overallProgress}
                  size={160}
                  strokeWidth={12}
                />
                <div className="mt-6 space-y-2 w-full">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modules Completed</span>
                    <span className="font-semibold">{stats.modulesCompleted}/{stats.totalModules}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-semibold">{stats.overallScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time Investment</span>
                    <span className="font-semibold">{stats.timeSpent} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Strengths & Improvements */}
          <BlurFade delay={0.45} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  AI-identified strengths and areas for growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-600 mt-0.5">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
                    <ul className="space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Training Modules */}
        <div>
          <BlurFade delay={0.5}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Training Modules</h2>
              <p className="text-muted-foreground">
                Complete all 5 modules to earn your certificate
              </p>
            </div>
          </BlurFade>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => {
              const Icon = moduleIcons[module.id as keyof typeof moduleIcons]
              return (
                <BlurFade key={module.id} delay={0.55 + index * 0.05}>
                  <ModuleCard
                    icon={Icon}
                    title={module.title}
                    description={module.description}
                    progress={module.progress}
                    status={module.status}
                    score={module.score}
                    onClick={() => console.log(`Navigate to ${module.id}`)}
                  />
                </BlurFade>
              )
            })}
          </div>
        </div>

        {/* Recent Activity & Certificate Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <BlurFade delay={0.8} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest learning sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activityIcons[activity.type as keyof typeof activityIcons]
                    return (
                      <ActivityItem
                        key={activity.id}
                        icon={Icon}
                        title={activity.title}
                        description={activity.description}
                        timestamp={activity.timestamp}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.85}>
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Certificate Progress</CardTitle>
                <CardDescription>
                  Complete all modules to earn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.modulesCompleted}/{stats.totalModules}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Modules Completed
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.totalModules - stats.modulesCompleted === 0 ? (
                      <p className="text-green-600 font-semibold">
                        Congratulations! Certificate ready!
                      </p>
                    ) : (
                      <p>
                        Complete {stats.totalModules - stats.modulesCompleted} more {stats.totalModules - stats.modulesCompleted === 1 ? 'module' : 'modules'} to unlock
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    disabled={stats.modulesCompleted !== stats.totalModules}
                  >
                    View Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </div>
  )
}
