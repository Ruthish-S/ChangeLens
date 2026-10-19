# ChangeLens
### Explainable Change-Impact & Quality Gate Intelligence for Manufacturing
**Tagline: Every change. Every impact. Every decision justified.**  
*Version: 1.0.0 · Date: 19 October 2026 · Project Grounded in Boeing 737-9 MAX Case Study*

---

## 1. Project Overview & Core Research Question

> **Can an explainable, risk-aware change-impact system improve the completeness and consistency of engineering change reviews by connecting component dependencies, verification evidence and approval decisions?**

ChangeLens is an engineering decision-support platform designed to connect manufacturing change management, engineering impact analysis, risk assessment (FMEA), verification evidence, leadership accountability, and automated technical reporting in one coherent system.

The project is grounded in the **Boeing 737-9 MAX production-quality case** (fuselage station 500 mid-exit door plug assembly), aligned with the **Innovation and Leadership Management (ILM)** syllabus, and evaluated through a working software prototype.

---

## 2. Core Capabilities & Architecture

ChangeLens is structured as an explainable modular monolith divided into eight logical modules:

1. **Configuration Registry**: Versioned manufacturing baselines modeling components, specifications, rework procedures, inspection requirements, and qualification tests as a directed graph $G=(V, E)$.
2. **Change Workspace**: Side-by-side baseline comparison highlighting proposed modifications against active baseline configurations.
3. **Impact Engine**: Rule-directed dependency traversal powered by NetworkX that maps changed components to downstream tests and inspections with plain-language engineering explanations and traceable paths.
4. **Risk Engine**: AIAG/VDA-adapted FMEA calculating $RPN = S \times O \times D$ and enforcing mandatory escalation for High Severity ($S \ge 8$) failure modes.
5. **Quality Gate Engine**: Deterministic evaluation of mandatory conditions returning structured `PASS`, `BLOCKED`, `REVIEW_REQUIRED` states with explicit blocking reasons and corrective actions.
6. **Workflow & Governance Engine**: Role-based state machine with architectural separation of duties (preventing self-approvals and unauthorized state transitions).
7. **Audit Service**: Append-only event stream logging all transitions, review decisions, and cryptographic SHA-256 evidence hashes.
8. **Automated Reporting Engine**: Single canonical data snapshot compiled into formatted ReportLab PDF, python-docx DOCX, openpyxl XLSX, and pandas CSV.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, `@xyflow/react` (React Flow), Recharts, Lucide React.
- **Backend API**: Python 3.14, FastAPI 0.146, Pydantic 2.14, SQLAlchemy 2.1, Uvicorn.
- **Graph Algorithms**: NetworkX 3.7 (deterministic BFS traversal with relationship-guided propagation).
- **Document & Data Generation**: ReportLab 5.0 (PDF), python-docx 1.2 (DOCX), openpyxl 3.1 (XLSX), pandas 3.0 (CSV).
- **Verification & Testing**: pytest 9.1 (19 automated tests covering AC-01 to AC-12 with 100% pass rate).

---

## 4. Quickstart Setup & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup & Automated Tests
```bash
# Navigate to repository root
cd c:\ilm

# Seed database with synthetic Boeing 737-9 MAX configuration
python -m backend.app.core.seed_data

# Run complete automated verification test suite (AC-01 through AC-12)
python -m pytest backend/tests -v
```

