"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "@/lib/router"
import { db, type Assessment, type Job } from "@/lib/database"
import { AssessmentCard } from "@/components/assessment-card"
import { Plus, Search, ClipboardList } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function AssessmentsPage() {
  const { navigate } = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [assessmentsData, jobsData] = await Promise.all([db.assessments.toArray(), db.jobs.toArray()])
      setAssessments(assessmentsData)
      setJobs(jobsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load assessments data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAssessments = assessments.filter(
    (assessment) =>
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateAssessment = async (assessmentData: Partial<Assessment>) => {
    try {
      const newAssessment: Assessment = {
        id: crypto.randomUUID(),
        jobId: assessmentData.jobId!,
        title: assessmentData.title!,
        description: assessmentData.description!,
        sections: [],
        isPublished: false,
        shareableLink: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.assessments.add(newAssessment)
      await loadData()
      setIsCreateModalOpen(false)
      navigate(`/assessments/${newAssessment.id}`)
      toast({
        title: "Success",
        description: "Assessment created successfully!",
      })
    } catch (error) {
      console.error("Failed to create assessment:", error)
      toast({
        title: "Error",
        description: "Failed to create assessment.",
        variant: "destructive",
      })
    }
  }

  const handlePublishAssessment = async (assessmentId: string) => {
    try {
      await db.assessments.update(assessmentId, { isPublished: true, updatedAt: new Date() })
      await loadData()
      toast({
        title: "Success",
        description: "Assessment published successfully!",
      })
    } catch (error) {
      console.error("Failed to publish assessment:", error)
      toast({
        title: "Error",
        description: "Failed to publish assessment.",
        variant: "destructive",
      })
    }
  }

  const handleShareAssessment = async (assessment: Assessment) => {
    const shareUrl = `${window.location.origin}/assessment/${assessment.shareableLink}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Success",
        description: "Assessment link copied to clipboard!",
      })
    } catch (error) {
      toast({
        title: "Link Ready",
        description: shareUrl,
      })
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      await db.assessments.delete(assessmentId)
      await loadData()
      toast({
        title: "Deleted",
        description: "Assessment deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete assessment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assessment. Please try again.",
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

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assessments</h1>
          <p className="text-muted-foreground">Create and manage candidate assessments</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
            </DialogHeader>
            <AssessmentForm
              jobs={jobs}
              onSubmit={handleCreateAssessment}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm animate-slide-in-right">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Assessments Grid */}
      {filteredAssessments.length === 0 ? (
        <Card className="p-12 text-center bg-card/30 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search to see more results."
                : "Get started by creating your first assessment."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Assessment
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment, index) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              job={jobs.find((j) => j.id === assessment.jobId)}
              onEdit={() => navigate(`/assessments/${assessment.id}`)}
              onPublish={() => handlePublishAssessment(assessment.id)}
              onShare={() => handleShareAssessment(assessment)}
              onDelete={() => handleDeleteAssessment(assessment.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AssessmentForm({
  jobs,
  onSubmit,
  onCancel,
}: {
  jobs: Job[]
  onSubmit: (data: Partial<Assessment>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.description && formData.jobId) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Assessment Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Frontend Developer Skills Assessment"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the assessment"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Job Position</label>
        <select
          value={formData.jobId}
          onChange={(e) => setFormData((prev) => ({ ...prev, jobId: e.target.value }))}
          className="w-full p-2 border border-border rounded-md bg-background"
          required
        >
          <option value="">Select a job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Assessment</Button>
      </div>
    </form>
  )
}
