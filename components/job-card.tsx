"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Job } from "@/lib/database"
import { MoreHorizontal, Eye, Edit, Archive, RotateCcw, GripVertical, Calendar, Tag, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onArchive: (jobId: string, currentStatus: string) => void
  onView: (jobId: string) => void
  onDelete: (jobId: string) => void   // 👈 new prop
  isDragMode: boolean
  style?: React.CSSProperties
}

export function JobCard({ job, onEdit, onArchive, onView, onDelete, isDragMode, style }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    disabled: !isDragMode,
  })

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={{ ...dragStyle, ...style }}
      className={`p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up ${
        isDragMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      } ${isDragging ? "shadow-2xl z-50" : ""}`}
      onClick={() => !isDragMode && onView(job.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Job Info */}
          <div className="flex items-center gap-3 mb-3">
            {isDragMode && (
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold hover:text-primary transition-colors">{job.title}</h3>
                <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">
                  {job.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{job.description}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>/{job.slug}</span>
            </div>
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Responsibilities & Qualifications */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Responsibilities:</span>
              <span className="ml-2 font-medium">{job.responsibilities.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Qualifications:</span>
              <span className="ml-2 font-medium">{job.qualifications.length}</span>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {!isDragMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onView(job.id)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(job)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(job.id, job.status)
                }}
              >
                {job.status === "active" ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Job
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore Job
                  </>
                )}
              </DropdownMenuItem>
              {/* 🚨 Delete Job */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(job.id)
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  )
}
