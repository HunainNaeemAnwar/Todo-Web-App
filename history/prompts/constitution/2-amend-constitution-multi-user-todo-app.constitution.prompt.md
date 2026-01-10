---
id: 2
title: Amend Constitution Multi User Todo App
stage: constitution
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-todo-console-app
user: hunain
command: /sp.constitution
labels: ["constitution", "upgrade", "web-app", "multi-user"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - /home/hunain/DO/it/.specify/memory/constitution.md
tests: []
---

## Prompt

```text
This is Phase II of this project:

We are building a multi-user todo web application that evolves from an existing console application.

CORE PRINCIPLES:
1. **Spec-Driven Development**: All implementation must come from specifications. No manual coding.
2. **Test-Driven Development**: Every feature must have corresponding tests written first.
3. **Clean Architecture**: Separate presentation, business logic, and data access layers.
4. **Security First**: Implement secure authentication and authorization.
5. **Code Quality**: Follow best practices, consistent naming, and proper documentation.

TECHNOLOGY CONSTRAINTS:
1. **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
2. **Backend**: FastAPI, SQLModel, Python 3.13+
3. **Database**: Neon Serverless PostgreSQL
4. **Authentication**: Better Auth with JWT plugin enabled
5. **Project Structure**: Monorepo as per specification guidelines
6. **Testing**: pytest for backend, Jest/React Testing Library for frontend
7. **API Design**: RESTful endpoints with proper status codes and error handling

DEVELOPMENT RULES:
1. Write tests before implementation for every feature
2. Update specifications before requesting code changes
3. Implement user isolation - users can only access their own data
4. Use environment variables for all secrets and configuration

QUALITY STANDARDS:
1. Minimum 80% test coverage
2. API response time under 200ms
3. Responsive design for mobile and desktop
4. Proper error handling and user feedback
5. Secure password hashing and JWT token handling
```

## Response snapshot

Updated the project constitution to reflect the transition from a single-user console application to a multi-user web application. The new constitution includes:

1. **Core Principles**: Updated to include Spec-Driven Development, Test-Driven Development, Clean Architecture, Security First, Code Quality Standards, Multi-User Isolation, and Authentication & Authorization.

2. **Technology Constraints**: Added specific requirements for Frontend (Next.js 16+, TypeScript, Tailwind), Backend (FastAPI, SQLModel, Python 3.13+), Database (Neon Serverless PostgreSQL), and API Design Standards.

3. **Development Rules**: Incorporated test-first implementation, specification updates, user data isolation, and environment configuration requirements.

4. **Quality Standards**: Defined performance requirements, user experience standards, error handling protocols, and security measures.

The constitution version has been incremented from 1.0.2 to 1.1.0 to reflect the major change from a console application to a web application with multi-user support.

## Outcome

- ✅ Impact: Successfully updated constitution to guide development of multi-user todo web application
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔄 Next steps: Update templates to align with new constitution principles
- 📋 Sync Impact Report: Version 1.0.2 → 1.1.0, complete overhaul of principles for web application