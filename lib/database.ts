import Dexie, { type Table } from "dexie"

export interface Job {
  id: string
  title: string
  slug: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  status: "active" | "archived"
  tags: string[]
  createdAt: Date
  updatedAt: Date
  order: number
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  jobId: string
  stage: "applied" | "screening" | "interview" | "assessment" | "offer" | "hired" | "rejected"
  notes: Note[]
  assessmentScores: AssessmentScore[]
  createdAt: Date
  updatedAt: Date
  timeline: TimelineEvent[]
}

export interface Note {
  id: string
  content: string
  mentions: string[]
  createdAt: Date
  authorId: string
}

export interface TimelineEvent {
  id: string
  type: "stage_change" | "note_added" | "assessment_completed"
  description: string
  createdAt: Date
  metadata?: any
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  description: string
  sections: AssessmentSection[]
  isPublished: boolean
  shareableLink: string
  createdAt: Date
  updatedAt: Date
}

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  order: number
}

export interface Question {
  id: string
  type: "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file-upload"
  question: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditionalLogic?: {
    dependsOn: string
    showWhen: string
  }
  order: number
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  candidateId?: string
  responses: { [questionId: string]: any }
  completedAt?: Date
  createdAt: Date
}

export interface AssessmentScore {
  assessmentId: string
  score: number
  maxScore: number
  completedAt: Date
}

export class AppDatabase extends Dexie {
  jobs!: Table<Job>
  candidates!: Table<Candidate>
  assessments!: Table<Assessment>
  assessmentResponses!: Table<AssessmentResponse>

  constructor() {
    super("TalentFlowDB")
    this.version(1).stores({
      jobs: "id, title, slug, status, createdAt, order",
      candidates: "id, name, email, jobId, stage, createdAt",
      assessments: "id, jobId, title, isPublished, createdAt",
      assessmentResponses: "id, assessmentId, candidateId, createdAt",
    })
  }
}

