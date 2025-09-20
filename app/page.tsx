"use client"

import { Router, Route, useRouter } from "@/lib/router"
import { CircularNavbar } from "@/components/circular-navbar"
import { JobsPage } from "@/components/pages/jobs-page"
import { CandidatesPage } from "@/components/pages/candidates-page"
import { AssessmentsPage } from "@/components/pages/assessments-page"
import { JobDetailPage } from "@/components/pages/job-detail-page"
import { CandidateDetailPage } from "@/components/pages/candidate-detail-page"
import { HomePage } from "@/components/pages/home-page"
import { AssessmentBuilder } from "@/components/assessment-builder"
import { AssessmentRuntime } from "@/components/assessment-runtime"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <CircularNavbar />

        <main className="pt-20">
          <Route path="/" component={HomePage} />
          <Route path="/jobs" component={JobsPage} />
          <Route path="/jobs/:jobId" component={JobDetailPage} />
          <Route path="/candidates" component={CandidatesPage} />
          <Route path="/candidates/:candidateId" component={CandidateDetailPage} />
          <Route path="/assessments" component={AssessmentsPage} />
          <Route path="/assessments/:assessmentId" component={AssessmentBuilderPage} />
          <Route path="/assessment/:shareableLink" component={AssessmentRuntimePage} />
        </main>
      </div>
    </Router>
  )
}

function AssessmentBuilderPage() {
  const { params } = useRouter()
  return <AssessmentBuilder assessmentId={params.assessmentId} />
}

function AssessmentRuntimePage() {
  const { params } = useRouter()
  return <AssessmentRuntime shareableLink={params.shareableLink} />
}
