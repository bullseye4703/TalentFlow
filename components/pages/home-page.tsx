"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/lib/router"
import { db } from "@/lib/database"
import { DataSeeder } from "@/components/data-seeder"
import { Briefcase, Users, ClipboardList, CheckCircle, TrendingUp, Activity } from "lucide-react"

export function HomePage() {
  const { navigate } = useRouter()
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalAssessments: 0,
    publishedAssessments: 0,
    candidatesThisWeek: 0,
    hiredThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // const interval = setInterval(loadStats, 5000) // Refresh every 5 seconds
    // return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading stats from database...")

      const [jobs, candidates, assessments] = await Promise.all([
        db.jobs.toArray(),
        db.candidates.toArray(),
        db.assessments.toArray(),
      ])

      console.log("[v0] Loaded data:", {
        jobs: jobs.length,
        candidates: candidates.length,
        assessments: assessments.length,
      })

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const newStats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        totalCandidates: candidates.length,
        totalAssessments: assessments.length,
        publishedAssessments: assessments.filter((a) => a.isPublished).length,
        candidatesThisWeek: candidates.filter((c) => c.createdAt > oneWeekAgo).length,
        hiredThisMonth: candidates.filter((c) => c.stage === "hired" && c.updatedAt > oneMonthAgo).length,
      }

      setStats(newStats)
      console.log("[v0] Updated stats:", newStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const mainStats = [
    { label: "Active Jobs", value: stats.activeJobs, total: stats.totalJobs, icon: Briefcase, color: "text-chart-1" },
    { label: "Total Candidates", value: stats.totalCandidates, icon: Users, color: "text-chart-2" },
    {
      label: "Published Assessments",
      value: stats.publishedAssessments,
      total: stats.totalAssessments,
      icon: ClipboardList,
      color: "text-chart-3",
    },
    { label: "Hired This Month", value: stats.hiredThisMonth, icon: CheckCircle, color: "text-chart-4" },
  ]

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create and publish a new job opening",
      icon: Briefcase,
      action: () => navigate("/jobs"),
      color: "bg-chart-1/10 hover:bg-chart-1/20 border-chart-1/20",
    },
    {
      title: "Review Candidates",
      description: "Manage candidate applications and stages",
      icon: Users,
      action: () => navigate("/candidates"),
      color: "bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20",
    },
    {
      title: "Create Assessment",
      description: "Build custom assessments for candidates",
      icon: ClipboardList,
      action: () => navigate("/assessments"),
      color: "bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/20",
    },
  ]

  const recentActivity = [
    { action: "New candidate applied", detail: "Sarah Johnson - Senior Frontend Developer", time: "2 hours ago" },
    { action: "Assessment completed", detail: "Mike Wilson scored 87%", time: "4 hours ago" },
    { action: "Job published", detail: "DevOps Engineer position", time: "1 day ago" },
    { action: "Candidate hired", detail: "Alex Chen for Full Stack role", time: "2 days ago" },
    { action: "Assessment created", detail: "Backend Skills Evaluation", time: "3 days ago" },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          TalentFlow
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Premium job candidate assessment platform with industry-level UI and comprehensive recruitment management
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/jobs")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Briefcase className="w-5 h-5 mr-2" />
            Manage Jobs
          </Button>
          <Button
            onClick={() => navigate("/candidates")}
            variant="outline"
            size="lg"
            className="border-primary/20 hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-2" />
            View Candidates
          </Button>
        </div>
      </div>

      {stats.totalJobs === 0 && stats.totalCandidates === 0 && stats.totalAssessments === 0 && (
        <Card className="p-8 mb-8 bg-yellow-500/10 border-yellow-500/20 text-center">
          <h3 className="text-lg font-semibold mb-2 text-yellow-600">No Data Found</h3>
          <p className="text-muted-foreground mb-4">
            The database appears to be empty. Use the "Seed Database" button below to populate it with sample data.
          </p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.total && stat.total !== stat.value && (
                      <p className="text-sm text-muted-foreground">/ {stat.total}</p>
                    )}
                  </div>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right">
          <h3 className="font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            This Week's Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Candidates</span>
              <span className="font-medium">{stats.candidatesThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Jobs</span>
              <span className="font-medium">{stats.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Published Assessments</span>
              <span className="font-medium">{stats.publishedAssessments}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right" style={{ animationDelay: "100ms" }}>
          <h3 className="font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 4).map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className={`p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl border ${action.color} animate-slide-in-right`}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={action.action}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-background/50">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Database Management */}
      <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <DataSeeder />
      </div>
    </div>
  )
}
