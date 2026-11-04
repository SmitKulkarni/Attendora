# Changelog

All notable changes to the **Attendora** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **PostgreSQL 16+ Multi-Tenant Migration Suite:**
  - `migrations/001_initial_platform_schema.sql`: Platform metadata tables (`tenants`, `platform_superadmins`, `tenant_subscriptions`).
  - `migrations/002_tenant_scoped_schema.sql`: Tenant-scoped tables with `tenant_id` foreign keys and range partitioning on `attendance_records(session_date)`.
  - `migrations/003_row_level_security.sql`: Kernel-enforced Row-Level Security policies (`app.current_tenant_id`) and immutable audit trigger preventing updates/deletions.
  - `migrations/004_seed_data.sql`: Seed dataset for Maharashtra Engineering College baseline.
- **Python Flask Modular Monolith API (`backend/`):**
  - Application factory with CORS, request tenant context injection, and health check.
  - JWT authentication engine with fallback HMAC-SHA256 standard library support (`backend/auth.py`).
  - Domain route blueprints: `auth_routes.py`, `academic_routes.py`, `attendance_routes.py`, `reports_routes.py`, and `audit_routes.py`.
  - Automated unit test suite (`tests/test_phase2_backend.py`) verifying 7 critical endpoints.
- **Node.js Express Modular Server (`src/server/index.ts`):**
  - TypeScript runtime companion providing identical REST endpoints for zero-config local development.
- **Frontend API Client & Service Layer (`src/api/`):**
  - Robust HTTP client with Bearer token management, `X-Tenant-ID` header injection, and graceful offline fallback.
  - Service modules: `auth.ts`, `students.ts`, `attendance.ts`, `reports.ts`, `audit.ts`.
  - Live backend health indicator and optimistic mutation dispatching in `App.tsx`.
- **Phase 3: Hardware Integrations, Multi-Channel Alerts & PWA Offline:**
  - **Dynamic Rolling QR Code Engine (`src/utils/qrAttendance.ts`):** Cryptographically signed 10-second pseudo-TOTP token generator with Haversine GPS geo-fencing (50m classroom boundary) and anti-screenshot replay prevention.
  - **Faculty Classroom Projector Display (`DynamicQrDisplayModal.tsx`):** High-visibility projector view with animated 10s countdown ring, active geo-fence watermarking, and real-time student check-in counters.
  - **Student Mobile Scanner (`StudentQrScannerModal.tsx`):** In-app camera scanner targeting reticle with real-time location distance verification and instant audit confirmation.
  - **Multi-Channel Alert Dispatcher (`NotificationDispatchModal.tsx` & `notifications.ts`):** Automated dispatch of early-warning and debarment notices over SMS (Twilio), WhatsApp Business API, and official statutory emails.
  - **Campus Turnstile & Biometric IoT Reconciliation (`HardwareIntegrationModal.tsx` & `hardwareIntegration.ts`):** Ingestion engine reconciling physical RFID card taps and fingerprint scanner punches with scheduled course timetables.
  - **PWA Service Worker & Offline Sync Engine (`public/sw.js` & `offlineStorage.ts`):** IndexedDB/localStorage queuing enabling faculty roll-call in zero-connectivity basement classrooms with auto-flush on reconnection.
  - **Automated Test Suites:** Added 100% passing tests for QR TOTP tokens, Haversine geo-distance, hardware timetables, and offline queues (`qrAttendance.test.ts`, `offlineStorage.test.ts`, `test_phase3_hardware_and_alerts.py`).
- **Phase 4: AI Predictive Analytics, Enterprise SIS Ecosystem & Accreditation:**
  - **Gemini 2.5 AI Student Retention Engine (`src/utils/aiRetention.ts` & `AiRetentionModal.tsx`):** Machine learning trajectory analysis engine computing multi-factor risk scores, debarment forecasts, and personalized mentor counseling recommendations.
  - **Enterprise SIS & LMS Standard Integration (`src/utils/lmsIntegration.ts`):** IMS Global LTI 1.3 Advantage launch claim generator and Ellucian Banner / SAP enrollment sync adapter.
  - **Examination Hall-Ticket Gating & Medical Waiver Console (`hallTicketGating.ts` & `HallTicketGatingModal.tsx`):** Automated debarment barring of $< 75\%$ defaulters with administrative medical concession workflows (up to 10% statutory cap) and invigilator QR stamps.
  - **Statutory Accreditation Reporting Engine (`accreditationExport.ts` & `AccreditationExportModal.tsx`):** One-click official compliance packages for NBA (Criterion 2) and NAAC (SSR Metric 2.2) with digital institutional seals (`SEAL-GOV-XXXX-VERIFIED`).
  - **Comprehensive Test Suites:** Added unit tests verifying risk scores, LTI 1.3 claims, hall-ticket waivers, and NBA/NAAC seal integrity (`aiRetention.test.ts`, `hallTicketGating.test.ts`, `accreditationExport.test.ts`, `test_phase4_retention_and_governance.py`).

### Changed
- Updated `src/App.tsx` navigation bar with live `API Online (RLS Active)` connectivity pill.
- Standardized AI system prompts and persistent context in `phases.md` and `memory.md`.

