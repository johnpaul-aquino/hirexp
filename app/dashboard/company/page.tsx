'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, UserCheck, Search, Filter } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { CandidateCard } from '@/components/dashboard/candidate-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockCompanyData, mockCandidates } from '@/lib/mock-data'
import { BlurFade } from '@/components/ui/blur-fade'
import { NumberTicker } from '@/components/ui/number-ticker'

export default function CompanyDashboard() {
  const { company, stats, recentHires } = mockCompanyData
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  // Filter candidates based on search and filters
  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || candidate.englishLevel.toLowerCase() === levelFilter.toLowerCase()
    const matchesAvailability = availabilityFilter === 'all' ||
                               (availabilityFilter === 'available' && candidate.available) ||
                               (availabilityFilter === 'hired' && !candidate.available)

    return matchesSearch && matchesLevel && matchesAvailability
  })

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {company.name} Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Access pre-trained candidates and track your hiring metrics
              </p>
            </div>
            <Badge className="text-base px-4 py-2" variant="outline">
              Partner Since {new Date(company.partnerSince).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </Badge>
          </div>
        </BlurFade>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BlurFade delay={0.2}>
            <StatCard
              title="Total Candidates"
              value={<NumberTicker value={stats.totalCandidates} />}
              icon={Users}
              description={`${stats.newThisWeek} new this week`}
            />
          </BlurFade>
          <BlurFade delay={0.25}>
            <StatCard
              title="Candidates Hired"
              value={<NumberTicker value={stats.candidatesHired} />}
              icon={UserCheck}
              trend={{ value: 15, isPositive: true }}
            />
          </BlurFade>
          <BlurFade delay={0.3}>
            <StatCard
              title="Training Cost Savings"
              value={`$${(stats.trainingCostSavings / 1000).toFixed(0)}K`}
              icon={DollarSign}
              description="Since partnership"
            />
          </BlurFade>
          <BlurFade delay={0.35}>
            <StatCard
              title="Avg. Candidate Score"
              value={<><NumberTicker value={stats.averageCandidateScore} />%</>}
              icon={TrendingUp}
              trend={{ value: 3, isPositive: true }}
            />
          </BlurFade>
        </div>

        {/* Filters and Search */}
        <BlurFade delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pool</CardTitle>
              <CardDescription>
                Browse and filter available candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="English Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Candidates</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCandidates.length} of {mockCandidates.length} candidates
                </p>
              </div>

              {/* Candidates Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCandidates.map((candidate, index) => (
                  <BlurFade key={candidate.id} delay={0.5 + index * 0.05}>
                    <CandidateCard
                      {...candidate}
                      onViewProfile={() => console.log('View profile', candidate.id)}
                    />
                  </BlurFade>
                ))}
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No candidates match your filters</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('')
                      setLevelFilter('all')
                      setAvailabilityFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Recent Hires */}
        <BlurFade delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Hires</CardTitle>
              <CardDescription>
                Latest candidates hired from our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHires.map((hire, index) => (
                  <div
                    key={hire.candidateId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-foreground/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{hire.candidateId}</p>
                        <p className="text-sm text-muted-foreground">{hire.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={hire.performance === 'Excellent' ? 'default' : 'secondary'}>
                        {hire.performance}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(hire.hiredDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Analytics Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          <BlurFade delay={0.7}>
            <Card>
              <CardHeader>
                <CardTitle>Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                    const count = mockCandidates.filter(c => c.englishLevel === level).length
                    const percentage = Math.round((count / mockCandidates.length) * 100)
                    return (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{level}</span>
                          <span className="font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.75}>
            <Card>
              <CardHeader>
                <CardTitle>Availability Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Available', value: mockCandidates.filter(c => c.available).length },
                    { label: 'Hired', value: mockCandidates.filter(c => !c.available).length },
                  ].map(item => {
                    const percentage = Math.round((item.value / mockCandidates.length) * 100)
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-semibold">{item.value} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              item.label === 'Available' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.8}>
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCandidates
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .slice(0, 3)
                    .map((candidate, index) => (
                      <div key={candidate.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{candidate.name}</span>
                        </div>
                        <span className="text-sm font-bold">{candidate.overallScore}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </div>
  )
}
