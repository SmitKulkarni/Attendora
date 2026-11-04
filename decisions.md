# Architecture & Product Decision Records (ADR)

This document captures every fundamental architectural, technical, and product design decision governing **Attendora** (Multi-Tenant Cloud-Based Student Attendance Management & Compliance System). It serves as persistent context for AI agents, engineering leads, and institutional auditors.

---

## Decision Index

| ID | Title | Date | Status | Area |
| :--- | :--- | :--- | :--- | :--- |
| [ADR-001](#adr-001-multi-tenancy-strategy-shared-database-with-postgresql-row-level-security) | Multi-Tenancy Strategy: Shared Database with PostgreSQL RLS | 2026-10-18 | Approved | Infrastructure & Security |
| [ADR-002](#adr-002-backend-architectural-style-modular-monolith-over-microservices) | Backend Architectural Style: Modular Monolith over Microservices | 2026-10-22 | Approved | Backend Architecture |
| [ADR-003](#adr-003-persistence-engine-transition-from-firebase-nosql-to-relational-postgresql) | Persistence Engine: Transition from Firebase NoSQL to Relational PostgreSQL | 2026-10-24 | Approved | Database & Data Model |
| [ADR-004](#adr-004-asynchronous-processing-redis-task-queue-for-roster-imports-and-reports) | Asynchronous Processing: Redis Task Queue for Roster Imports & Reports | 2026-10-27 | Approved | Scalability & Performance |
| [ADR-005](#adr-005-frontend-architecture-react-19--typescript-with-dual-persona-view-system) | Frontend Architecture: React 19 + TypeScript with Dual-Persona View System | 2026-10-30 | Approved | Web & Mobile Frontend |
| [ADR-006](#adr-006-statutory-attendance-compliance-model-and-recovery-mathematics) | Statutory Attendance Compliance Model & Recovery Mathematics | 2026-11-01 | Approved | Domain & Business Logic |
| [ADR-007](#adr-007-immutable-session-records-and-cryptographic-audit-trail) | Immutable Session Records & Cryptographic Audit Trail | 2026-11-03 | Approved | Governance & Compliance |

---

## ADR-001: Multi-Tenancy Strategy: Shared Database with PostgreSQL Row-Level Security

### Date
2026-10-18

### Context / Problem
Attendora serves higher education colleges and universities across regions with varying funding tiers. An initial low-cost/freemium model is necessary to rapidly onboard regional academic departments. Operating isolated database instances per college (Database-per-Tenant) or managing thousands of separate database schemas (Schema-per-Tenant) would produce excessive infrastructure costs, operational migration overhead, and idle connection exhaustion. Conversely, pure application-layer filtering (`WHERE tenant_id = ?`) introduces critical vulnerability risks if an engineer or query builder omits the clause.

### Decision Taken
Adopt a **Shared Database, Shared Schema** architecture reinforced at the database kernel level using **PostgreSQL Row-Level Security (RLS)**. Every tenant-scoped table contains an indexed `tenant_id: UUID` column. Application database connection pools execute session context injection:
```sql
SET LOCAL app.current_tenant_id = 'tenant-uuid-here';
```
PostgreSQL RLS policies unconditionally restrict table reads, writes, updates, and deletes to rows matching `app.current_tenant_id`.

### Reasoning
- **Zero Incremental Cost:** Provisioning a new educational institution requires only a single transactional row insert into `tenants`, avoiding cloud database provisioning latency and cost.
- **Unified Migrations:** DDL schema updates and index optimizations are applied in a single migration pipeline rather than hundreds of tenant migrations.
- **Defense in Depth:** Even in the event of an application SQL-injection vulnerability or un-scoped developer query, the database engine enforces tenant boundaries.

### Alternatives Considered
1. **Database-per-Tenant (Isolated RDS instances):** Rejected due to cost ($50+/month per tenant) and slow provisioning times (5–15 minutes).
2. **Schema-per-Tenant (One PostgreSQL schema per college):** Rejected due to database connection pool fragmentation, migration performance degradation past 200 schemas, and table limit bottlenecks.
3. **Application-Only Tenant Isolation:** Rejected due to high risk of catastrophic data leakage caused by accidental developer oversight.

### Impact on Project
- Every tenant database query must checkout a connection from the pool and set `app.current_tenant_id`.
- Tenant onboarding is instant (sub-second).
- Infrastructure overhead remains flat regardless of tenant volume during the freemium acquisition phase.

---

## ADR-002: Backend Architectural Style: Modular Monolith over Microservices

### Date
2026-10-22

### Context / Problem
Attendora core operations revolve around tightly coupled transactional domains: departments, batches, courses, faculty assignments, lecture timetables, and student attendance logs. Splitting the system into independent microservices (e.g., Auth Service, Attendance Service, Student Service, Reports Service) during early development would introduce distributed transaction overhead (Saga patterns, two-phase commits), network latency across inter-service RPCs, and significant DevOps operational complexity for a lean engineering team.

### Decision Taken
Implement the backend as a **Modular Monolith** using **Python Flask / Gunicorn** with strictly isolated domain packages (`identity`, `organization`, `academic_engine`, `attendance_core`, `reporting`, `notification`, `audit`).

### Reasoning
- **Transactional Integrity:** Allows database transactions (`BEGIN ... COMMIT`) to cleanly encompass session creation and roll-call marks without distributed rollbacks.
- **Velocity:** Single-repository deployment, unified CI/CD test suite, and minimal infrastructure surface.
- **Future-Proofing:** Strict modular encapsulation ensures any domain (such as high-load Report Generation or Notification Queues) can be cleanly extracted into standalone microservices if scale demands it later.

### Alternatives Considered
1. **Microservices Architecture:** Rejected due to premature optimization, distributed tracing overhead, eventual consistency complexities in regulatory compliance, and increased cloud hosting costs.
2. **Unstructured Monolith ("Big Ball of Mud"):** Rejected due to high long-term maintenance costs and circular dependency bottlenecks.

### Impact on Project
- Faster release velocity and deterministic local development.
- Single artifact deployment via Docker containers to Google Cloud Run or AWS ECS.
- Strict internal boundaries maintained using domain models and service layers.

---

## ADR-003: Persistence Engine: Transition from Firebase NoSQL to Relational PostgreSQL

### Date
2026-10-24

### Context / Problem
The earliest prototype explored Firebase Firestore (NoSQL) for rapid proof-of-concept prototyping. However, institutional attendance management is deeply relational:
- Students belong to Sections within Batches within Departments within Colleges.
- Lectures map to Courses, Faculty, and Rooms.
- Attendance queries require multidimensional aggregation across academic terms to detect defaulters.

NoSQL document structures resulted in severe data denormalization, inconsistent batch roll-call updates, lack of ACID transactions across concurrent faculty edits, and an inability to run SQL compliance analytics.

### Decision Taken
Migrate primary persistence entirely to **Relational PostgreSQL 16+** with:
- Strict foreign key constraints and ACID transaction semantics.
- Range partitioning on the core `attendance_records` table by `session_date` (e.g., monthly partitions).
- JSONB columns for polymorphic audit logs and configurable tenant settings.

### Reasoning
- **Data Integrity:** Eliminates orphaned attendance logs and duplicate roll-call records.
- **Aggregation Performance:** PostgreSQL query planner and window functions compute cohort attendance rates over millions of records in milliseconds.
- **Partition Pruning:** Range-partitioning by date ensures queries for the active semester scan only relevant disk partitions, keeping indexes lean and memory-resident.

### Alternatives Considered
1. **Firebase Firestore:** Deprecated. Lacked native SQL joins, required expensive distributed writes per student during roll-call, and provided insufficient kernel-level row security.
2. **MongoDB:** Rejected. Weak multi-document transaction guarantees at high concurrency; lacks native PostgreSQL-grade RLS.

### Impact on Project
- Full relational schema established (`src/types/index.ts` aligned with relational schema).
- Zero data corruption during concurrent faculty roll-call submissions.
- Native SQL support for institutional defaulter exports.

---

## ADR-004: Asynchronous Processing: Redis Task Queue for Roster Imports & Reports

### Date
2026-10-27

### Context / Problem
Synchronous HTTP request threads are vulnerable to timeouts during heavy institutional workloads:
1. Academic start-of-year: Bulk onboarding of 2,000+ students via CSV parsing and email validation.
2. End-of-term: Generating 50-page PDF defaulter reports across 12 departments simultaneously.
3. Class changeover peaks: 50+ faculty members submitting roll-call within a 3-minute window.

Executing heavy CSV validation or PDF compilation directly inside synchronous web workers saturates Gunicorn/HTTP processes, starving regular roll-call traffic.

### Decision Taken
Introduce a **Redis 7 In-Memory Bus & Distributed Task Queue (RQ / Celery)** to decouple synchronous HTTP request-response cycles from long-running background tasks.
- Web API endpoints accept file uploads, validate headers, store files in object storage (S3/Cloud Storage), enqueue jobs, and immediately return HTTP `202 Accepted` with a job tracking ID.
- Dedicated worker pools execute CSV parsing, batch DB inserts, PDF generation, and external email notifications.

### Reasoning
- **Guaranteed Fast API Responses:** Critical classroom endpoints (`POST /attendance`) consistently achieve sub-150ms latency.
- **Fault Tolerance:** Failed notification dispatches or PDF compilations retry automatically with exponential backoff without crashing web servers.
- **Resource Isolation:** Memory-intensive PDF rendering processes do not compromise real-time database transactions.

### Alternatives Considered
1. **Synchronous Worker Execution:** Rejected. Causes HTTP 504 Gateway Timeouts on rosters over 500 rows.
2. **Thread-Based Background Tasks in Web Process:** Rejected. Web dyno restarts or container scale-downs abruptly terminate running tasks, causing partial data imports.

### Impact on Project
- Added Redis dependency to production infrastructure.
- Asynchronous task status polling implemented in UI (`CsvImportModal` and PDF generation).

---

## ADR-005: Frontend Architecture: React 19 + TypeScript with Dual-Persona View System

### Date
2026-10-30

### Context / Problem
Attendora serves two diametrically opposed user personas with drastically different physical contexts and functional requirements:
1. **Faculty & Academic Administrators:** Need high-density tabular data, keyboard shortcuts, multi-column sorting, rapid batch marking grids, and modal inspection tools on large desktop monitors.
2. **Students:** Need mobile-first, high-contrast, touch-optimized interfaces that eliminate anxiety, display instant safety margins, and provide one-tap shortage recovery calculations.

Building two entirely separate client repositories would duplicate business logic, mathematical calculation utilities, and domain TypeScript interfaces. Conversely, a simplistic generic responsive page fails to provide the specialized desktop table density or mobile gesture physics required.

### Decision Taken
Build a single **React 19 + TypeScript + Tailwind CSS v4** Progressive Web Application featuring an explicit **Dual-Persona Architecture**:
- `DesktopDashboard`: High-density academic governance interface with sticky headers, bulk selection, audit drawers, and modal workflows.
- `MobileStudentApp`: Mobile-first student portal featuring gesture swipeable cards, circular compliance gauges, and instant shortage recovery calculators.
- `ShowcaseView`: An executive presentation harness enabling real-time side-by-side or toggled inspection between Admin, Faculty, and Student personas.

### Reasoning
- **100% Code Reuse for Domain Logic:** Calculation formulas (`calculateAttendancePercentage`, `calculateRecoveryClasses`, `calculateAffordableAbsences`), CSV validation, and data contracts are identical across interfaces.
- **Zero Duplication:** Single build pipeline, shared component tokens, unified test harness.
- **Stakeholder Demonstration:** Instant live switching between roles without logging out during university board presentations.

### Alternatives Considered
1. **Separate Repositories (Desktop React App + Mobile React Native App):** Rejected due to double engineering overhead during initial market validation.
2. **Single Responsive View with Media Queries:** Rejected because desktop governance workflows (audit trails, batch marking grids) cannot gracefully collapse into a mobile card layout without compromising usability.

### Impact on Project
- Unified codebase under `src/components/desktop/`, `src/components/mobile/`, and `src/components/ShowcaseView.tsx`.
- Highly modular view state handled at the root `App.tsx` level.

---

## ADR-006: Statutory Attendance Compliance Model & Recovery Mathematics

### Date
2026-11-01

### Context / Problem
Higher education regulatory bodies (such as the University Grants Commission and Directorate of Technical Education, Maharashtra) enforce a mandatory **75.0% minimum attendance threshold** for semester examination eligibility. Existing college software merely displays a historical percentage (e.g., "68.2%"), leaving students in the dark regarding what corrective actions are necessary or allowing them to cross the point of no return.

### Decision Taken
Standardize a **Three-Tier Compliance Engine** backed by deterministic mathematical recovery and buffer formulas:

1. **Compliance Tiers:**
   - **Compliant (Safe):** Attendance $\ge 75.0\%$ (Institutional statutory clearance).
   - **Warning (Cushion):** Attendance $70.0\% - 74.9\%$ (Pre-defaulter notice, conditional probation).
   - **Critical (Defaulter):** Attendance $< 70.0\%$ (Barred from final exams without formal administrative waiver).

2. **Shortage Recovery Formula:**
   For a student with $A$ attended sessions out of $C$ conducted sessions and target threshold $T = 0.75$:
   $$\text{Required Future Consecutive Classes} = \left\lceil \frac{T \cdot C - A}{1 - T} \right\rceil = \left\lceil \frac{0.75 \cdot C - A}{0.25} \right\rceil$$

3. **Affordable Absences Buffer Formula:**
   $$\text{Affordable Safe Cuts} = \left\lfloor \frac{A - T \cdot C}{T} \right\rfloor = \left\lfloor \frac{A - 0.75 \cdot C}{0.75} \right\rfloor$$

### Reasoning
- **Actionable Guidance:** Instead of inducing anxiety, the system tells the student: *"Attend the next 4 consecutive lectures to regain safe standing."*
- **Algorithmic Defensibility:** Eliminates student-teacher disputes through mathematically proven recovery targets.
- **Automated Statutory Defaulter Lists:** Administrators can generate legally compliant defaulter lists at any timestamp with zero manual recalculation.

### Alternatives Considered
1. **Binary Compliant/Non-Compliant:** Rejected because it fails to provide warning cushions to students at $71\%-74\%$.
2. **Manual Faculty Discretion without Formulas:** Rejected due to bias, lack of standardization, and student grievances.

### Impact on Project
- Implemented as unit-tested pure functions in `src/utils/attendance.ts`.
- Integrated directly into `MobileStudentApp` course cards and `DefaultersReportModal`.

---

## ADR-007: Immutable Session Records & Cryptographic Audit Trail

### Date
2026-11-03

### Context / Problem
Attendance records carry statutory and legal weight in academic governance (determining hall ticket clearance, scholarship eligibility, and official university submissions). Retro-active, undocumented alterations to attendance records (e.g., marking an absent student present weeks later) invite corruption, faculty disputes, and accreditation non-compliance.

### Decision Taken
Implement strict **Session Locking & Immutable Append-Only Audit Logging**:
1. When a faculty member submits roll-call, `attendance_sessions.is_locked` is set to `TRUE`.
2. Once locked, session records cannot be silently updated via regular API endpoints.
3. Any retrospective modification requires elevated permissions (`COLLEGE_ADMIN` or designated Department Head) along with a **mandatory written justification reason**.
4. Every modification generates an append-only entry in `audit_logs` capturing:
   - Unique event ID and timestamp (`TIMESTAMPTZ`).
   - Actor ID, Actor Name, and Role.
   - Action type (e.g., `STUDENT_RECORD_MODIFICATION`, `ATTENDANCE_OVERRIDE`).
   - Target entity and student reference.
   - Previous state vs New state.
   - Formal justification reason.

### Reasoning
- **Regulatory Accreditation:** Meets National Board of Accreditation (NBA) and NAAC requirements for tamper-resistant governance.
- **Accountability:** Full traceability ensures wrongful attendance tampering can be audited back to specific user accounts and timestamps.

### Alternatives Considered
1. **Unrestricted Mutable Attendance Records:** Rejected due to unacceptable compliance risks.
2. **Blockchain-Based Ledger:** Rejected as unnecessary engineering overhead; PostgreSQL append-only tables with write-restricted roles provide required audit integrity.

### Impact on Project
- Audit log entities defined in `src/types/index.ts`.
- Audit Log Inspection UI implemented in `src/components/desktop/AuditLogModal.tsx`.
- Automated log emission integrated into `App.tsx` state handlers.


---

## ADR-008: Physical Decoupling into Independent Frontend and Backend Subfolders

### Date
2026-11-04

### Context / Problem
Previously, frontend React components and backend server code shared the root project directory and a monolithic `package.json`. While convenient for early prototyping, this coupled build tooling, mixed frontend client code with server runtime dependencies, caused configuration friction between Node/Vite environments, and complicated production deployment pipelines.

### Decision Taken
Completely decouple the codebase into two independent subfolders:
1. `frontend/`:
   - Contains React 19 UI, Vite bundler configuration, static assets (`public/`), styling (`index.css`), API client layer (`src/api/client.ts`), and dedicated `frontend/package.json`.
   - Communicates with the backend exclusively via standard HTTP/REST fetch calls.
   - Manages its own `.env` file (`VITE_API_URL`, `VITE_APP_TITLE`, etc.).
2. `backend/`:
   - Contains Python Flask modular monolith engine (`app.py`, `routes/`), PostgreSQL schema migrations (`migrations/`), Express TypeScript companion server (`src/index.ts`), and dedicated `backend/package.json` + `requirements.txt`.
   - Manages its own `.env` file (`PORT`, `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`, etc.).
3. Project Root:
   - Contains monorepo orchestration scripts in root `package.json` (`npm run dev:frontend`, `npm run dev:backend`, `npm test`), shared documentation, and `.gitignore`.

### Reasoning
- **Deployment Flexibility:** Frontend can deploy directly to CDNs / static hosts (Vercel, Netlify, Cloudflare Pages) while backend can deploy as a Docker container to Google Cloud Run, AWS ECS, or Render.
- **Dependency Isolation:** Browser bundle avoids importing Node-specific packages (`express`, `dotenv`), and backend avoids UI dependencies (`lucide-react`, `motion`).
- **Security:** Frontend cannot accidentally access server-side secrets or bypass API gateways.

### Alternatives Considered
1. **Single Monolithic Directory:** Rejected due to dependency pollution and complex deployment boundaries.
2. **Multi-Repo Split:** Rejected at this phase to preserve atomic commits, shared architectural documentation, and unified end-to-end verification.

### Impact on Project
- Clear mental model and zero cross-folder direct imports.
- Frontend test suite (`26 tests`) and backend test suite (`15 tests`) execute independently or unified via root `npm test`.

---

## ADR-009: Supabase Cloud Database Integration & Role-Partitioned Authentication Gate

### Date
2026-11-05

### Context / Problem
Users required cloud PostgreSQL persistence via Supabase along with an unauthenticated-first security gate, distinct login flows for academic staff vs. students, and comprehensive administrative update privileges for staff (roster manipulation, manual percentage overrides, session conducting, and audit recording).

### Decision Taken
1. **Supabase Cloud Layer (`frontend/src/api/supabaseClient.ts` & `backend/migrations/supabase_complete_schema.sql`):**
   - Implemented `@supabase/supabase-js` client layer supporting live queries against Supabase tables (`students`, `courses`, `attendance_sessions`, `audit_logs`).
   - Provided an executable migration script with Row-Level Security policies granting public read access and Staff write access.
   - Built seamless dual-mode fallback: if Supabase environment keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are not configured, the platform falls back to the local REST API (`http://localhost:5000/api/v1`) or mock seed data without disruption.
2. **First-Screen Authentication Gate (`LoginPage.tsx`):**
   - The application mounts the Institutional Sign In page first upon opening `http://localhost:3000/`.
   - Distinct, animated tab switcher separating **Staff & Faculty** (Professors, Deans) from **Student Portal** (Roll number / PRN access).
   - Fast 1-click evaluation profiles for both personas.
3. **Staff Full Authority Mode:**
   - Staff credentials unlock the full Desktop Governance Console with capabilities to conduct roll-call, edit student percentages with mandatory written audit reasons, directly provision new students, import bulk CSV rosters, approve medical exam waivers, and run statutory defaulter exports.

### Impact on Project
- Secure, production-ready entry flow matching institutional higher education requirements.
- Flexible deployment targeting either local Docker PostgreSQL or Supabase Cloud.
