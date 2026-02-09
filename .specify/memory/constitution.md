# AI Conversational Todo Manager Constitution

## Document History
- **Phase I**: Console App - Core stateless architecture
- **Phase II**: Web App - Multi-user, authentication, clean architecture  
- **Phase III**: AI Conversational - MCP, ChatKit, AI agents
- **Phase IV**: Kubernetes - kubectl-ai, containers, deployment

**Current Version**: 2.0.0 | **Ratified**: 2025-02-09 | **Last Amended**: 2025-02-09

---

## Phase I: Core Architecture Principles

### I. Stateless Server Architecture
The server MUST remain stateless — no in-memory conversation state is permitted. Every request
MUST be handled independently, with all necessary context loaded from persistent storage.
This ensures horizontal scalability, fault tolerance, and consistent behavior across restarts.

Rationale: Stateless design enables horizontal scaling, simplifies deployment, and ensures
that no user conversations are lost during server restarts or failures.

### II. Test-Driven Development
Every feature must have corresponding tests written first. Unit, integration, and end-to-end
tests must be written before implementation code. This includes backend API tests with pytest
and frontend tests with Jest/React Testing Library. Minimum 80% test coverage must be maintained.

Rationale: TDD ensures code quality, prevents regressions, and provides living documentation
of expected behavior.

---

## Phase II: Web Application Principles

### III. Clean Architecture
The application must follow clean architecture principles with clear separation between
presentation, business logic, and data access layers. Frontend and backend must be developed
as separate but integrated components. Business logic must be isolated from UI concerns.

Rationale: Clean architecture enables maintainability, testability, and allows independent
evolution of layers.

### IV. Multi-User Isolation
The application MUST implement strict user isolation. Users can only access, modify, or delete
their own data. The system MUST enforce data access controls at the API level. Each user's
data MUST be properly segmented in the database. All queries MUST filter by user_id.

Rationale: User isolation is non-negotiable for multi-tenant applications. Prevents data leaks
and unauthorized access.

### V. Authentication & Authorization
Authentication MUST use Better Auth with JWT plugin enabled. User registration, login, password
reset, and session management must be properly secured. Every request MUST include a valid JWT
token. Role-based access control MUST be implemented where applicable.

Rationale: Secure authentication protects user data and enables proper access control.

### VI. Technology Stack
Frontend: Next.js 16+ with App Router, TypeScript, Tailwind CSS
Backend: FastAPI with SQLModel, Python 3.12+
Database: Neon Serverless PostgreSQL
All components must use comprehensive type hints.

Rationale: Consistent technology choices enable team productivity and code maintainability.

---

## Phase III: AI Conversational Principles

### VII. Persistent Conversation History
All conversation history MUST be persisted in Neon PostgreSQL using Conversation and Message
tables. Full conversation context MUST be loaded from the database on every request to enable
multi-turn support. No conversation state is stored in memory between requests.

Rationale: Persistent history provides continuity across sessions and enables conversation
analytics.

### VIII. AI Interaction via OpenAI Agents SDK + MCP
AI interactions MUST ONLY occur through OpenAI Agents SDK with tools exposed via MCP. Direct AI
API calls from agent logic are prohibited. All task CRUD operations MUST go through defined
MCP tools, not direct database calls.

Rationale: MCP provides a secure, observable interface for AI-tool interaction with logging
and access control.

### IX. MCP Tool Security & Design
All MCP tools MUST be secure by design, idempotent where possible, and MUST always return
structured JSON. Tools MUST validate inputs, enforce user isolation, and handle errors
gracefully. Tool calls and responses MUST be logged.

Rationale: MCP tools are the interface between AI and data. Consistent structured output enables
reliable parsing.

### X. Chat Experience & Error Handling
Chat responses MUST be friendly and confirmatory, including action feedback. Error messages
MUST be graceful and specific: "task not found," "unauthorized," "invalid input." Never
expose raw errors or system internals to users.

Rationale: User experience depends on clear, actionable feedback for trust building.

---

## Phase IV: Kubernetes Deployment Principles

### XI. AI-Assisted Kubernetes Operations
All Kubernetes operations MUST be executed via kubectl-ai. Manual kubectl apply with raw YAML
files is PROHIBITED. Every deployment, service creation, scaling, and debugging operation
MUST use kubectl-ai prompts. The kubectl-ai tool uses Gemini 2.5 Flash for intelligent
manifest generation.

