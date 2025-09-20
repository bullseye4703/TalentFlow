"use client"

import React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db, ensureSeeded } from "@/lib/database"
import { RefreshCw, Database, Trash2, Download, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function DataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    assessments: 0,
    responses: 0,
  })

  const loadStats = async () => {
    try {
      console.log("[v0] DataSeeder: Loading stats...")
      const [jobs, candidates, assessments, responses] = await Promise.all([
        db.jobs.count(),
        db.candidates.count(),
        db.assessments.count(),
        db.assessmentResponses.count(),
      ])
      const newStats = { jobs, candidates, assessments, responses }
      setStats(newStats)
      console.log("[v0] DataSeeder: Stats loaded:", newStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const seedDatabase = async () => {
    try {
      setIsSeeding(true)
      console.log("[v0] DataSeeder: Starting manual seed...")

      // Use the database ensureSeeded function directly
      await ensureSeeded()

      console.log("[v0] DataSeeder: Seed completed successfully")
      await loadStats()
      toast({
        title: "Success",
        description: "Database seeded successfully!",
      })
    } catch (error) {
      console.error("Seeding failed:", error)
      toast({
        title: "Error",
        description: "Failed to seed database.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const clearDatabase = async () => {
    try {
      setIsClearing(true)
      console.log("[v0] DataSeeder: Clearing database...")
      await Promise.all([
        db.jobs.clear(),
        db.candidates.clear(),
        db.assessments.clear(),
        db.assessmentResponses.clear(),
      ])
      await loadStats()
      console.log("[v0] DataSeeder: Database cleared")
      toast({
        title: "Success",
        description: "Database cleared successfully!",
      })
    } catch (error) {
      console.error("Clearing failed:", error)
      toast({
        title: "Error",
        description: "Failed to clear database.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const exportData = async () => {
    try {
      const [jobs, candidates, assessments, responses] = await Promise.all([
        db.jobs.toArray(),
        db.candidates.toArray(),
        db.assessments.toArray(),
        db.assessmentResponses.toArray(),
      ])

      const data = { jobs, candidates, assessments, responses }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `talentflow-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Data exported successfully!",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      })
    }
  }

  React.useEffect(() => {
    loadStats()
    // const interval = setInterval(loadStats, 3000)
    // return () => clearInterval(interval)
  }, [])

  const hasData = stats.jobs > 0 && stats.candidates > 0 && stats.assessments > 0
  const hasMinimalData = stats.jobs >= 5 && stats.candidates >= 3 && stats.assessments >= 2

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Database Management</h2>
        {hasMinimalData && (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.jobs}</div>
          <div className="text-sm text-muted-foreground">Jobs</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.candidates}</div>
          <div className="text-sm text-muted-foreground">Candidates</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.assessments}</div>
          <div className="text-sm text-muted-foreground">Assessments</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.responses}</div>
          <div className="text-sm text-muted-foreground">Responses</div>
        </div>
      </div>

      {!hasData && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">No Data Found</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                The database appears to be empty. Click "Seed Database" to add sample data and get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={seedDatabase} disabled={isSeeding} className="bg-primary hover:bg-primary/90">
            <RefreshCw className={`w-4 h-4 mr-2 ${isSeeding ? "animate-spin" : ""}`} />
            {isSeeding ? "Seeding..." : "Seed Database"}
          </Button>
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          {/* <Button variant="destructive" onClick={clearDatabase} disabled={isClearing}>
            <Trash2 className="w-4 h-4 mr-2" />
            {isClearing ? "Clearing..." : "Clear All Data"}
          </Button> */}
        </div>

        <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-2">Preseed Data Includes:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {stats.jobs} realistic job postings</li>
                <li>• {stats.candidates} sample candidates with different stages and assessment scores</li>
                <li>• {stats.assessments} comprehensive assessments with multiple question types</li>
                <li>• Complete timeline events and notes for candidates</li>
                <li>• All data persisted locally in IndexedDB</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Database className="w-3 h-3 mr-1" />
            IndexedDB
          </Badge>
          <Badge variant="outline" className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            MirageJS API
          </Badge>
          <Badge variant="outline" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            8% Error Rate
          </Badge>
        </div>
      </div>
    </Card>
  )
}
