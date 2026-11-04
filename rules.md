# AI Engineering & Project Rules

This document establishes the mandatory operational rules, coding standards, architectural guardrails, and quality requirements for **Attendora**. All AI coding assistants, autonomous agents, and human contributors must strictly follow these instructions at all times.

---

## The Prime Directive: Zero Functionality Regressions

> [!IMPORTANT]
> **NEVER break, degrade, or remove existing functionality unless explicitly requested by the user.**
> - Every change must preserve existing user flows across both Desktop and Mobile views.
> - Always run and maintain the project unit tests (`src/utils/*.test.ts`).
> - When modifying existing components or utilities, verify that all consumer props, mock states in `App.tsx`, and TypeScript interfaces remain valid.
> - If an edit might alter an established API contract or UI workflow, request user clarification before proceeding.

---

## 1. Coding Standards

### 1.1 TypeScript & JavaScript
- **Strict Typing:** All code must pass strict TypeScript checks (`noImplicitAny`, `strictNullChecks`).
- **Forbidden Types:** Never use `any`. Use explicit interfaces, generics, or `unknown` with type narrowing.
- **Explicit Returns:** All exported functions and utility calculations must declare explicit return types.
- **Pure Domain Calculations:** Keep mathematical attendance computations (percentages, shortage recovery, cushion) strictly pure, side-effect free, and placed inside `src/utils/`. Do not embed business formulas inside React JSX render methods.
- **Safe Math & Zero Handling:** All division operations (e.g., attended / conducted) must guard against division by zero (e.g., return `100.0%` when conducted is `0`).

### 1.2 React 19 Architecture
- **Hook Discipline:** Use modern functional components with hooks (`useState`, `useMemo`, `useCallback`, `useRef`).
- **State Encapsulation:** View-specific state (modals, active tabs, filters) lives in the local component; application-wide operational state (active user, sessions, roster, audit logs) lives in `App.tsx` or dedicated state providers.
- **Performance:** Memoize expensive table sorting, multi-attribute filtering, and chart trend computations using `useMemo`.
- **Clean Component Splitting:** If a component exceeds 400 lines, decompose it into smaller focused child components (e.g., table headers, row items, modal action bars).

### 1.3 Python & Backend Guidelines (Target Architecture)
- **PEP 8 Compliance:** Follow standard Python formatting (Black, Flake8).
- **Parameterized SQL:** Never use string formatting or concatenation to build SQL statements. Use SQLAlchemy or parameterized queries to prevent SQL injection.
- **Domain Modularity:** Organize backend code into bounded domain packages (`identity/`, `attendance/`, `reports/`, `notifications/`).
- **Status Codes & Error Schemas:** Return consistent JSON error envelopes:
  ```json
  {
    "error": {
      "code": "SESSION_LOCKED",
      "message": "Cannot modify an attendance session that has already been finalized.",
      "details": { "sessionId": "sess-123" }
    }
  }
  ```

---

## 2. Folder Structure Rules

The project enforces strict directory boundaries:

```
Attendora/
├── .aistudio/                  # AI Studio platform runtime configurations
├── public/                     # Static assets, institutional assets, design docs
│   └── assets/aistudio/        # PRD documents, color specifications, mockups
├── src/
│   ├── components/             # Reusable UI presentation layer
│   │   ├── desktop/            # Desktop Governance Dashboard components
│   │   │   ├── AttendanceTrendChart.tsx
│   │   │   ├── AuditLogModal.tsx
│   │   │   ├── CsvImportModal.tsx
│   │   │   ├── DashboardMetrics.tsx
│   │   │   ├── DefaultersReportModal.tsx
│   │   │   ├── DesktopDashboard.tsx
│   │   │   ├── RollCallModal.tsx
│   │   │   └── StudentRosterTable.tsx
│   │   ├── mobile/             # Student Mobile PWA components
│   │   │   └── MobileStudentApp.tsx
│   │   ├── ShowcaseView.tsx    # Presentation side-by-side role toggle view
│   │   └── Sidebar.tsx         # Institutional desktop navigation drawer
│   ├── data/                   # Initial fixtures and mock data stores
│   │   └── mockData.ts
│   ├── types/                  # Single source of truth for TypeScript types
│   │   └── index.ts
│   ├── utils/                  # Pure utility functions and unit tests
│   │   ├── attendance.ts       # Compliance calculation & CSV validation engine
│   │   ├── attendance.test.ts  # Node test suite for attendance logic
│   │   ├── gesture.ts          # Mobile touch and swipe physics
│   │   └── gesture.test.ts     # Mobile gesture test cases
│   ├── App.tsx                 # Root application container & presentation shell
│   ├── index.css               # Tailwind CSS v4 styling & typography setup
│   └── main.tsx                # React DOM entrypoint
├── decisions.md                # Architecture & Product Decision Records (ADRs)
├── rules.md                    # This persistent rulebook
├── memory.md                   # Long-term system context & tech memory
├── phases.md                   # Phased implementation roadmap & milestone WBS
├── changelog.md                # Chronological change log
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite bundler & plugin configuration
```

### Folder Placement Rules
- **Do not create files in the root of `src/`** except for core entrypoints (`App.tsx`, `main.tsx`, `index.css`).
- Place desktop-specific admin components in `src/components/desktop/`.
- Place student-specific mobile components in `src/components/mobile/`.
- Domain interfaces must be declared in `src/types/index.ts` rather than local component files.
- Companion test files must be co-located with their subject in `src/utils/` (e.g., `feature.ts` and `feature.test.ts`).

---

## 3. Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | `PascalCase.tsx` | `StudentRosterTable.tsx`, `RollCallModal.tsx` |
| **Utility Modules** | `camelCase.ts` | `attendance.ts`, `gesture.ts` |
| **Unit Test Files** | `camelCase.test.ts` | `attendance.test.ts`, `gesture.test.ts` |
| **Interfaces & Types** | `PascalCase` | `StudentRecord`, `AttendanceSession`, `ComplianceTier` |
| **Functions & Methods** | `camelCase` | `calculateAttendancePercentage()`, `handleUpdateStudent()` |
| **Constants & Globals** | `UPPER_SNAKE_CASE` | `DEFAULT_COMPLIANCE_CONFIG`, `INITIAL_USERS` |
| **State Variables** | `camelCase` | `isRollCallOpen`, `activeSidebarTab`, `deepLinkReport` |
| **CSS Class Utilities** | `kebab-case` | Tailwind utilities: `flex items-center justify-between` |
| **Database Tables** | `snake_case` (plural) | `tenants`, `users`, `attendance_sessions`, `audit_logs` |
| **Database Columns** | `snake_case` | `tenant_id`, `roll_number`, `is_locked`, `session_date` |
| **REST API Routes** | `kebab-case` / lowercase | `/api/v1/attendance-sessions`, `/api/v1/students/bulk` |

---

## 4. UI/UX Consistency Rules

Attendora adheres to the **Academic Governance Design System** specified in `public/assets/aistudio/Image_13_44f4dff4.markdown`:

### 4.1 Color Hierarchy & Semantics
- **Primary Navy (`#091426`):** Used for top navigation bars, authoritative headers, institutional identity.
- **Surface Background (`#F8FAFC` / `#F8F9FF`):** Clean, calm canvas for high data density without visual fatigue.
- **Card Container Surface (`#FFFFFF`):** High elevation contrast with crisp hairline borders (`#E2E8F0` / `#CBD5E1`).
- **Interactive Blue (`#0051D5` / `#316BF3`):** Action buttons, selected tab indicators, primary interactive links.
- **Compliant Green (`#00A472` / `#059669`):** Safe attendance status ($\ge 75\%$), present marks, verified badges.
- **Warning Amber (`#D97706` / `#F59E0B`):** Pre-defaulter warning ($70.0\% - 74.9\%$), pending medical review.
- **Critical / Error Red (`#BA1A1A` / `#DC2626`):** Statutory defaulter status ($< 70.0\%$), absent marks, error banners.