### 2. Start the Backend API Server
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Start the Frontend Application
```bash
cd c:\ilm\frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 5. Step-by-Step Demonstration Walkthrough Script

Follow this script for a demonstration of the engineering and governance capabilities:

### Step 1: Overview Dashboard (`/overview`)
- Inspect the high-level KPI cards: Total Changes, Blocked Quality Gates, Active Reviews, High-Severity Risks ($S \ge 8$), Evidence Completeness Rate (%), and Median Review Cycle Time (Hours).
- Review **Plot 2 (Risk Landscape)**, **Plot 3 (Gate Bottlenecks)**, **Plot 4 (Review Cycle Time Trends)**, and **Plot 5 (Evidence Completeness Distribution)**.

### Step 2: Change Workspace (`/changes`)
- Select Change Request **`CCR-2026-0001`** ("Mid-Exit Door Plug Material Substitution").
- Review the side-by-side comparison table: baseline material (`Al 7075-T651`) versus proposed alloy (`Al 2024-T351 Clad`), with the highlighted diff and engineering rationale.
- Click **"Run Impact Traversal"** to execute the NetworkX BFS traversal across the Station 500 baseline.

### Step 3: Interactive Impact Explorer (`/impact`)
- Interact with the React Flow dependency graph.
- Click on node **`T-501`** (Fuselage Joint Static Proof Pressure Test) or **`I-401`** (Retaining Bolt Torque Buy-Off Inspection).
- Inspect the slide-over details drawer showing the exact step-by-step path:
  `C-104 (Door Plug) -> [ASSEMBLED_INTO] -> C-101 (Fuselage Frame) -> [VERIFIED_BY] -> T-501 (Proof Pressure Test)`.
- Review the plain-language explanation and mandatory verification action.

### Step 4: Risk Management & Controls (`/risks`)
- Inspect the FMEA register with $S, O, D$ ratings and calculated $RPN$.
- Note **FM-01** ($S=9$) and **FM-02** ($S=10$): both trigger the **YES (S ≥ 8)** red badge, activating mandatory escalation rules.
- Click **"Add Failure Mode"** to demonstrate automatic RPN calculation and adaptive requirement generation.

### Step 5: Verification Evidence & Quality Gates (`/evidence`)
- Observe that **Gate 1 (Pre-Authorization Gate)** is currently **`BLOCKED`** in Signal Red.
- Read the explicit **Blocking Reasons** (missing proof pressure test `T-501` and retaining bolt torque buy-off `I-401`).
- Read the **Corrective Actions** explaining what physical documentation must be submitted.
- Click **"Upload Evidence"** on requirement `REQ-FASTENER-RETENTION-02`, provide a file name and source certificate, and observe the instant SHA-256 hash generation.
- Switch persona to **Dr. Elena Rostova (QA Lead)** in the sidebar and click **"QA Review"** &rarr; **ACCEPTED**.
- Watch the Quality Gate re-evaluate.

### Step 6: Governance & Separation of Duties (`/approvals`)
- With **Marcus Vance (Requester)** selected, attempt to submit an `APPROVED` decision.
- Observe the immediate rejection: `Separation of Duties Violation: Requester cannot approve their own change request (AC-05)`.
- Switch persona to **Arthur Pendelton (Chief Airframe Engineer / Approver)** and submit formal approval with rationale.
- Inspect the append-only audit trail logging the decision with timestamp and reviewer role.

### Step 7: Reports & Multi-Format Exports (`/reports`)
- Click **"Generate New Assessment Snapshot"**.
- Download and inspect the exported documents:
  - **PDF Document**: Formatted ReportLab document with numbered sections, document control, tables, and page numbers.
  - **Word DOCX**: python-docx styled document.
  - **Excel XLSX**: openpyxl multi-sheet workbook (Summary, Impact Matrix, FMEA Register, Evidence).
  - **CSV**: Raw tabular data for spreadsheet analytics.

### Step 8: ILM Case Study Alignment (`/ilm`)
- Open the ILM Case Study tab to review the **Weighted Decision Matrix** (scoring ChangeLens at 4.90/5.00 against paper checklists and digital trackers).
- Inspect the **Fishbone diagram** with 3-category epistemic labels:
  - `[DOCUMENTED EVIDENCE]` (Verified FAA oversight facts)
  - `[ANALYTICAL JUDGEMENT]` (Organizational inferences)
  - `[DESIGN DECISION]` (Software countermeasures)
- Review the **PESTEL**, **SWOT**, and **PDCA** continuous improvement roadmap.

---

## 6. Industry References & Standards Alignment

- **ISO 9001:2026**: Quality management system principles and controlled manufacturing change processes.
- **ISO 10007:2017**: Configuration management guidelines, baseline identification, and change accounting.
- **ISO 31000:2018**: Risk management principles, FMEA assessment, and risk-adaptive verification.
- **NIST SP 800-218 (SSDF v1.1)**: Secure software development practices, input validation, role-based authorization, and cryptographic integrity.
- **FAA Oversight Actions (2024)**: Boeing 737-9 MAX mid-exit door plug production compliance directives.
- **PTC Windchill Documentation**: Industry baseline benchmark for change-impact analysis across linked objects.

---

## 7. Project Structure

```
changelens/
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client contracts
│   │   ├── components/      # Sidebar and global UI components
│   │   ├── features/
│   │   │   ├── overview/    # Dashboard & Recharts visualizations
│   │   │   ├── changes/     # Side-by-side baseline workspace
│   │   │   ├── impact/      # React Flow interactive dependency graph
│   │   │   ├── risks/       # FMEA register & S>=8 escalation
│   │   │   ├── evidence/    # Quality gate logic & evidence verification
│   │   │   ├── approvals/   # Review queue & separation of duties
│   │   │   ├── reports/     # Multi-format report export interface
│   │   │   └── ilm/         # ILM case study & decision matrix
│   │   ├── App.tsx          # Root application component
│   │   └── index.css        # Tailwind v4 styles & industrial palette
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/v1/          # FastAPI routers (changes, impact, risks, etc.)
│   │   ├── models/          # SQLAlchemy 2.0 relational schema
│   │   ├── schemas/         # Pydantic v2 typed request/response contracts
│   │   ├── services/
│   │   │   ├── impact_engine/    # NetworkX rule-directed BFS traversal
│   │   │   ├── risk_engine/      # AIAG/VDA FMEA engine
│   │   │   ├── gate_engine/      # Deterministic quality gate engine
│   │   │   ├── workflow_engine/  # State machine & separation of duties
│   │   │   ├── audit_service/    # Append-only event logger
│   │   │   └── report_engine/    # Multi-format generator (PDF, DOCX, XLSX, CSV)
│   │   ├── analytics/            # Canonical KPI metrics reconciliation
│   │   ├── core/                 # DB engine, settings, and seed script
│   │   └── main.py               # FastAPI entrypoint & CORS config
│   └── tests/               # 19 automated tests (pytest) verifying AC-01 to AC-12
├── docs/
│   ├── requirements/        # Project charter & research question
│   ├── architecture/        # Architecture & ER diagrams
│   ├── management_analysis/ # Complete ILM workbook (PESTEL, SWOT, Fishbone)
│   └── test_reports/        # Acceptance test report & synthetic oracle
├── README.md
└── pyproject.toml
```

---

*ChangeLens — Every change. Every impact. Every decision justified.*
