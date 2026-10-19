# ChangeLens — Project Charter & Requirements Specification
**Explainable Change-Impact & Quality Gate Intelligence for Manufacturing**  
*Document Version: 1.0 · Date: 19 October 2026*  
*Project Identity: ChangeLens · Tagline: "Every change. Every impact. Every decision justified."*

---

## 1. Project Charter & Research Question

### Core Research Question
> **Can an explainable, risk-aware change-impact system improve the completeness and consistency of engineering change reviews by connecting component dependencies, verification evidence and approval decisions?**

In complex manufacturing engineering, engineering changes are frequently evaluated using fragmented tools: static bills of materials (BOM), disconnected spreadsheet checklists, and isolated ticketing workflows. When physical assemblies are altered or opened on the production floor, subtle downstream impacts on testing protocols, inspection requirements, and regulatory compliance are often missed.

**ChangeLens** bridges this gap by unifying:
1. **Impact Intelligence**: Algorithmic dependency graph traversal to identify indirectly affected components, rework procedures, and verification tests.
2. **Quality Gates**: Deterministic evaluation of mandatory evidence and baseline configuration integrity.
3. **Explainable Decisions**: Transparent display of the specific rules, graph paths, and risks behind each gate recommendation.
4. **Automated Engineering Reports**: Single-source-of-truth traceable assessment documents generated across PDF, Word (DOCX), Excel (XLSX), and CSV.

---

## 2. Scope & Design Boundaries

### What ChangeLens Does
- **Linked Manufacturing Baseline**: Models components, specifications, processes, inspection criteria, and qualification tests as a versioned directed graph $G=(V, E)$.
- **Baseline Comparison**: Side-by-side comparison of baseline specification against proposed engineering modifications.
- **Explainable Traversal**: Uses rule-directed breadth-first search (NetworkX) with relationship-specific propagation filters to avoid indiscriminate node leakage while achieving 100% recall of safety-critical verification requirements.
- **Adaptive FMEA Decision Rules**: Enforces that Failure Modes with Severity $S \ge 8$ trigger mandatory airframe authority review, preventing low Occurrence or Detection numbers from obscuring safety risks.
- **Deterministic Quality Gates**: Evaluates gate conditions across milestones (`PRE_AUTHORIZATION_GATE`, `PRE_IMPLEMENTATION_GATE`, `CLOSURE_GATE`), returning structured results (`PASS`, `BLOCKED`, `REVIEW_REQUIRED`) with explicit blocking reasons and actionable corrective steps.
- **Role-Based Governance**: Strict enforcement of separation of duties (requester cannot self-approve or self-authorize; auditor has read-only access).
- **Immutable Append-Only Audit Trail**: Full chronological history of transitions, approvals, rejections, and evidence uploads.
- **Multi-Format Reporting**: Generates identical verified assessment documents across ReportLab PDF, python-docx DOCX, openpyxl XLSX, and pandas CSV.

### What ChangeLens Does NOT Claim To Do
- Reconstruct Boeing's proprietary internal IT systems or definitively determine the ultimate legal liability for the 737-9 MAX incident.
- Independently certify aircraft, approve safety-critical changes in production, or replace qualified licensed engineers.
- Assert that a component is safe merely because an algorithm calculates a low numerical RPN score.
- Claim that automated reporting or generic change dashboards are novel in isolation.
- Use generative AI to fabricate missing test results or authorize release transitions without human verification.

---

## 3. Existing-Product Benchmark & Defensible Novelty Boundary

| Capability | Established Industry Commercial Status | ChangeLens Novel Contribution |
| :--- | :--- | :--- |
| **Engineering Change Requests** | Commercial PLM (e.g. PTC Windchill, Siemens Teamcenter) provides basic workflow forms and revision tracking. | Lightweight, open-architecture modular monolith combining change definitions with live graph visualization. |
| **Dependency & Impact Analysis** | PTC Windchill supports upstream/downstream linked objects. | **Explainable graph traversal with traceable step-by-step paths** and plain-language engineering rationale explaining *why* an inspection or test is impacted. |
| **Risk Assessment (FMEA)** | Standalone FMEA spreadsheets or specialized APQP modules. | **Risk-adaptive verification rules**: FMEA records dynamically generate required verification gate checklist items based on change category and $S \ge 8$ escalation. |
| **Evidence Verification Tracking** | Generic document attachments in PLM/ERP. | **Cryptographic SHA-256 evidence hashing and quality gate evaluation** that returns structured `BLOCKED` states with explicit corrective unblocking actions. |
| **Automated Reports** | Standard report generation plug-ins. | **Single canonical report snapshot model** producing byte-level consistent data across PDF, DOCX, XLSX, and CSV with snapshot hash stamping. |
| **Separation of Duties** | Configured in enterprise access control. | **Architectural enforcement** preventing self-approvals, rejecting auditor state transitions, and detecting stale baseline snapshot mismatches (`AC-05`, `AC-06`). |

---

## 4. Primary Regulatory Reference: FAA Boeing 737-9 MAX Oversight
Primary source: *Federal Aviation Administration (FAA) Boeing 737-9 MAX Oversight Audits and Airworthiness Directives (2024)*.
- **Fact 1**: The Station 500 Mid-Exit Door Plug on Alaska Airlines Flight 1282 separated in flight due to upward translation allowed by missing retaining hardware.
- **Fact 2**: The door plug had been opened during fuselage completion in Renton, WA to rectify damaged cabin interior rivets, but no formal non-conformance traveler or work order was created.
- **Fact 3**: Re-installation occurred without secondary independent QA buy-off, torque verification, or cotter-pin lockwire confirmation.
- **System Design Consequence**: ChangeLens establishes explicit links between physical components (`C-104`, `C-105`), rework procedures (`P-301`), and inspection checkpoints (`I-401`), ensuring that shop-floor opening of assemblies cannot bypass digital quality gates.