Rationale: Consistent, auditable, AI-optimized Kubernetes management with human oversight.

### XII. Human Execution Workflow
Claude generates specifications and commands; Human executes in terminal. Claude NEVER executes
kubectl commands directly. All commands are documented in specs for human review before
execution. Human reports output to Claude for analysis and next steps.

Rationale: Human oversight of infrastructure changes enables iterative refinement and safety.

### XIII. Explicit Image Tagging
All container images MUST use explicit version tags (e.g., todo-frontend:v1.0, todo-backend:v1.0).
The "latest" tag is PROHIBITED for deployments. Version tags enable reproducible deployments
and clear rollback paths.

Rationale: Traceable deployments eliminate "works on my machine" problems.

### XIV. Resource Limit Enforcement
All deployments MUST define CPU and memory limits:
- Frontend: 500m CPU, 512Mi Memory
- Backend: 1000m CPU, 1Gi Memory
Requests SHOULD be set to 50% of limits.

Rationale: Prevents resource exhaustion and enables effective pod scheduling.

### XV. Configuration-Secret Separation
Non-sensitive configuration MUST use ConfigMaps. Sensitive data (API keys, database URLs)
MUST use Kubernetes Secrets. Secrets MUST NOT be hardcoded in container images.

Rationale: 12-factor app methodology with encrypted secret management.

### XVI. External Database Pattern
For local Kubernetes deployment, use EXTERNAL database services (Neon PostgreSQL). NO local
PostgreSQL containers or persistent volumes for database data.

Rationale: Reduces cluster complexity and leverages managed database services.

### XVII. NodePort for Local Development
Local development clusters MUST use NodePort for frontend access. Ingress is NOT required
for Minikube environments.

Rationale: Simplifies local development setup while maintaining production-like architecture.

### XVIII. Containerization Standards
Dockerfiles MUST use multi-stage builds to minimize image size. Images MUST include health
checks (CMD or HEALTHCHECK instruction). Containers MUST run as non-root users.

Rationale: Reduced attack surface, health verification, and security best practices.

### XIX. Rollback Capability
All deployments MUST support rollback to previous versions. kubectl-ai rollback commands:
`kubectl-ai "rollout undo deployment/<name>"`. Rollback verification MUST confirm pod health.

Rationale: Essential for incident response when deployments cause issues.

---

## Development Workflow

### XX. Specification-Driven Development
All implementation must come from specifications. No manual coding without corresponding
specifications. Every feature must be documented in specs before implementation begins.

Rationale: Ensures alignment between requirements and implementation with traceability.

### XXI. Verification Before Progression
Each deployment phase MUST be verified before proceeding. Verification includes: pod status
checks, endpoint validation, resource usage confirmation, manual browser testing.

Rationale: Gates prevent cascading failures and ensure component functionality.

---

## Governance

### XXII. Constitution Supersedence
This constitution SUPERSEDES all other development practices. In case of conflict, constitution
rules take precedence. Phase-specific constraints are binding for their respective phases.

### XXIII. Amendment Procedure
Constitution amendments require: documented rationale, approval, version update, PHR creation.
Major amendments (backward incompatible) require migration plan. Minor amendments (new
principles) require team notification.

Version bump:
- MAJOR: Backward incompatible governance changes
- MINOR: New principles added
- PATCH: Clarifications, wording fixes

### XXIV. Compliance Verification
All Pull Requests MUST verify compliance with constitution principles. Code review MUST check
AI tools usage compliance. Infrastructure changes MUST include constitution alignment verification.

---

## Command Execution Rules (Phase IV)

```
Claude (Plan Mode)          │  Human (Terminal Mode)
────────────────────────────┼─────────────────────────────
Generate specs              │  Execute commands
Create PHRs                 │  Verify results
Write tasks.md              │  Report issues
Document commands           │  Provide feedback
```

### kubectl-ai Commands Format
All Kubernetes operations through prompts like:
```
kubectl-ai "create namespace todo-app"
kubectl-ai "deploy todo-backend from image todo-backend:v1.0 with 2 replicas..."
kubectl-ai "rollout undo deployment/todo-backend -n todo-app"
```

**Version**: 2.0.0 | **Ratified**: 2025-02-09 | **Last Amended**: 2025-02-09
