"use client"

import React, { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Candidate, Job } from "@/lib/database"
import { Mail, Phone, Calendar, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface CandidateKanbanProps {
  candidates: Candidate[]
  jobs: Job[]
  onStageChange: (candidateId: string, newStage: Candidate["stage"]) => void
  onViewCandidate: (candidateId: string) => void
}

const stages = [
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "screening", title: "Screening", color: "bg-yellow-500" },
  { id: "interview", title: "Interview", color: "bg-purple-500" },
  { id: "assessment", title: "Assessment", color: "bg-orange-500" },
  { id: "offer", title: "Offer", color: "bg-green-500" },
  { id: "hired", title: "Hired", color: "bg-emerald-500" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
] as const

// ✅ Candidate Card with drag animations
const CandidateCard = React.memo(function CandidateCard({
  candidate,
  job,
  onViewCandidate,
}: {
  candidate: Candidate
  job?: Job
  onViewCandidate: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease, opacity 200ms ease",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-4 mb-3 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transform-gpu"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{job?.title || "Unknown Job"}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{formatDistanceToNow(candidate.createdAt, { addSuffix: true })}</span>
            </div>
          </div>

          {candidate.assessmentScores.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Assessment Score</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(
                    (candidate.assessmentScores.reduce((acc, score) => acc + score.score / score.maxScore, 0) /
                      candidate.assessmentScores.length) *
                      100,
                  )}
                  %
                </Badge>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onViewCandidate(candidate.id)
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})

function DroppableColumn({
  stage,
  candidates,
  jobsMap,
  onViewCandidate,
  index,
}: {
  stage: (typeof stages)[0]
  candidates: Candidate[]
  jobsMap: Record<string, Job>
  onViewCandidate: (id: string) => void
  index: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${stage.id}`,
  })

  return (
    <Card
      ref={setNodeRef}
      className={`p-4 bg-card/30 backdrop-blur-sm animate-fade-in-up transition-all duration-300 transform-gpu ${
        isOver ? "ring-2 ring-primary/50 bg-primary/5 scale-[1.02]" : ""
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${stage.color} transition-all duration-200 ${isOver ? "scale-125" : ""}`}
          />
          <h3 className="font-semibold text-sm">{stage.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {candidates.length}
          </Badge>
        </div>
      </div>

      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <motion.div layout className="space-y-3 min-h-[200px]">
          <AnimatePresence>
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                job={jobsMap[candidate.jobId]}
                onViewCandidate={onViewCandidate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>

      {candidates.length === 0 && (
        <div
          className={`text-center py-8 text-muted-foreground transition-all duration-200 ${isOver ? "text-primary" : ""}`}
        >
          <div className="text-xs">No candidates</div>
          {isOver && <div className="text-xs text-primary mt-1 animate-pulse">Drop here</div>}
        </div>
      )}
    </Card>
  )
}

const customCollisionDetection = (args: any) => {
  const pointerIntersections = pointerWithin(args)
  const intersections = !!pointerIntersections.length ? pointerIntersections : rectIntersection(args)

  const droppableIntersections = intersections.filter((intersection: any) =>
    intersection.id.toString().startsWith("droppable-"),
  )

  if (droppableIntersections.length > 0) {
    return droppableIntersections
  }

  return closestCenter(args)
}

export function CandidateKanban({ candidates, jobs, onStageChange, onViewCandidate }: CandidateKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )
  const [activeId, setActiveId] = useState<string | null>(null)

  const jobsMap = useMemo(
    () =>
      jobs.reduce((acc, job) => {
        acc[job.id] = job
        return acc
      }, {} as Record<string, Job>),
    [jobs],
  )

  const candidatesByStage = useMemo(
    () =>
      stages.reduce((acc, stage) => {
        acc[stage.id] = candidates.filter((candidate) => candidate.stage === stage.id)
        return acc
      }, {} as Record<string, Candidate[]>),
    [candidates],
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const candidateId = active.id
    let newStage: Candidate["stage"]

    if (over.id.toString().startsWith("droppable-")) {
      newStage = over.id.toString().replace("droppable-", "") as Candidate["stage"]
    } else {
      const targetCandidate = candidates.find((c) => c.id === over.id)
      if (!targetCandidate) return
      newStage = targetCandidate.stage
    }

    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate || candidate.stage === newStage) return

    onStageChange(candidateId, newStage) // ✅ Permanent update
  }

  const handleDragCancel = () => setActiveId(null)

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stages.map((stage, index) => (
          <DroppableColumn
            key={stage.id}
            stage={stage}
            candidates={candidatesByStage[stage.id] || []}
            jobsMap={jobsMap}
            onViewCandidate={onViewCandidate}
            index={index}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <motion.div
            initial={{ scale: 0.95, rotate: -2, opacity: 0.8 }}
            animate={{ scale: 1.05, rotate: 2, opacity: 1 }}
            exit={{ scale: 0.95, rotate: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <CandidateCard
              candidate={activeCandidate}
              job={jobsMap[activeCandidate.jobId]}
              onViewCandidate={onViewCandidate}
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
