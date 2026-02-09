---
id: "008"
title: "Constitution update for Phase IV Kubernetes deployment"
stage: "constitution"
date: "2026-02-09"
surface: "agent"
model: "minimax-m2.1-free"
feature: "004-local-kubernetes-deployment"
branch: "feat/phase-iv-kubernetes-deployment"
user: "hunain"
command: "Update constitution.md for Phase IV Kubernetes deployment rules"
labels: ["constitution","kubernetes","kubectl-ai","phase-iv"]
links:
  spec: "specs/004-local-kubernetes-deployment/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - ".specify/memory/constitution.md"
tests:
  - "null"
---

## Prompt

Update the constitution.md file to include Phase IV specific rules for Kubernetes deployment:

Requirements to include:
1. AI-Assisted Kubernetes Operations - kubectl-ai mandatory for all K8s operations
2. Human Execution Workflow - Claude generates specs/commands, Human executes
3. Explicit Image Tagging - Use v1.0 tags, NO "latest"
4. Resource Limit Enforcement - Frontend: 500m CPU/512Mi, Backend: 1000m CPU/1Gi
5. Configuration-Secret Separation - ConfigMap for config, Secrets for sensitive data
6. External Database Pattern - Use Neon PostgreSQL externally, no local containers
7. NodePort for Local Development - Use NodePort, no Ingress for Minikube
8. Containerization Standards - Multi-stage builds, health checks, non-root users
9. Helm as Optional Tool - kubectl-ai preferred, Helm optional
10. Verification Before Progression - Verify each phase before proceeding
11. Documentation Requirements - Document all kubectl-ai commands
12. Rollback Capability - Support rollback via kubectl-ai

IMPORTANT CONSTRAINTS:
- NO Gordon available - use standard docker build commands
- Human runs ALL commands manually in terminal
- Claude generates specs ONLY - no direct execution

Update version from 1.0.0 to appropriate version (MINOR for adding new principles).

## Response snapshot

Updated constitution.md with 12 new principles for Phase IV:
- I. AI-Assisted Kubernetes Operations (kubectl-ai mandatory)
- II. Human Execution Workflow (Claude specs, Human terminal)
- III. Explicit Image Tagging (v1.0 tags only)
- IV. Resource Limit Enforcement (CPU/memory limits defined)
- V. Configuration-Secret Separation (ConfigMap vs Secrets)
- VI. External Database Pattern (Neon, no local containers)
- VII. NodePort for Local Development (simplified networking)
- VIII. Containerization Standards (multi-stage, health checks)
- IX. Helm as Optional Tool (kubectl-ai preferred)
- X. Verification Before Progression (gate each phase)
- XI. Documentation Requirements (PHR, commands documented)
- XII. Rollback Capability (kubectl-ai rollback commands)

Updated Governance sections:
- XIII. Constitution Supersedence
- XIV. Amendment Procedure
- XV. Compliance Verification

Version bumped: 1.0.0 → 1.1.0 (MINOR - new principles added)

## Outcome

- ✅ Impact: Constitution now governs Phase IV Kubernetes deployment with AI-assisted operations, explicit image tagging, resource limits, and human execution workflow
- 🧪 Tests: null
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: "Generate spec.md for Phase IV"
- 🧠 Reflection: Added comprehensive deployment-specific principles following constitution template

## Evaluation notes (flywheel)

- Failure modes observed: "null"
- Graders run and results (PASS/FAIL): "null"
- Prompt variant (if applicable): "null"
- Next experiment (smallest change to try): "null"