const PRESEED_DATA = {
  jobs: [
    {
      id: "job-1",
      title: "Senior Frontend Developer",
      slug: "senior-frontend-developer",
      description:
        "We're looking for an experienced frontend developer to join our growing team and help build the next generation of web applications.",
      responsibilities: [
        "Develop and maintain React applications",
        "Collaborate with design and backend teams",
        "Optimize application performance",
        "Mentor junior developers",
      ],
      qualifications: [
        "5+ years of React experience",
        "Strong TypeScript skills",
        "Experience with modern build tools",
        "Knowledge of testing frameworks",
      ],
      status: "active" as const,
      tags: ["React", "TypeScript", "Frontend", "Senior"],
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      order: 1,
    },
    {
      id: "job-2",
      title: "Full Stack Engineer",
      slug: "full-stack-engineer",
      description: "Join our engineering team to build scalable web applications from frontend to backend.",
      responsibilities: [
        "Build full-stack web applications",
        "Design and implement APIs",
        "Work with databases and cloud services",
        "Participate in code reviews",
      ],
      qualifications: [
        "3+ years full-stack experience",
        "Node.js and React proficiency",
        "Database design experience",
        "Cloud platform knowledge",
      ],
      status: "active" as const,
      tags: ["Full Stack", "Node.js", "React", "Cloud"],
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      order: 2,
    },
    {
      id: "job-3",
      title: "UX/UI Designer",
      slug: "ux-ui-designer",
      description: "Create beautiful and intuitive user experiences for our digital products.",
      responsibilities: [
        "Design user interfaces and experiences",
        "Create wireframes and prototypes",
        "Conduct user research",
        "Collaborate with development teams",
      ],
      qualifications: [
        "3+ years of UX/UI design experience",
        "Proficiency in Figma or Sketch",
        "Understanding of design systems",
        "Portfolio of previous work",
      ],
      status: "active" as const,
      tags: ["Design", "UX", "UI", "Figma"],
      createdAt: new Date("2024-01-25"),
      updatedAt: new Date("2024-01-25"),
      order: 3,
    },
    {
      id: "job-4",
      title: "DevOps Engineer",
      slug: "devops-engineer",
      description: "Help us scale our infrastructure and improve our deployment processes.",
      responsibilities: [
        "Manage cloud infrastructure",
        "Implement CI/CD pipelines",
        "Monitor system performance",
        "Ensure security best practices",
      ],
      qualifications: [
        "4+ years DevOps experience",
        "AWS/Azure/GCP knowledge",
        "Docker and Kubernetes",
        "Infrastructure as Code",
      ],
      status: "active" as const,
      tags: ["DevOps", "AWS", "Docker", "Kubernetes"],
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
      order: 4,
    },
    {
      id: "job-5",
      title: "Product Manager",
      slug: "product-manager",
      description: "Drive product strategy and work with cross-functional teams to deliver exceptional products.",
      responsibilities: [
        "Define product roadmap",
        "Gather and analyze requirements",
        "Coordinate with engineering and design",
        "Track product metrics",
      ],
      qualifications: [
        "3+ years product management experience",
        "Strong analytical skills",
        "Experience with agile methodologies",
        "Excellent communication skills",
      ],
      status: "active" as const,
      tags: ["Product", "Strategy", "Agile", "Analytics"],
      createdAt: new Date("2024-02-05"),
      updatedAt: new Date("2024-02-05"),
      order: 5,
    },
    {
      id: "job-6",
      title: "Backend Developer",
      slug: "backend-developer",
      description: "Build robust and scalable server-side applications and APIs.",
      responsibilities: ["Develop REST APIs", "Database optimization", "Server architecture", "Code reviews"],
      qualifications: ["3+ years backend experience", "Python/Java/Node.js", "Database knowledge", "API design"],
      status: "active" as const,
      tags: ["Backend", "API", "Database", "Python"],
      createdAt: new Date("2024-02-10"),
      updatedAt: new Date("2024-02-10"),
      order: 6,
    },
    {
      id: "job-7",
      title: "Data Scientist",
      slug: "data-scientist",
      description: "Extract insights from data to drive business decisions.",
      responsibilities: ["Data analysis", "Machine learning models", "Statistical analysis", "Data visualization"],
      qualifications: ["PhD/Masters in related field", "Python/R proficiency", "ML frameworks", "Statistics knowledge"],
      status: "active" as const,
      tags: ["Data Science", "ML", "Python", "Statistics"],
      createdAt: new Date("2024-02-12"),
      updatedAt: new Date("2024-02-12"),
      order: 7,
    },
    {
      id: "job-8",
      title: "Mobile Developer (iOS)",
      slug: "mobile-developer-ios",
      description: "Create amazing iOS applications for our mobile platform.",
      responsibilities: [
        "iOS app development",
        "App Store deployment",
        "Performance optimization",
        "UI/UX implementation",
      ],
      qualifications: ["Swift proficiency", "iOS SDK knowledge", "App Store experience", "3+ years mobile dev"],
      status: "active" as const,
      tags: ["iOS", "Swift", "Mobile", "App Store"],
      createdAt: new Date("2024-02-14"),
      updatedAt: new Date("2024-02-14"),
      order: 8,
    },
    {
      id: "job-9",
      title: "Mobile Developer (Android)",
      slug: "mobile-developer-android",
      description: "Develop cutting-edge Android applications.",
      responsibilities: ["Android app development", "Google Play deployment", "Material Design", "Performance tuning"],
      qualifications: ["Kotlin/Java expertise", "Android SDK", "Google Play experience", "3+ years experience"],
      status: "active" as const,
      tags: ["Android", "Kotlin", "Mobile", "Google Play"],
      createdAt: new Date("2024-02-16"),
      updatedAt: new Date("2024-02-16"),
      order: 9,
    },
    {
      id: "job-10",
      title: "QA Engineer",
      slug: "qa-engineer",
      description: "Ensure product quality through comprehensive testing strategies.",
      responsibilities: ["Test planning", "Automated testing", "Bug tracking", "Quality assurance"],
      qualifications: ["Testing frameworks", "Automation tools", "Bug tracking systems", "2+ years QA experience"],
      status: "active" as const,
      tags: ["QA", "Testing", "Automation", "Quality"],
      createdAt: new Date("2024-02-18"),
      updatedAt: new Date("2024-02-18"),
      order: 10,
    },
    {
      id: "job-11",
      title: "Security Engineer",
      slug: "security-engineer",
      description: "Protect our systems and data from security threats.",
      responsibilities: ["Security audits", "Vulnerability assessment", "Security policies", "Incident response"],
      qualifications: ["Security certifications", "Penetration testing", "Security tools", "4+ years experience"],
      status: "active" as const,
      tags: ["Security", "Cybersecurity", "Penetration Testing", "Compliance"],
      createdAt: new Date("2024-02-20"),
      updatedAt: new Date("2024-02-20"),
      order: 11,
    },
    {
      id: "job-12",
      title: "Machine Learning Engineer",
      slug: "machine-learning-engineer",
      description: "Deploy and scale machine learning models in production.",
      responsibilities: ["ML model deployment", "Model optimization", "MLOps pipelines", "Performance monitoring"],
      qualifications: ["ML frameworks", "Python/TensorFlow", "Cloud platforms", "3+ years ML experience"],
      status: "active" as const,
      tags: ["ML", "AI", "TensorFlow", "MLOps"],
      createdAt: new Date("2024-02-22"),
      updatedAt: new Date("2024-02-22"),
      order: 12,
    },
    {
      id: "job-13",
      title: "Technical Writer",
      slug: "technical-writer",
      description: "Create clear and comprehensive technical documentation.",
      responsibilities: ["API documentation", "User guides", "Technical blogs", "Documentation maintenance"],
      qualifications: ["Technical writing experience", "API documentation", "Markdown/Git", "2+ years experience"],
      status: "active" as const,
      tags: ["Documentation", "Technical Writing", "API", "Communication"],
      createdAt: new Date("2024-02-24"),
      updatedAt: new Date("2024-02-24"),
      order: 13,
    },
    {
      id: "job-14",
      title: "Site Reliability Engineer",
      slug: "site-reliability-engineer",
      description: "Ensure system reliability and performance at scale.",
      responsibilities: ["System monitoring", "Incident response", "Performance optimization", "Automation"],
      qualifications: ["SRE experience", "Monitoring tools", "Scripting languages", "4+ years experience"],
      status: "active" as const,
      tags: ["SRE", "Monitoring", "Reliability", "Automation"],
      createdAt: new Date("2024-02-26"),
      updatedAt: new Date("2024-02-26"),
      order: 14,
    },
    {
      id: "job-15",
      title: "Database Administrator",
      slug: "database-administrator",
      description: "Manage and optimize database systems for performance and reliability.",
      responsibilities: ["Database maintenance", "Performance tuning", "Backup strategies", "Security management"],
      qualifications: ["SQL expertise", "Database systems", "Performance tuning", "3+ years DBA experience"],
      status: "active" as const,
      tags: ["Database", "SQL", "Performance", "Administration"],
      createdAt: new Date("2024-02-28"),
      updatedAt: new Date("2024-02-28"),
      order: 15,
    },
    {
      id: "job-16",
      title: "Cloud Architect",
      slug: "cloud-architect",
      description: "Design and implement cloud infrastructure solutions.",
      responsibilities: ["Cloud architecture", "Migration planning", "Cost optimization", "Security design"],
      qualifications: [
        "Cloud certifications",
        "Architecture experience",
        "Multi-cloud knowledge",
        "5+ years experience",
      ],
      status: "active" as const,
      tags: ["Cloud", "Architecture", "AWS", "Azure"],
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01"),
      order: 16,
    },
    {
      id: "job-17",
      title: "Frontend Architect",
      slug: "frontend-architect",
      description: "Lead frontend architecture decisions and technical strategy.",
      responsibilities: ["Architecture design", "Technology selection", "Code standards", "Team mentoring"],
      qualifications: [
        "Senior frontend experience",
        "Architecture knowledge",
        "Leadership skills",
        "6+ years experience",
      ],
      status: "active" as const,
      tags: ["Frontend", "Architecture", "Leadership", "React"],
      createdAt: new Date("2024-03-03"),
      updatedAt: new Date("2024-03-03"),
      order: 17,
    },
    {
      id: "job-18",
      title: "Scrum Master",
      slug: "scrum-master",
      description: "Facilitate agile development processes and team collaboration.",
      responsibilities: ["Sprint planning", "Team facilitation", "Process improvement", "Stakeholder communication"],
      qualifications: ["Scrum certification", "Agile experience", "Facilitation skills", "3+ years experience"],
      status: "active" as const,
      tags: ["Scrum", "Agile", "Project Management", "Facilitation"],
      createdAt: new Date("2024-03-05"),
      updatedAt: new Date("2024-03-05"),
      order: 18,
    },
    {
      id: "job-19",
      title: "Business Analyst",
      slug: "business-analyst",
      description: "Bridge business requirements with technical solutions.",
      responsibilities: ["Requirements gathering", "Process analysis", "Documentation", "Stakeholder management"],
      qualifications: [
        "Business analysis experience",
        "Requirements documentation",
        "Process modeling",
        "3+ years experience",
      ],
      status: "active" as const,
      tags: ["Business Analysis", "Requirements", "Process", "Documentation"],
      createdAt: new Date("2024-03-07"),
      updatedAt: new Date("2024-03-07"),
      order: 19,
    },
    {
      id: "job-20",
      title: "Sales Engineer",
      slug: "sales-engineer",
      description: "Provide technical expertise to support sales processes.",
      responsibilities: ["Technical demos", "Solution design", "Customer support", "Sales collaboration"],
      qualifications: ["Technical background", "Sales experience", "Communication skills", "3+ years experience"],
      status: "active" as const,
      tags: ["Sales", "Technical", "Customer Success", "Communication"],
      createdAt: new Date("2024-03-09"),
      updatedAt: new Date("2024-03-09"),
      order: 20,
    },
    {
      id: "job-21",
      title: "Marketing Manager",
      slug: "marketing-manager",
      description: "Drive marketing strategy and campaign execution.",
      responsibilities: ["Campaign management", "Content strategy", "Analytics", "Brand management"],
      qualifications: ["Marketing experience", "Digital marketing", "Analytics tools", "4+ years experience"],
      status: "active" as const,
      tags: ["Marketing", "Digital", "Analytics", "Strategy"],
      createdAt: new Date("2024-03-11"),
      updatedAt: new Date("2024-03-11"),
      order: 21,
    },
    {
      id: "job-22",
      title: "HR Specialist",
      slug: "hr-specialist",
      description: "Support human resources operations and employee relations.",
      responsibilities: ["Recruitment", "Employee relations", "Policy development", "Training coordination"],
      qualifications: ["HR experience", "Recruitment skills", "Employment law", "3+ years experience"],
      status: "active" as const,
      tags: ["HR", "Recruitment", "Employee Relations", "Policy"],
      createdAt: new Date("2024-03-13"),
      updatedAt: new Date("2024-03-13"),
      order: 22,
    },
    {
      id: "job-23",
      title: "Financial Analyst",
      slug: "financial-analyst",
      description: "Analyze financial data and support business decisions.",
      responsibilities: ["Financial modeling", "Budget analysis", "Reporting", "Forecasting"],
      qualifications: ["Finance degree", "Excel proficiency", "Financial modeling", "2+ years experience"],
      status: "active" as const,
      tags: ["Finance", "Analysis", "Modeling", "Reporting"],
      createdAt: new Date("2024-03-15"),
      updatedAt: new Date("2024-03-15"),
      order: 23,
    },
    {
      id: "job-24",
      title: "Operations Manager",
      slug: "operations-manager",
      description: "Oversee daily operations and process optimization.",
      responsibilities: ["Operations oversight", "Process improvement", "Team management", "Performance monitoring"],
      qualifications: ["Operations experience", "Management skills", "Process optimization", "4+ years experience"],
      status: "active" as const,
      tags: ["Operations", "Management", "Process", "Optimization"],
      createdAt: new Date("2024-03-17"),
      updatedAt: new Date("2024-03-17"),
      order: 24,
    },
    {
      id: "job-25",
      title: "Customer Success Manager",
      slug: "customer-success-manager",
      description: "Ensure customer satisfaction and drive product adoption.",
      responsibilities: ["Customer onboarding", "Relationship management", "Success metrics", "Renewal management"],
      qualifications: ["Customer success experience", "Relationship building", "SaaS knowledge", "3+ years experience"],
      status: "active" as const,
      tags: ["Customer Success", "SaaS", "Relationships", "Onboarding"],
      createdAt: new Date("2024-03-19"),
      updatedAt: new Date("2024-03-19"),
      order: 25,
    },
  ],
  candidates: (() => {
    const candidates: any[] = []
    const firstNames = [
      "Alice",
      "Bob",
      "Carol",
      "David",
      "Emma",
      "Frank",
      "Grace",
      "Henry",
      "Ivy",
      "Jack",
      "Kate",
      "Liam",
      "Maya",
      "Noah",
      "Olivia",
      "Paul",
      "Quinn",
      "Ruby",
      "Sam",
      "Tara",
      "Uma",
      "Victor",
      "Wendy",
      "Xavier",
      "Yara",
      "Zoe",
      "Alex",
      "Blake",
      "Casey",
      "Drew",
      "Eli",
      "Fiona",
      "Gabe",
      "Hana",
      "Ian",
      "Jess",
      "Kyle",
      "Luna",
      "Max",
      "Nora",
      "Owen",
      "Piper",
      "Quincy",
      "Riley",
      "Sage",
      "Taylor",
      "Uri",
      "Val",
      "Wade",
      "Xara",
    ]
    const lastNames = [
      "Johnson",
      "Smith",
      "Davis",
      "Wilson",
      "Brown",
      "Miller",
      "Garcia",
      "Martinez",
      "Anderson",
      "Taylor",
      "Thomas",
      "Jackson",
      "White",
      "Harris",
      "Martin",
      "Thompson",
      "Moore",
      "Young",
      "Allen",
      "King",
      "Wright",
      "Lopez",
      "Hill",
      "Scott",
      "Green",
      "Adams",
      "Baker",
      "Gonzalez",
      "Nelson",
      "Carter",
      "Mitchell",
      "Perez",
      "Roberts",
      "Turner",
      "Phillips",
      "Campbell",
      "Parker",
      "Evans",
      "Edwards",
      "Collins",
      "Stewart",
      "Sanchez",
      "Morris",
      "Rogers",
      "Reed",
      "Cook",
      "Morgan",
      "Bell",
      "Murphy",
      "Bailey",
    ]
    const stages = ["applied", "screening", "interview", "assessment", "offer", "hired", "rejected"]
    const domains = ["email.com", "gmail.com", "company.com", "tech.com", "startup.io", "corp.net"]

    for (let i = 1; i <= 1000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`
      const jobId = `job-${Math.floor(Math.random() * 25) + 1}`
      const stage = stages[Math.floor(Math.random() * stages.length)]
      const createdDaysAgo = Math.floor(Math.random() * 60) + 1
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000)

      candidates.push({
        id: `candidate-${i}`,
        name: `${firstName} ${lastName}`,
        email,
        phone: Math.random() > 0.3 ? `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}` : undefined,
        jobId,
        stage,
        notes:
          Math.random() > 0.7
            ? [
                {
                  id: `note-${i}`,
                  content: `Interview notes for ${firstName} ${lastName}`,
                  mentions: [],
                  createdAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                  authorId: "hr-1",
                },
              ]
            : [],
        assessmentScores:
          Math.random() > 0.6
            ? [
                {
                  assessmentId: `assessment-${Math.floor(Math.random() * 3) + 1}`,
                  score: Math.floor(Math.random() * 40) + 60,
                  maxScore: 100,
                  completedAt: new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
                },
              ]
            : [],
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            id: `timeline-${i}`,
            type: "stage_change" as const,
            description: "Application received",
            createdAt,
            metadata: { from: null, to: "applied" },
          },
        ],
      })
    }
    return candidates
  })(),
  assessments: [
    {
      id: "assessment-1",
      jobId: "job-1",
      title: "Frontend Developer Technical Assessment",
      description:
        "Comprehensive evaluation of frontend development skills including React, JavaScript, and modern web technologies.",
      sections: [
        {
          id: "section-1",
          title: "React & JavaScript Fundamentals",
          description: "Core concepts and best practices",
          order: 1,
          questions: [
            {
              id: "q1",
              type: "single-choice" as const,
              question: "What is the purpose of React hooks?",
              required: true,
              options: [
                "To add state and lifecycle methods to functional components",
                "To create class components",
                "To handle routing",
                "To manage CSS styles",
              ],
              order: 1,
            },
            {
              id: "q2",
              type: "multi-choice" as const,
              question: "Which of the following are valid React lifecycle methods?",
              required: true,
              options: ["componentDidMount", "componentWillUpdate", "useEffect", "componentDidUpdate"],
              order: 2,
            },
            {
              id: "q3",
              type: "short-text" as const,
              question: "Explain the difference between props and state in React.",
              required: true,
              validation: { minLength: 50, maxLength: 500 },
              order: 3,
            },
            {
              id: "q4",
              type: "single-choice" as const,
              question: "What is the virtual DOM in React?",
              required: true,
              options: [
                "A JavaScript representation of the real DOM",
                "A CSS framework",
                "A testing library",
                "A state management tool",
              ],
              order: 4,
            },
            {
              id: "q5",
              type: "long-text" as const,
              question: "Write a React component that fetches and displays a list of users from an API.",
              required: true,
              validation: { minLength: 100, maxLength: 2000 },
              order: 5,
            },
          ],
        },
        {
          id: "section-2",
          title: "Advanced Frontend Concepts",
          description: "Performance, testing, and modern tooling",
          order: 2,
          questions: [
            {
              id: "q6",
              type: "multi-choice" as const,
              question: "Which tools can be used for React testing?",
              required: true,
              options: ["Jest", "React Testing Library", "Enzyme", "Cypress"],
              order: 1,
            },
            {
              id: "q7",
              type: "short-text" as const,
              question: "How would you optimize a React application's performance?",
              required: true,
              validation: { minLength: 100, maxLength: 800 },
              order: 2,
            },
            {
              id: "q8",
              type: "single-choice" as const,
              question: "What is the purpose of React.memo()?",
              required: true,
              options: [
                "To memoize component renders",
                "To manage state",
                "To handle side effects",
                "To create context",
              ],
              order: 3,
            },
            {
              id: "q9",
              type: "numeric" as const,
              question: "How many years of React experience do you have?",
              required: true,
              validation: { min: 0, max: 20 },
              order: 4,
            },
            {
              id: "q10",
              type: "long-text" as const,
              question: "Describe your experience with state management libraries (Redux, Zustand, etc.)",
              required: false,
              validation: { minLength: 50, maxLength: 1000 },
              order: 5,
            },
          ],
        },
      ],
      isPublished: true,
      shareableLink: "https://assessment.talentflow.com/take/assessment-1",
      createdAt: new Date("2024-01-30"),
      updatedAt: new Date("2024-01-30"),
    },
    {
      id: "assessment-2",
      jobId: "job-2",
      title: "Full Stack Developer Assessment",
      description:
        "Comprehensive assessment covering both frontend and backend development skills with focus on modern web technologies.",
      sections: [
        {
          id: "section-3",
          title: "Backend Development",
          description: "Server-side development and API design",
          order: 1,
          questions: [
            {
              id: "q11",
              type: "single-choice" as const,
              question: "Which HTTP method is typically used to update a resource?",
              required: true,
              options: ["GET", "POST", "PUT", "DELETE"],
              order: 1,
            },
            {
              id: "q12",
              type: "short-text" as const,
              question: "Explain the difference between SQL and NoSQL databases.",
              required: true,
              validation: { minLength: 50, maxLength: 300 },
              order: 2,
            },
            {
              id: "q13",
              type: "multi-choice" as const,
              question: "Which are valid Node.js frameworks?",
              required: true,
              options: ["Express.js", "Koa.js", "Fastify", "Hapi.js"],
              order: 3,
            },
            {
              id: "q14",
              type: "long-text" as const,
              question: "Design a RESTful API for a blog application with posts and comments.",
              required: true,
              validation: { minLength: 200, maxLength: 1500 },
              order: 4,
            },
            {
              id: "q15",
              type: "single-choice" as const,
              question: "What is middleware in Express.js?",
              required: true,
              options: [
                "Functions that execute during the request-response cycle",
                "Database connection tools",
                "Frontend components",
                "CSS preprocessors",
              ],
              order: 5,
            },
          ],
        },
        {
          id: "section-4",
          title: "Database & DevOps",
          description: "Database design and deployment practices",
          order: 2,
          questions: [
            {
              id: "q16",
              type: "short-text" as const,
              question: "What is database normalization and why is it important?",
              required: true,
              validation: { minLength: 100, maxLength: 500 },
              order: 1,
            },
            {
              id: "q17",
              type: "multi-choice" as const,
              question: "Which are popular cloud platforms?",
              required: true,
              options: ["AWS", "Google Cloud", "Azure", "DigitalOcean"],
              order: 2,
            },
            {
              id: "q18",
              type: "single-choice" as const,
              question: "What is Docker primarily used for?",
              required: true,
              options: [
                "Containerization of applications",
                "Database management",
                "Frontend styling",
                "Version control",
              ],
              order: 3,
            },
            {
              id: "q19",
              type: "long-text" as const,
              question: "Describe your experience with CI/CD pipelines and deployment strategies.",
              required: false,
              validation: { minLength: 100, maxLength: 1000 },
              order: 4,
            },
            {
              id: "q20",
              type: "numeric" as const,
              question: "How many years of full-stack development experience do you have?",
              required: true,
              validation: { min: 0, max: 25 },
              order: 5,
            },
          ],
        },
      ],
      isPublished: true,
      shareableLink: "https://assessment.talentflow.com/take/assessment-2",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
    {
      id: "assessment-3",
      jobId: "job-3",
      title: "UX/UI Designer Assessment",
      description:
        "Comprehensive evaluation of design skills, user experience principles, and design tool proficiency.",
      sections: [
        {
          id: "section-5",
          title: "Design Principles & Theory",
          description: "Fundamental design concepts and user experience",
          order: 1,
          questions: [
            {
              id: "q21",
              type: "single-choice" as const,
              question: "What is the primary goal of user-centered design?",
              required: true,
              options: [
                "To create designs that meet user needs and expectations",
                "To make designs look aesthetically pleasing",
                "To reduce development costs",
                "To follow current design trends",
              ],
              order: 1,
            },
            {
              id: "q22",
              type: "multi-choice" as const,
              question: "Which are key principles of good UX design?",
              required: true,
              options: ["Usability", "Accessibility", "Consistency", "Visual hierarchy"],
              order: 2,
            },
            {
              id: "q23",
              type: "short-text" as const,
              question: "Explain the difference between UX and UI design.",
              required: true,
              validation: { minLength: 100, maxLength: 500 },
              order: 3,
            },
            {
              id: "q24",
              type: "single-choice" as const,
              question: "What is a design system?",
              required: true,
              options: [
                "A collection of reusable components and guidelines",
                "A software for creating designs",
                "A type of user research method",
                "A project management framework",
              ],
              order: 4,
            },
            {
              id: "q25",
              type: "long-text" as const,
              question: "Describe your process for conducting user research and how it informs your design decisions.",
              required: true,
              validation: { minLength: 200, maxLength: 1000 },
              order: 5,
            },
          ],
        },
        {
          id: "section-6",
          title: "Tools & Implementation",
          description: "Design tools, prototyping, and collaboration",
          order: 2,
          questions: [
            {
              id: "q26",
              type: "multi-choice" as const,
              question: "Which design tools have you used professionally?",
              required: true,
              options: ["Figma", "Sketch", "Adobe XD", "InVision"],
              order: 1,
            },
            {
              id: "q27",
              type: "short-text" as const,
              question: "How do you ensure your designs are accessible to users with disabilities?",
              required: true,
              validation: { minLength: 100, maxLength: 600 },
              order: 2,
            },
            {
              id: "q28",
              type: "single-choice" as const,
              question: "What is the purpose of wireframing in the design process?",
              required: true,
              options: [
                "To establish layout and functionality before visual design",
                "To create final visual designs",
                "To write code for the interface",
                "To conduct user testing",
              ],
              order: 3,
            },
            {
              id: "q29",
              type: "long-text" as const,
              question: "Walk through your design process from initial brief to final handoff to developers.",
              required: true,
              validation: { minLength: 300, maxLength: 1500 },
              order: 4,
            },
            {
              id: "q30",
              type: "numeric" as const,
              question: "How many years of UX/UI design experience do you have?",
              required: true,
              validation: { min: 0, max: 20 },
              order: 5,
            },
          ],
        },
      ],
      isPublished: true,
      shareableLink: "https://assessment.talentflow.com/take/assessment-3",
      createdAt: new Date("2024-02-03"),
      updatedAt: new Date("2024-02-03"),
    },
  ],
}

let isSeeded = false

export async function ensureSeeded() {
  if (isSeeded) return

  try {
    console.log("[v0] Checking if database needs seeding...")

    const jobCount = await db.jobs.count()
    const candidateCount = await db.candidates.count()
    const assessmentCount = await db.assessments.count()

    console.log("[v0] Current counts:", { jobCount, candidateCount, assessmentCount })

    if (jobCount === 0 || candidateCount === 0 || assessmentCount <= 1) {
      console.log("[v0] Database needs seeding, adding preseed data...")

      // Clear existing data
      await db.transaction("rw", [db.jobs, db.candidates, db.assessments], async () => {
        await db.jobs.clear()
        await db.candidates.clear()
        await db.assessments.clear()
      })

      // Add preseed data
      await db.transaction("rw", [db.jobs, db.candidates, db.assessments], async () => {
        await db.jobs.bulkAdd(PRESEED_DATA.jobs)
        await db.candidates.bulkAdd(PRESEED_DATA.candidates)
        await db.assessments.bulkAdd(PRESEED_DATA.assessments)
      })

      console.log("[v0] Preseed data added successfully!")
      isSeeded = true
    } else {
      console.log("[v0] Database already has data, skipping seeding")
      isSeeded = true
    }
  } catch (error) {
    console.error("[v0] Error seeding database:", error)
  }
}

export const db = new AppDatabase()

ensureSeeded()
