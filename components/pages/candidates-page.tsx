"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "@/lib/router"
import { db, type Candidate, type Job, ensureSeeded } from "@/lib/database"
import { CandidateList } from "@/components/candidate-list"
import { CandidateKanban } from "@/components/candidate-kanban"
import { Search, Users, LayoutGrid, List } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function CandidatesPage() {
  const { navigate } = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [jobFilter, setJobFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  useEffect(() => {
    async function seedAndLoad() {
      await ensureSeeded()
      await loadData()
    }
    seedAndLoad()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [candidatesData, jobsData] = await Promise.all([db.candidates.toArray(), db.jobs.toArray()])
      setCandidates(candidatesData)
      setJobs(jobsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load candidates data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = useMemo(() => {
    let filtered = candidates

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (candidate) => candidate.name.toLowerCase().includes(term) || candidate.email.toLowerCase().includes(term),
      )
    }

    if (stageFilter !== "all") {
      filtered = filtered.filter((candidate) => candidate.stage === stageFilter)
    }

    if (jobFilter !== "all") {
      filtered = filtered.filter((candidate) => candidate.jobId === jobFilter)
    }

    return filtered
  }, [candidates, searchTerm, stageFilter, jobFilter])

  const handleStageChange = async (candidateId: string, newStage: Candidate["stage"]) => {
    try {
      const candidate = candidates.find((c) => c.id === candidateId)
      if (!candidate) return

      const updatedCandidate = {
        ...candidate,
        stage: newStage,
        updatedAt: new Date(),
        timeline: [
          ...candidate.timeline,
          {
            id: crypto.randomUUID(),
            type: "stage_change" as const,
            description: `Moved to ${newStage}`,
            createdAt: new Date(),
            metadata: { previousStage: candidate.stage, newStage },
          },
        ],
      }

      await db.candidates.update(candidateId, updatedCandidate)
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updatedCandidate : c)))

      toast({
        title: "Success",
        description: `Candidate moved to ${newStage}`,
      })
    } catch (error) {
      console.error("Failed to update candidate stage:", error)
      toast({
        title: "Error",
        description: "Failed to update candidate stage.",
        variant: "destructive",
      })
    }
  }

  const stages = ["applied", "screening", "interview", "assessment", "offer", "hired", "rejected"] as const
  const stageCounts = stages.reduce(
    (acc, stage) => {
      acc[stage] = filteredCandidates.filter((c) => c.stage === stage).length
      return acc
    },
    {} as Record<string, number>,
  )

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidates</h1>
          <p className="text-muted-foreground">Manage candidate applications and assessments</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="h-8"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {stages.map((stage, index) => (
          <Card
            key={stage}
            className="p-4 bg-card/50 backdrop-blur-sm animate-slide-in-right"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stageCounts[stage]}</div>
              <div className="text-xs text-muted-foreground capitalize">{stage}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage} className="capitalize">
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredCandidates.length} of {candidates.length} candidates
            </span>
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === "list" ? (
        <CandidateList
          candidates={filteredCandidates}
          jobs={jobs}
          onStageChange={handleStageChange}
          onViewCandidate={(candidateId) => navigate(`/candidates/${candidateId}`)}
        />
      ) : (
        <CandidateKanban
          candidates={filteredCandidates}
          jobs={jobs}
          onStageChange={handleStageChange}
          onViewCandidate={(candidateId) => navigate(`/candidates/${candidateId}`)}
        />
      )}
    </div>
  )
}
