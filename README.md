# TalentFlow – Mini Hiring Platform

A **React + Next.js** based front-end application for managing **Jobs, Candidates, and Assessments** in a lightweight hiring workflow.  
This project implements the [TalentFlow technical assignment specifications].

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Install dependencies
```bash
npm install
# or
pnpm install
```

### Run development server
```bash
npm run dev
```
The local app will be available at [http://localhost:3000](http://localhost:3000).

### Build for production
```bash
npm run build
npm start
```

---

## 🏗️ Architecture

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19, TypeScript).
- **UI Layer**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) for styled, accessible components.
- **Mock Backend**: [MirageJS](https://miragejs.com/) used to simulate REST APIs with latency & error injection.
- **Persistence**: Local-first using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via Dexie/localForage). State survives page refresh.
- **State Management**: Combination of React Query / local state for API caching and optimistic updates.
- **Data Seeding**: 25 jobs, 1,000 candidates, and seeded assessments auto-populated via `data-seeder.tsx`.
- **Navigation**: MirageJS routing with deep linking for jobs, candidates, and assessments.

---

## 📂 Project Structure

```
job-assessment-platform/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Entry (home)
├── components/
│   ├── pages/                   # Page-level containers
│   │   ├── jobs-page.tsx
│   │   ├── job-detail-page.tsx
│   │   ├── candidates-page.tsx
│   │   ├── candidate-detail-page.tsx
│   │   └── assessments-page.tsx
│   ├── jobs/                    # Job-related UI (job-card, job-form)
│   ├── candidates/              # Candidate list + Kanban
│   ├── assessments/             # Builder + Runtime
│   ├── ui/                      # Shared shadcn/ui components
│   ├── data-seeder.tsx          # Seed mock data
│   └── theme-provider.tsx
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## 🔑 Core Features

### Dashboard/Landing Page
- Dashboard with active tracking of jobs, candidates & assessments.
- Activity timeline to notify recent activities.
- Navbar and quick links to access the subsequent pages.
- Database management with options to seed data, refresh stats and export data.

### Jobs
- Create, edit, archive, reorder (drag-and-drop).
- Paginated job board with filters (title, status, tags).
- Deep linking: `/jobs/:jobId`.

### Candidates
- Virtualized candidate list (1,000+).
- Client-side search (name/email) + server-like filters.
- Candidate detail timeline `/candidates/:id`.
- Kanban board for stage transitions.
- Notes with `@mentions`.

### Assessments
- Job-specific assessment builder (various question types).
- Live preview of assessment as fillable form.
- Candidate submissions with validation rules.
- Conditional questions and local persistence.

---

## ⚙️ Technical Decisions

1. **Next.js App Router**  
   Enables file-based routing, server components, and good DX.  
2. **shadcn/ui + Tailwind**  
   Provides consistent, accessible design system with rapid iteration.  
3. **MSW/MirageJS**  
   Chosen over a real backend to simulate realistic API calls, latency, and error handling.  
4. **IndexedDB persistence**  
   Local-first approach ensures the app works offline and survives reloads.  
5. **Optimistic updates + rollback**  
   Implemented for job reordering and candidate stage transitions.

---

## 🐞 Known Issues & Trade-offs

- **Kanban Booard**: Drag and drop simulation feels slow due to large dataset.
- **Latency simulation**: Artificial delays (200–1200ms) may feel slower in dev mode.  
- **Error injection**: Around 8% failure rates exist by design (for testing rollbacks).  
- **Scalability**: 1,000 candidates are handled well, but makes the candidates page laggy and requires further optimization.  

---

## 📌 Future Improvements

- Export/import seeded data for persistence across browsers.
- Add authentication layer if extended to full-stack.
- Improve test coverage (unit + e2e with Playwright).
- Enhance UI with analytics dashboards (e.g., stage funnel).  
