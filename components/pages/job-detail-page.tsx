"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "@/lib/router"
import { db, type Job } from "@/lib/database"
import { ArrowLeft, Calendar, Tag, Users, ClipboardList, Edit, Archive, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export function JobDetailPage() {
  const { navigate, params } = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.jobId) {
      loadJob(params.jobId)
    }
  }, [params.jobId])

  const loadJob = async (jobId: string) => {
    try {
      setLoading(true)
      const jobData = await db.jobs.get(jobId)
      setJob(jobData || null)
    } catch (error) {
      console.error("Failed to load job:", error)
      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveJob = async () => {
    if (!job) return

    try {
      const newStatus = job.status === "active" ? "archived" : "active"
      await db.jobs.update(job.id, { status: newStatus, updatedAt: new Date() })
      setJob({ ...job, status: newStatus })
      toast({
        title: "Success",
        description: `Job ${newStatus === "archived" ? "archived" : "restored"} successfully!`,
      })
    } catch (error) {
      console.error("Failed to update job status:", error)
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
          <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <Button variant="ghost" onClick={() => navigate("/jobs")} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">
              {job.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>/{job.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/jobs")}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
          <Button variant="outline" onClick={handleArchiveJob}>
            {job.status === "active" ? (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <Card
              className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Qualifications */}
          {job.qualifications.length > 0 && (
            <Card
              className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right"
              style={{ animationDelay: "200ms" }}
            >
              <h2 className="text-xl font-semibold mb-4">Qualifications</h2>
              <ul className="space-y-3">
                {job.qualifications.map((qualification, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{qualification}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {job.tags.length > 0 && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Candidates</span>
                </div>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Assessments</span>
                </div>
                <span className="font-medium">0</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/candidates")}>
                <Users className="w-4 h-4 mr-2" />
                View Candidates
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => navigate("/assessments")}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
