"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import type { Assessment, AssessmentResponse, Question } from "@/lib/database"
import { db } from "@/lib/database"
import { CheckCircle, Clock, FileText, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AssessmentRuntimeProps {
  shareableLink: string
}

export function AssessmentRuntime({ shareableLink }: AssessmentRuntimeProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState<{ [questionId: string]: any }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState<{ [questionId: string]: string }>({})

  useEffect(() => {
    loadAssessment()
  }, [shareableLink])

  const loadAssessment = async () => {
    try {
      setLoading(true)
      const assessments = await db.assessments.toArray()
      const assessmentData = assessments.find((a) => a.shareableLink === shareableLink)
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

  const updateResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: "" }))
    }
  }

  const validateSection = (sectionIndex: number) => {
    if (!assessment) return true

    const section = assessment.sections[sectionIndex]
    const newErrors: { [questionId: string]: string } = {}

    section.questions.forEach((question) => {
      if (question.required && !responses[question.id]) {
        newErrors[question.id] = "This field is required"
      } else if (responses[question.id]) {
        // Validate based on question type
        if (question.type === "numeric" && question.validation) {
          const value = Number(responses[question.id])
          if (question.validation.min !== undefined && value < question.validation.min) {
            newErrors[question.id] = `Value must be at least ${question.validation.min}`
          }
          if (question.validation.max !== undefined && value > question.validation.max) {
            newErrors[question.id] = `Value must be at most ${question.validation.max}`
          }
        } else if ((question.type === "short-text" || question.type === "long-text") && question.validation) {
          const value = String(responses[question.id])
          if (question.validation.minLength && value.length < question.validation.minLength) {
            newErrors[question.id] = `Must be at least ${question.validation.minLength} characters`
          }
          if (question.validation.maxLength && value.length > question.validation.maxLength) {
            newErrors[question.id] = `Must be at most ${question.validation.maxLength} characters`
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((prev) => prev + 1)
    }
  }

  const prevSection = () => {
    setCurrentSection((prev) => prev - 1)
  }

  const submitAssessment = async () => {
    if (!assessment || !validateSection(currentSection)) return

    try {
      setIsSubmitting(true)

      const assessmentResponse: AssessmentResponse = {
        id: crypto.randomUUID(),
        assessmentId: assessment.id,
        responses,
        completedAt: new Date(),
        createdAt: new Date(),
      }

      await db.assessmentResponses.add(assessmentResponse)
      setIsCompleted(true)

      toast({
        title: "Success",
        description: "Assessment submitted successfully!",
      })
    } catch (error) {
      console.error("Failed to submit assessment:", error)
      toast({
        title: "Error",
        description: "Failed to submit assessment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <Card className="p-12 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Assessment Not Found</h2>
          <p className="text-muted-foreground">This assessment link is invalid or has been removed.</p>
        </Card>
      </div>
    )
  }

  if (!assessment.isPublished) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-12 text-center max-w-md mx-auto">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">Assessment Not Available</h2>
          <p className="text-muted-foreground">This assessment is not yet published and cannot be taken.</p>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-12 text-center max-w-md mx-auto bg-card/50 backdrop-blur-sm">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-semibold mb-4">Assessment Completed!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the assessment. Your responses have been submitted successfully.
          </p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You will be contacted regarding the next steps in the application process.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0)
  const answeredQuestions = Object.keys(responses).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const currentSectionData = assessment.sections[currentSection]
  const isLastSection = currentSection === assessment.sections.length - 1

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">{assessment.title}</h1>
        <p className="text-muted-foreground mb-6">{assessment.description}</p>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {answeredQuestions} of {totalQuestions} questions
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Current Section */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm animate-slide-in-right">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-primary">
              Section {currentSection + 1} of {assessment.sections.length}
            </span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">{currentSectionData.title}</h2>
          {currentSectionData.description && <p className="text-muted-foreground">{currentSectionData.description}</p>}
        </div>

        <div className="space-y-6">
          {currentSectionData.questions.map((question, index) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              questionNumber={index + 1}
              value={responses[question.id]}
              onChange={(value) => updateResponse(question.id, value)}
              error={errors[question.id]}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={prevSection} disabled={currentSection === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Section {currentSection + 1} of {assessment.sections.length}
          </div>

          {isLastSection ? (
            <Button onClick={submitAssessment} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={nextSection}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function QuestionRenderer({
  question,
  questionNumber,
  value,
  onChange,
  error,
}: {
  question: Question
  questionNumber: number
  value: any
  onChange: (value: any) => void
  error?: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-primary mt-1">{questionNumber}.</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-medium">{question.question}</span>
            {question.required && <span className="text-destructive">*</span>}
          </div>

          {question.type === "single-choice" && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "multi-choice" && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : []
                      if (e.target.checked) {
                        onChange([...currentValues, option])
                      } else {
                        onChange(currentValues.filter((v) => v !== option))
                      }
                    }}
                    className="text-primary"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "short-text" && (
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Your answer..."
              minLength={question.validation?.minLength}
              maxLength={question.validation?.maxLength}
            />
          )}

          {question.type === "long-text" && (
            <Textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Your answer..."
              rows={4}
              minLength={question.validation?.minLength}
              maxLength={question.validation?.maxLength}
            />
          )}

          {question.type === "numeric" && (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter a number..."
              min={question.validation?.min}
              max={question.validation?.max}
            />
          )}

          {question.type === "file-upload" && (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">File upload functionality would be implemented here</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
