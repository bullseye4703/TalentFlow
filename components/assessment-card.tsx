"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Assessment, Job } from "@/lib/database"
import { MoreHorizontal, Edit, Share, Eye, Calendar, FileText, CheckCircle, Clock, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AssessmentCardProps {
  assessment: Assessment
  job?: Job
  onEdit: () => void
  onPublish: () => void
  onShare: () => void
  onDelete: (assessmentId: string) => void   // 👈 new prop
  style?: React.CSSProperties
}

export function AssessmentCard({ assessment, job, onEdit, onPublish, onShare, onDelete, style }: AssessmentCardProps) {
  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0)

  return (
    <Card
      style={style}
      className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
              {assessment.title}
            </h3>
            <Badge variant={assessment.isPublished ? "default" : "secondary"} className="text-xs">
              {assessment.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assessment.description}</p>
          <p className="text-xs text-muted-foreground">{job?.title || "Unknown Job"}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Assessment
            </DropdownMenuItem>
            {!assessment.isPublished && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onPublish()
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onShare()
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Share Link
            </DropdownMenuItem>
            {/* 🚨 Delete Assessment */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(assessment.id)
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Assessment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Sections:</span>
          <span className="font-medium">{assessment.sections.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Questions:</span>
          <span className="font-medium">{totalQuestions}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Created {formatDistanceToNow(assessment.createdAt, { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1">
          {assessment.isPublished ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Live</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>Draft</span>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
