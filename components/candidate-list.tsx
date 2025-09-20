"use client"

import { useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Candidate, Job } from "@/lib/database"
import { Mail, Phone, Calendar, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CandidateListProps {
  candidates: Candidate[]
  jobs: Job[]
  onStageChange: (candidateId: string, newStage: Candidate["stage"]) => void
  onViewCandidate: (candidateId: string) => void
}

const stageColors = {
  applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  screening: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  interview: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  assessment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  offer: "bg-green-500/10 text-green-500 border-green-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function CandidateList({ candidates, jobs, onStageChange, onViewCandidate }: CandidateListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const jobsMap = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc[job.id] = job
        return acc
      },
      {} as Record<string, Job>,
    )
  }, [jobs])

  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
  })

  if (candidates.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/30 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
        </div>
      </Card>
    )
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const candidate = candidates[virtualItem.index]
          const job = jobsMap[candidate.jobId]

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Card className="p-4 mx-2 mb-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1" onClick={() => onViewCandidate(candidate.id)}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold hover:text-primary transition-colors">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{job?.title || "Unknown Job"}</p>
                      </div>
                      <Badge className={`capitalize ${stageColors[candidate.stage]}`}>{candidate.stage}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {formatDistanceToNow(candidate.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={candidate.stage}
                      onValueChange={(value: Candidate["stage"]) => onStageChange(candidate.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => onViewCandidate(candidate.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
