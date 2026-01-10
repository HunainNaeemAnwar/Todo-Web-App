# ADR-0002: Tech Stack Selection

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-07
- **Feature:** task-management-app
- **Context:** Selection of technology stack for full-stack web application including frontend, backend, and infrastructure components to create a modern, type-safe application with excellent developer experience

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

- Frontend Framework: Next.js 16+ with App Router
- Frontend Language: TypeScript 5.0+
- Frontend Styling: Tailwind CSS
- Backend Framework: FastAPI with async support
- Backend Language: Python 3.13+
- ORM: SQLModel
- Authentication: Better Auth
- State Management: React Context (avoiding Redux Toolkit/Zustand complexity)
- Logging: Structured logging with structlog
- API Design: RESTful API with JWT authentication and RFC 7807 error responses

## Consequences

### Positive

- Excellent type safety and developer experience with TypeScript and Python type hints
- Modern, well-supported frameworks with strong community backing
- Consistent architecture with clear separation of concerns
- Strong performance characteristics with async backend and optimized frontend
- Built-in developer tools and debugging capabilities
- Rich ecosystem of libraries and extensions

### Negative

- Learning curve for team members unfamiliar with Next.js or FastAPI
- Potential framework lock-in and dependency on specific ecosystems
- Larger bundle sizes with Next.js compared to lighter frameworks
- Complexity of managing two different language ecosystems (JavaScript/TypeScript and Python)
- Potential version compatibility challenges between different components

## Alternatives Considered

- React + Express: More complex setup, less type safety, more boilerplate code
- Angular + .NET: Heavier framework, more complex for this use case, steeper learning curve
- Vue + Spring Boot: Different ecosystem, less integration with Better Auth, less modern tooling
- Remix + SolidJS: Alternative approach but less proven ecosystem for this use case

## References

- Feature Spec: /specs/001-task-management-app/spec.md
- Implementation Plan: /specs/001-task-management-app/plan.md
- Related ADRs: ADR-0001 (Authentication Architecture), ADR-0003 (Database Strategy)
- Evaluator Evidence: /history/prompts/task-management-app/6-create-implementation-plan.plan.prompt.md
