# TaskFlow Constitution

## Core Principles

### I. Spec-Driven Development (SDD)
All features begin with clear specifications. No code is written without:
- A `spec.md` defining requirements and acceptance criteria
- A `plan.md` with architecture and technical decisions
- A `tasks.md` with testable, incremental implementation steps

Documentation is not an afterthought—it is the foundation.

### II. Test-First (NON-NEGOTIABLE)
TDD is mandatory. The Red-Green-Refactor cycle is strictly enforced:
1. Write tests that define the contract
2. Verify tests fail (red)
3. Implement the minimal code to pass (green)
4. Refactor with confidence

Minimum 80% code coverage required. No exceptions.

### III. User Isolation & Security
Every user action must be scoped to the authenticated user:
- Row-level security for all data access
- JWT validation on every protected endpoint
- No trust in client-side data for authorization decisions

Security is not a feature—it is the foundation.

### IV. Small, Testable Commits
Changes must be small, focused, and independently verifiable:
- One concern per commit
- Each commit must pass all tests
- Prefer 10 small commits over 1 large commit

### V. Observability by Default
Every service must emit structured logs, metrics, and traces:
- Use structlog for structured logging
- Include correlation IDs for request tracing
- Log at appropriate levels (DEBUG, INFO, WARNING, ERROR)

You cannot debug what you cannot see.

### VI. Type Safety
All code must be strongly typed:
- Python: Type hints mandatory, mypy strict mode
- TypeScript: Strict mode enabled, no `any` types

Types are documentation that never lies.

## Security Requirements

### Authentication
- JWT tokens verified server-side on every request
- Tokens expire and refresh properly
- httpOnly cookies for session storage
- CORS properly configured for allowed origins only

### Data Protection
- No sensitive data in logs or error messages
- SQL injection prevention via ORM parameterized queries
- Input validation on all API boundaries
- Rate limiting on all endpoints (100 req/min default)

### Secrets Management
- No secrets in code (ever)
- `.env` files never committed to git
- `.env.example` files serve as templates
- Production secrets managed via secure secret store

## Performance Standards

### Response Times
- API endpoints: p95 < 200ms
- Database queries: p95 < 50ms
- AI chat responses: Stream within 1s

### Resource Limits
- Rate limiting: 100 requests/minute per IP
- Request body size: 1MB max
- Database connections: Use connection pooling

## Development Workflow

### Branch Strategy
- `main`: Production-ready code only
- `feature/<name>`: New features
- `fix/<name>`: Bug fixes
- `phase-<number>`: Major phase implementations

### Code Review Requirements
- All PRs require review before merge
- Tests must pass (CI/CD gate)
- No linter warnings
- PHR created for all significant changes

### Quality Gates
1. All tests pass
2. Coverage ≥ 80%
3. Type checking passes (mypy, tsc)
4. Linting passes (ruff, eslint)
5. No security vulnerabilities (bandit, npm audit)

## Documentation Standards

### Code Documentation
- Docstrings for all public functions
- Type hints for all parameters and returns
- Inline comments for complex logic only

### Architecture Documentation
- ADRs for all significant decisions
- API contracts in OpenAPI/Swagger format
- Database schema documented in `data-model.md`

### User Documentation
- README with quickstart
- API documentation auto-generated
- Changelog for all releases

## Technology Stack

### Backend
- **Language**: Python 3.12+
- **Framework**: FastAPI
- **ORM**: SQLModel (SQLAlchemy 2.0)
- **Database**: Neon Serverless PostgreSQL
- **Auth**: Better Auth with JWT
- **AI**: OpenAI Agents SDK + Gemini
- **Testing**: pytest with 80% coverage

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS
- **State**: React Context API
- **Auth**: Better Auth client
- **Testing**: Vitest + React Testing Library

### Infrastructure
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **Logging**: Structlog
- **Monitoring**: Custom observability middleware

## Governance

### Amendment Process
1. Propose change with justification
2. Discuss trade-offs
3. Update constitution
4. Create PHR documenting the change
5. Notify all contributors

This constitution supersedes all other practices. When in doubt, refer here.

### Compliance Verification
- All PRs must verify compliance with these principles
- Complexity must be justified
- Technical debt must be tracked and addressed

---

**Version**: 1.0.0 | **Ratified**: 2025-02-05 | **Last Amended**: 2025-02-05