---

## [1.0.0] - 2026-11-04

### Added
- **Product Requirements & Specifications:**
  - Added enterprise Product Requirements Document (PRD V1.0) baseline (`public/assets/aistudio/Paste_November_04__2026_-_2_26PM_e1af3c81`).
  - Added Academic Governance Design System specifications and Material Design 3 token definitions (`public/assets/aistudio/Image_13_44f4dff4.markdown`).
- **Desktop Academic Governance Dashboard:**
  - `DesktopDashboard.tsx`: High-density governance overview with fast access to all administrative operations.
  - `DashboardMetrics.tsx`: Real-time KPI summary (Total Students, Active Faculty, Campus-wide Attendance Rate, Critical Defaulters).
  - `AttendanceTrendChart.tsx`: Interactive SVG bar visualizer showing weekly attendance patterns.
  - `StudentRosterTable.tsx`: Searchable student roster with multi-attribute filtering (department, status) and manual percentage override triggers.
  - `RollCallModal.tsx`: Digital roll-call modal with one-click "Mark All Present", single-tap status toggling, and automatic session locking.
  - `DefaultersReportModal.tsx`: Statutory compliance report generator with custom threshold filters, shortfall breakdowns, CSV export, and print preview.
  - `CsvImportModal.tsx`: Bulk roster ingestion with real-time RFC-4180 parsing, email regex checking, duplicate roll detection, and row-level error reporting.
  - `AuditLogModal.tsx`: Immutable audit trail viewer with actor tracking, action filters, before/after state diffs, and justification inspection.
- **Student Mobile Experience (PWA):**
  - `MobileStudentApp.tsx`: Mobile-first student portal with touch gesture physics.
  - Circular SVG progress gauges for course compliance tracking (`Safe`, `Low`, `Critical`).
  - Timetable timeline displaying daily lecture slots, room locations, and faculty designations.
  - Predictive Shortage Recovery calculator (`calculateRecoveryClasses`).
  - Affordable Absences buffer calculator (`calculateAffordableAbsences`).
  - Notification drawer simulating real-time institutional alerts.
- **Presentation & Showcase System:**
  - `ShowcaseView.tsx`: Live dual-persona presentation shell allowing side-by-side or toggled role switching for institutional reviews.
  - `Sidebar.tsx`: Authoritative navigation rail with user profiles and department badges.
- **Domain Logic & Testing:**
  - `src/utils/attendance.ts`: Pure attendance percentage math, statutory compliance categorization, recovery calculations, CSV validation, and deep-link generation.
  - `src/utils/gesture.ts`: Touch gesture math for mobile physics.
  - `src/utils/attendance.test.ts`: Complete unit test coverage for statutory compliance and boundary conditions.
  - `src/utils/gesture.test.ts`: Unit test suite for touch interactions.

### Changed
- Migrated root container (`App.tsx`) to support unified state management, dynamic session additions, audit log appending, and instant deep-link routing.
- Upgraded UI styling to Tailwind CSS v4 using modern `@tailwindcss/vite` plugin.
- Standardized all domain models and interfaces in `src/types/index.ts`.

### Fixed
- Fixed division-by-zero vulnerability in `calculateAttendancePercentage` when conducted lectures equal zero, ensuring 100.0% safe baseline.
- Fixed duplicate roll number collisions during batch CSV parsing.
- Resolved boundary edge condition where attendance exactly at 75.0% was mistakenly classified as warning.

### Removed
- Removed legacy unpartitioned mock schemas and outdated static HTML prototypes.

---

## [0.5.0] - 2026-10-24

### Added
- **Multi-Tenancy & Data Architecture:**
  - Architectural blueprint for shared-database multi-tenancy with PostgreSQL Row-Level Security (RLS).
  - Designed domain schema: `tenants`, `users`, `departments`, `academic_batches`, `courses`, `student_enrollments`, `attendance_sessions`, and range-partitioned `attendance_records`.
- **Asynchronous Task Architecture:**
  - Architectural specification for Redis 7 task bus and RQ worker pools for background CSV ingestion and PDF compilation.
- **Core Domain Mathematics:**
  - Initial implementation of the 75% UGC/State statutory compliance rules.
  - Formulated the shortage recovery formula $\lceil(0.75 \times C - A) / 0.25\rceil$.

### Changed
- **Persistence Engine Migration:**
  - Formally pivoted primary database architecture from Firebase NoSQL to Relational PostgreSQL 16+ to guarantee ACID transactions and relational integrity.
- Transitioned backend architectural strategy from microservices to a Python Flask modular monolith.

### Fixed
- Addressed potential race conditions in concurrent faculty roll-call submissions via database-level unique constraints on `(course_id, batch_id, session_date, slot_start_time)`.

---

## [0.1.0] - 2026-10-12

### Added
- Initial project inception and stakeholder discovery for higher education attendance management.
- Baseline requirements document drafting core pain points: paper register tally errors, proxy attendance, and delayed statutory defaulter notices.
- Technology feasibility study evaluating web vs native mobile deployment.
- Initial Git repository initialization and workspace scaffolding.

