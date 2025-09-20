import { createServer, Model, Response } from "miragejs"
import { db, ensureSeeded } from "./database"

// Artificial latency and error simulation
const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 200))
const simulateError = () => Math.random() < 0.08 // 8% error rate

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
      assessmentResponse: Model,
    },

    routes() {
      this.namespace = "api"

      // Jobs endpoints
      this.get("/jobs", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Server error" })

        await ensureSeeded() // Ensure data is seeded before fetching
        const jobs = await db.jobs.orderBy("order").toArray()
        return { jobs }
      })

      this.post("/jobs", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to create job" })

        const attrs = JSON.parse(request.requestBody)
        const job = await db.jobs.add({
          ...attrs,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        return { job }
      })

      this.put("/jobs/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to update job" })

        const attrs = JSON.parse(request.requestBody)
        await db.jobs.update(request.params.id, { ...attrs, updatedAt: new Date() })
        const job = await db.jobs.get(request.params.id)
        return { job }
      })

      this.delete("/jobs/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to delete job" })

        await db.jobs.delete(request.params.id)
        return new Response(204)
      })

      // Candidates endpoints
      this.get("/candidates", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Server error" })

        await ensureSeeded() // Ensure data is seeded before fetching
        const candidates = await db.candidates.toArray()
        return { candidates }
      })

      this.put("/candidates/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to update candidate" })

        const attrs = JSON.parse(request.requestBody)
        await db.candidates.update(request.params.id, { ...attrs, updatedAt: new Date() })
        const candidate = await db.candidates.get(request.params.id)
        return { candidate }
      })

      // Assessments endpoints
      this.get("/assessments", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Server error" })

        await ensureSeeded() // Ensure data is seeded before fetching
        const assessments = await db.assessments.toArray()
        return { assessments }
      })

      this.get("/assessments/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Server error" })

        await ensureSeeded()
        const assessment = await db.assessments.get(request.params.id)
        if (!assessment) {
          return new Response(404, {}, { error: "Assessment not found" })
        }
        return { assessment }
      })

      this.post("/assessments", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to create assessment" })

        const attrs = JSON.parse(request.requestBody)
        const assessment = await db.assessments.add({
          ...attrs,
          id: crypto.randomUUID(),
          shareableLink: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        return { assessment }
      })

      this.put("/assessments/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to update assessment" })

        const attrs = JSON.parse(request.requestBody)
        await db.assessments.update(request.params.id, { ...attrs, updatedAt: new Date() })
        const assessment = await db.assessments.get(request.params.id)
        return { assessment }
      })

      // Assessment responses
      this.post("/assessment-responses", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to submit assessment" })

        const attrs = JSON.parse(request.requestBody)
        const response = await db.assessmentResponses.add({
          ...attrs,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        })
        return { response }
      })

      this.delete("/assessments/:id", async (schema, request) => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Failed to delete assessment" })

        await db.assessments.delete(request.params.id)
        return new Response(204)
      })

      this.post("/seed", async () => {
        await simulateLatency()
        try {
          await ensureSeeded()
          return { message: "Database seeded successfully" }
        } catch (error) {
          return new Response(500, {}, { error: "Failed to seed database" })
        }
      })

      this.get("/stats", async () => {
        await simulateLatency()
        if (simulateError()) return new Response(500, {}, { error: "Server error" })

        await ensureSeeded()
        const jobs = await db.jobs.count()
        const candidates = await db.candidates.count()
        const assessments = await db.assessments.count()
        const responses = await db.assessmentResponses.count()

        return { jobs, candidates, assessments, responses }
      })
    },
  })
}

// Initialize the server
if (typeof window !== "undefined") {
  const server = makeServer()

  console.log("[v0] API server initialized")
}
