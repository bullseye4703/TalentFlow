"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "@/lib/router"
import { db, type Candidate, type Job, type Note } from "@/lib/database"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Clock,
  User,
  Briefcase,
  Award,
  Plus,
  Send,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "@/hooks/use-toast"

const stageColors = {
  applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  screening: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  interview: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  assessment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  offer: "bg-green-500/10 text-green-500 border-green-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function CandidateDetailPage() {
  const { navigate, params } = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)

  useEffect(() => {
    if (params.candidateId) {
      loadCandidate(params.candidateId)
    }
  }, [params.candidateId])

  const loadCandidate = async (candidateId: string) => {
    try {
      setLoading(true)
      const candidateData = await db.candidates.get(candidateId)
      if (candidateData) {
        setCandidate(candidateData)
        const jobData = await db.jobs.get(candidateData.jobId)
        setJob(jobData || null)
      }
    } catch (error) {
      console.error("Failed to load candidate:", error)
      toast({
        title: "Error",
        description: "Failed to load candidate details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (newStage: Candidate["stage"]) => {
    if (!candidate) return

    try {
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

      await db.candidates.update(candidate.id, updatedCandidate)
      setCandidate(updatedCandidate)

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

  const handleAddNote = async () => {
    if (!candidate || !newNote.trim()) return

    try {
      setIsAddingNote(true)
      const note: Note = {
        id: crypto.randomUUID(),
        content: newNote.trim(),
        mentions: [], // Simple implementation - could parse @mentions
        createdAt: new Date(),
        authorId: "current-user", // In real app, get from auth
      }

      const updatedCandidate = {
        ...candidate,
        notes: [...candidate.notes, note],
        updatedAt: new Date(),
        timeline: [
          ...candidate.timeline,
          {
            id: crypto.randomUUID(),
            type: "note_added" as const,
            description: "Note added",
            createdAt: new Date(),
            metadata: { noteId: note.id },
          },
        ],
      }

      await db.candidates.update(candidate.id, updatedCandidate)
      setCandidate(updatedCandidate)
      setNewNote("")

      toast({
        title: "Success",
        description: "Note added successfully",
      })
    } catch (error) {
      console.error("Failed to add note:", error)
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      })
    } finally {
      setIsAddingNote(false)
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

  if (!candidate) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The candidate you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/candidates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <Button variant="ghost" onClick={() => navigate("/candidates")} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{candidate.name}</h1>
              <p className="text-muted-foreground">{job?.title || "Unknown Job"}</p>
            </div>
            <Badge className={`capitalize ${stageColors[candidate.stage]}`}>{candidate.stage}</Badge>
          </div>
        </div>
        <Select value={candidate.stage} onValueChange={handleStageChange}>
          <SelectTrigger className="w-40">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{candidate.email}</p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{candidate.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Applied</p>
                  <p className="font-medium">{format(candidate.createdAt, "MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">{job?.title || "Unknown"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Assessment Scores */}
          {candidate.assessmentScores.length > 0 && (
            <Card
              className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Assessment Scores
              </h2>
              <div className="space-y-4">
                {candidate.assessmentScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Assessment {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {formatDistanceToNow(score.completedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round((score.score / score.maxScore) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {score.score}/{score.maxScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-slide-in-right" style={{ animationDelay: "200ms" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Notes
            </h2>

            {/* Add Note */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <Textarea
                placeholder="Add a note about this candidate... Use @mentions to reference team members"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote} size="sm">
                <Send className="w-4 h-4 mr-2" />
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {candidate.notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notes yet. Add the first note above.</p>
              ) : (
                candidate.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">You</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h3 className="font-semibold mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </h3>
            <div className="space-y-4">
              {candidate.timeline.length === 0 ? (
                <p className="text-muted-foreground text-sm">No timeline events yet.</p>
              ) : (
                candidate.timeline
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/assessments")}>
                <Plus className="w-4 h-4 mr-2" />
                Send Assessment
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
