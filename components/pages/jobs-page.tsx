"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "@/lib/router"
import { db, type Job, ensureSeeded } from "@/lib/database"
import { JobForm } from "@/components/job-form"
import { JobCard } from "@/components/job-card"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Plus, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 10

export function JobsPage() {
  const { navigate } = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all")
  const [tagFilter, setTagFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isDragMode, setIsDragMode] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    async function seedAndLoad() {
      await ensureSeeded()
      await loadJobs()
    }
    seedAndLoad()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, statusFilter, tagFilter])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await db.jobs.orderBy("order").toArray()
      setJobs(jobsData)
    } catch (error) {
      console.error("Failed to load jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    if (tagFilter && tagFilter!== "allTags") {
      filtered = filtered.filter((job) => job.tags.includes(tagFilter))
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      const newJob: Job = {
        id: crypto.randomUUID(),
        title: jobData.title!,
        slug: jobData.slug!,
        description: jobData.description!,
        responsibilities: jobData.responsibilities || [],
        qualifications: jobData.qualifications || [],
        status: "active",
        tags: jobData.tags || [],
        salary: jobData.salary || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: jobs.length,
      }

      await db.jobs.add(newJob)
      await loadJobs()
      setIsCreateModalOpen(false)
      toast({
        title: "Success",
        description: "Job created successfully!",
      })
    } catch (error) {
      console.error("Failed to create job:", error)
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditJob = async (jobData: Partial<Job>) => {
    if (!editingJob) return

    try {
      const updatedJob = {
        ...editingJob,
        ...jobData,
        updatedAt: new Date(),
      }

      await db.jobs.update(editingJob.id, updatedJob)
      await loadJobs()
      setEditingJob(null)
      toast({
        title: "Success",
        description: "Job updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update job:", error)
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleArchiveJob = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "archived" : "active"
      await db.jobs.update(jobId, { status: newStatus, updatedAt: new Date() })
      await loadJobs()
      toast({
        title: "Success",
        description: `Job ${newStatus === "archived" ? "archived" : "restored"} successfully!`,
      })
    } catch (error) {
      console.error("Failed to update job status:", error)
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = jobs.findIndex((job) => job.id === active.id)
      const newIndex = jobs.findIndex((job) => job.id === over.id)

      const newJobs = arrayMove(jobs, oldIndex, newIndex)
      setJobs(newJobs)

      try {
        // Update order in database
        const updates = newJobs.map((job, index) => ({
          id: job.id,
          order: index,
          updatedAt: new Date(),
        }))

        await Promise.all(updates.map((update) => db.jobs.update(update.id, update)))

        toast({
          title: "Success",
          description: "Job order updated successfully!",
        })
      } catch (error) {
        console.error("Failed to update job order:", error)
        // Rollback on failure
        await loadJobs()
        toast({
          title: "Error",
          description: "Failed to update job order. Changes reverted.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await db.jobs.delete(jobId)
      await loadJobs()
      toast({
        title: "Deleted",
        description: "Job deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const allTags = Array.from(new Set(jobs.flatMap((job) => job.tags)))
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
          <h1 className="text-3xl font-bold mb-2">Jobs Board</h1>
          <p className="text-muted-foreground">Manage your job postings and openings</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setIsDragMode(!isDragMode)}
            className={isDragMode ? "bg-primary/10 border-primary" : ""}
          >
            {isDragMode ? "Exit Reorder" : "Reorder Jobs"}
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <JobForm onSubmit={handleCreateJob} onCancel={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm animate-slide-in-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTags">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredJobs.length} of {jobs.length} jobs
            </span>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      {isDragMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={jobs.map((job) => job.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={setEditingJob}
                  onArchive={handleArchiveJob}
                  onDelete={handleDeleteJob}
                  onView={(jobId) => navigate(`/jobs/${jobId}`)}
                  isDragMode={isDragMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {paginatedJobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={setEditingJob}
              onArchive={handleArchiveJob}
              onDelete={handleDeleteJob}
              onView={(jobId) => navigate(`/jobs/${jobId}`)}
              isDragMode={false}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isDragMode && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card className="p-12 text-center bg-card/30 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || tagFilter
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first job posting."}
            </p>
            {!searchTerm && statusFilter === "all" && !tagFilter && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Job
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <JobForm initialData={editingJob} onSubmit={handleEditJob} onCancel={() => setEditingJob(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
