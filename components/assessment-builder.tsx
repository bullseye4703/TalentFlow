"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import type { Assessment, AssessmentSection, Question } from "@/lib/database"
import { db } from "@/lib/database"
import { useRouter } from "@/lib/router"
import { Plus, Trash2, GripVertical, Eye, Save, Share, ArrowLeft, FileText, CheckCircle, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AssessmentBuilderProps {
  assessmentId: string
}

const questionTypes = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
]

export function AssessmentBuilder({ assessmentId }: AssessmentBuilderProps) {
  const { navigate } = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    loadAssessment()
  }, [assessmentId])

  const loadAssessment = async () => {
    try {
      setLoading(true)
      const assessmentData = await db.assessments.get(assessmentId)
      setAssessment(assessmentData || null)
    } catch (error) {
      console.error("Failed to load assessment:", error)
      toast({
        title: "Error",
        description: "Failed to load assessment.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAssessment = async () => {
    if (!assessment) return

    try {
      setSaving(true)
      await db.assessments.update(assessmentId, {
        ...assessment,
        updatedAt: new Date(),
      })
      toast({
        title: "Success",
        description: "Assessment saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save assessment:", error)
      toast({
        title: "Error",
        description: "Failed to save assessment.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    if (!assessment) return

    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      description: "",
      questions: [],
      order: assessment.sections.length,
    }

    setAssessment({
      ...assessment,
      sections: [...assessment.sections, newSection],
    })
  }

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    if (!assessment) return

    setAssessment({
      ...assessment,
      sections: assessment.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    })
  }

  const deleteSection = (sectionId: string) => {
    if (!assessment) return

    setAssessment({
      ...assessment,
      sections: assessment.sections.filter((section) => section.id !== sectionId),
    })
  }

  const addQuestion = (sectionId: string) => {
    if (!assessment) return

    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "single-choice",
      question: "New Question",
      required: false,
      options: ["Option 1", "Option 2"],
      order: section.questions.length,
    }

    updateSection(sectionId, {
      questions: [...section.questions, newQuestion],
    })
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    if (!assessment) return

    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      questions: section.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    })
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (!assessment) return

    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      questions: section.questions.filter((question) => question.id !== questionId),
    })
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      if (!assessment) return

      const oldIndex = assessment.sections.findIndex((section) => section.id === active.id)
      const newIndex = assessment.sections.findIndex((section) => section.id === over.id)

      const newSections = arrayMove(assessment.sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index,
      }))

      setAssessment({
        ...assessment,
        sections: newSections,
      })
    }
  }

  const publishAssessment = async () => {
    if (!assessment) return

    try {
      await db.assessments.update(assessmentId, {
        isPublished: true,
        updatedAt: new Date(),
      })
      setAssessment({ ...assessment, isPublished: true })
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

  const shareAssessment = async () => {
    if (!assessment) return

    const shareUrl = `${window.location.origin}/assessments/${assessment.id}`
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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Assessment Not Found</h2>
          <p className="text-muted-foreground mb-6">The assessment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/assessments")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </Card>
      </div>
    )
  }

  if (previewMode) {
    return (
      <AssessmentPreview
        assessment={assessment}
        onBack={() => setPreviewMode(false)}
        onPublish={publishAssessment}
        onShare={shareAssessment}
      />
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/assessments")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{assessment.title}</h1>
            <p className="text-muted-foreground">{assessment.description}</p>
          </div>
          <Badge variant={assessment.isPublished ? "default" : "secondary"}>
            {assessment.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={saveAssessment} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
          {!assessment.isPublished && (
            <Button onClick={publishAssessment}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
          <Button variant="outline" onClick={shareAssessment}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assessment Builder</h2>
              <Button onClick={addSection} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={assessment.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {assessment.sections.map((section) => (
                    <SectionBuilder
                      key={section.id}
                      section={section}
                      onUpdate={(updates) => updateSection(section.id, updates)}
                      onDelete={() => deleteSection(section.id)}
                      onAddQuestion={() => addQuestion(section.id)}
                      onUpdateQuestion={(questionId, updates) => updateQuestion(section.id, questionId, updates)}
                      onDeleteQuestion={(questionId) => deleteQuestion(section.id, questionId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {assessment.sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No sections yet. Add your first section to get started.</p>
                <Button onClick={addSection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Section
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <AssessmentPreviewPane assessment={assessment} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function SectionBuilder({
  section,
  onUpdate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: {
  section: AssessmentSection
  onUpdate: (updates: Partial<AssessmentSection>) => void
  onDelete: () => void
  onAddQuestion: () => void
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void
  onDeleteQuestion: (questionId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-4 bg-background/50">
      <div className="flex items-center gap-3 mb-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="font-semibold"
          placeholder="Section title"
        />
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Textarea
        value={section.description || ""}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Section description (optional)"
        className="mb-4"
        rows={2}
      />

      <div className="space-y-3 mb-4">
        {section.questions.map((question) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
            onDelete={() => onDeleteQuestion(question.id)}
          />
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={onAddQuestion} className="w-full bg-transparent">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </Card>
  )
}

function QuestionBuilder({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
}) {
  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || []
    onUpdate({ options: newOptions })
  }

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center gap-3 mb-3">
        <Select value={question.type} onValueChange={(value: Question["type"]) => onUpdate({ type: value })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {questionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={question.required} onCheckedChange={(checked) => onUpdate({ required: checked })} />
          <span className="text-sm">Required</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive ml-auto">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Input
        value={question.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="Enter your question"
        className="mb-3"
      />

      {(question.type === "single-choice" || question.type === "multi-choice") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Options:</label>
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}

      {question.type === "numeric" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Min Value</label>
            <Input
              type="number"
              value={question.validation?.min || ""}
              onChange={(e) =>
                onUpdate({
                  validation: { ...question.validation, min: e.target.value ? Number(e.target.value) : undefined },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Value</label>
            <Input
              type="number"
              value={question.validation?.max || ""}
              onChange={(e) =>
                onUpdate({
                  validation: { ...question.validation, max: e.target.value ? Number(e.target.value) : undefined },
                })
              }
            />
          </div>
        </div>
      )}

      {(question.type === "short-text" || question.type === "long-text") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Min Length</label>
            <Input
              type="number"
              value={question.validation?.minLength || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...question.validation,
                    minLength: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Length</label>
            <Input
              type="number"
              value={question.validation?.maxLength || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...question.validation,
                    maxLength: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      )}
    </Card>
  )
}

function AssessmentPreviewPane({ assessment }: { assessment: Assessment }) {
  const [responses, setResponses] = useState<{ [questionId: string]: any }>({})
  const [submitted, setSubmitted] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [unansweredRequired, setUnansweredRequired] = useState<string[]>([])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const missingRequired: string[] = []

    assessment.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const value = responses[question.id]
        const isAnswered =
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        if (question.required && !isAnswered) {
          missingRequired.push(`${section.title} → ${question.question}`)
        }
      })
    })

    if (missingRequired.length > 0) {
      setUnansweredRequired(missingRequired)
      setSubmitted(false)
      return
    }

    // Count answered questions
    let count = 0
    assessment.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const value = responses[question.id]
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          count++
        }
      })
    })

    setAnsweredCount(count)
    setUnansweredRequired([])
    setSubmitted(true)
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto">
      <div className="text-center pb-6 border-b border-border">
        <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
        <p className="text-muted-foreground">{assessment.description}</p>
      </div>

      {assessment.sections.map((section, sectionIndex) => (
        <div key={section.id} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            {section.description && <p className="text-sm text-muted-foreground mb-4">{section.description}</p>}
          </div>

          {section.questions.map((question, questionIndex) => {
            const isMissingRequired = unansweredRequired.includes(`${section.title} → ${question.question}`)
            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg ${
                  isMissingRequired ? "bg-red-100 border border-red-400" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">
                    {sectionIndex + 1}.{questionIndex + 1}
                  </span>
                  <span className="text-sm">{question.question}</span>
                  {question.required && <span className="text-destructive text-sm">*</span>}
                </div>

                {/* Render input based on question type */}
                {question.type === "single-choice" && (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={() => handleResponseChange(question.id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "multi-choice" && (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name={question.id + "-" + index}
                          value={option}
                          checked={Array.isArray(responses[question.id]) && responses[question.id].includes(option)}
                          onChange={(e) => {
                            const prev = Array.isArray(responses[question.id]) ? responses[question.id] : []
                            if (e.target.checked) {
                              handleResponseChange(question.id, [...prev, option])
                            } else {
                              handleResponseChange(question.id, prev.filter((o: string) => o !== option))
                            }
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {(question.type === "short-text" || question.type === "long-text") && (
                  <textarea
                    className="w-full border rounded p-2"
                    rows={question.type === "long-text" ? 4 : 2}
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    placeholder="Enter your answer"
                  />
                )}

                {question.type === "numeric" && (
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    placeholder="Enter a number"
                  />
                )}

                {question.type === "file-upload" && (
                  <input
                    type="file"
                    className="w-full border rounded p-2"
                    onChange={(e) => handleResponseChange(question.id, e.target.files?.[0] || null)}
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}

      {assessment.sections.length === 0 && (
        <div className="text-center text-muted-foreground">No sections in this assessment.</div>
      )}

      {/* Submit Button */}
      <div className="text-center mt-6">
        <Button onClick={handleSubmit}>Submit</Button>
        {submitted && unansweredRequired.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            You answered {answeredCount} out of{" "}
            {assessment.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions.
          </p>
        )}
        {unansweredRequired.length > 0 && (
          <p className="mt-2 text-sm text-destructive">
            Please answer all required questions. Missing: {unansweredRequired.length}
          </p>
        )}
      </div>
    </div>
  )
}


function AssessmentPreview({
  assessment,
  onBack,
  onPublish,
  onShare,
}: {
  assessment: Assessment
  onBack: () => void
  onPublish: () => void
  onShare: () => void
}) {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Builder
        </Button>
        <div className="flex items-center gap-3">
          {!assessment.isPublished && (
            <Button onClick={onPublish}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish Assessment
            </Button>
          )}
          <Button variant="outline" onClick={onShare}>
            <Share className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>
      </div>

      <Card className="p-8 bg-card/50 backdrop-blur-sm">
        <AssessmentPreviewPane assessment={assessment} />
      </Card>
    </div>
  )
}