### 4.2 Typography & Data Presentation
- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Numbers & Metrics:** Use tabular numerals (`font-mono` or `font-semibold`) for attendance rates, roll numbers, and dates to align clean columns.
- **Line Heights & Padding:** Data rows must maintain consistent vertical height (min `44px` on mobile, `48px` on desktop) for touch accuracy and visual scanability.

### 4.3 Mobile & Accessibility Standards
- **Touch Target Boundary:** All clickable buttons, pills, and icons must meet the minimum $44 \times 44\text{px}$ touch target area.
- **Keyboard Navigation:** Modals must close on `Escape` key press and retain focus within the dialog.
- **Accessibility:** Ensure WCAG AA contrast ratio ($\ge 4.5:1$) for all body text against card backgrounds.
- **Empty States:** Tables and lists must render informative empty states with clear iconography and call-to-action buttons.

---

## 5. Git Commit Rules

The project strictly follows the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### 5.1 Format
```
<type>(<scope>): <concise description in imperative mood>

[optional body explaining rationale and impact]

[optional issue or PR reference]
```

### 5.2 Commit Types
- `feat`: A new feature for the user or platform.
- `fix`: A bug fix or compliance defect correction.
- `docs`: Documentation updates or additions (ADRs, rules, memory, changelog).
- `style`: Formatting, whitespace, visual alignment (no code logic changes).
- `refactor`: Code reorganization that neither adds a feature nor fixes a bug.
- `perf`: Performance optimizations (indexing, memoization, lazy loading).
- `test`: Adding missing tests or correcting existing test suites.
- `chore`: Maintenance tasks, dependency updates, configuration tweaks.

### 5.3 Allowed Scopes
`desktop`, `mobile`, `api`, `auth`, `db`, `rules`, `reports`, `audit`, `csv`, `docs`.

### 5.4 Examples
- `feat(desktop): implement batch roll-call modal with one-click mark all present`
- `fix(calc): correct floor rounding in affordable absence calculator`
- `docs(adr): record transition from Firebase NoSQL to partitioned PostgreSQL`
- `test(csv): add unit test coverage for duplicate roll number detection`

---

## 6. Security and Environment Variable Rules

### 6.1 Multi-Tenant Row-Level Security (RLS)
- Every database interaction within tenant scope must execute with `app.current_tenant_id` populated from the authenticated JWT session claims.
- Never write queries that bypass the tenant parameter.
- Never rely solely on client-side role assertions; validate permissions (`ADMIN`, `FACULTY`, `STUDENT`) on every API boundary.

### 6.2 Environment Variables & Secrets Management
- **Zero Secrets in Code:** Never commit passwords, private keys, database URLs, or API tokens into git.
- **Required Environment Keys:**
  - `GEMINI_API_KEY`: Injected for server-side AI compliance analysis.
  - `APP_URL`: Canonical URL for deep link generation and OAuth callbacks.
  - `DATABASE_URL`: PostgreSQL connection string with TLS enabled.
  - `REDIS_URL`: Redis bus connection string.
  - `JWT_SECRET`: Minimum 256-bit cryptographically random signing key.
- All environment keys must be documented with placeholder values in `.env.example`.

### 6.3 Input Validation & Sanitization
- All uploaded CSV roster files must be parsed with strict header and field-level validation (`validateCsvRoster`) before persistence.
- Sanitize user-provided strings (such as faculty modification notes) to prevent Cross-Site Scripting (XSS).
- File upload limits: Maximum CSV upload size is 5MB; reject non-CSV MIME types.

---

## 7. Audit & Compliance Governance Rules

- **Immutable Audit Trail:** Any action that modifies an attendance record or student rate must append a row to `audit_logs`.
- **Reason Mandate:** Overriding a finalized roll-call session requires a non-empty `reason` string from the user.
- **Defaulter Generation:** Defaulters reports must calculate dynamically against the statutory threshold ($75.0\%$) and record generation timestamp for legal accreditation verification.

