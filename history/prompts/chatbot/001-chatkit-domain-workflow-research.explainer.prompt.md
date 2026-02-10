---
id: "001"
title: "ChatKit domain and workflow ID research"
stage: "explainer"
date: "2026-02-10"
surface: "agent"
model: "minimax-m2.1-free"
feature: "chatbot"
branch: "feat/phase-iv-kubernetes-deployment"
user: "hunain"
command: "Research ChatKit domain and workflow ID configuration"
labels: ["chatkit","debugging","authentication"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - /home/hunain/DO/it/frontend/src/app/api/chatkit/session/route.ts
  - /home/hunain/DO/it/backend/src/chatkit/service.py
  - /home/hunain/DO/it/k8s/helm/todo-app/templates/configmap.yaml
tests:
  - "null"
---

## Prompt

Use context7 mco to search about domain and workflow id of chaktit and how to get it

## Response snapshot

- Used Context7 MCP to query OpenAI ChatKit documentation
- Found key information about ChatKit credentials:
  - **Workflow ID**: Created in OpenAI Agent Builder (https://platform.openai.com/agent-builder)
  - **Domain Key**: Used for domain allowlisting/security
  - **Client Secret**: Obtained via backend API call to OpenAI ChatKit sessions endpoint
- Discovered the root cause of frontend fetch failure: hardcoded `https://api.yourdomain.com` in built image
- Identified that frontend needs to be rebuilt with proper environment variable handling

## Outcome

- ✅ Impact: Researched ChatKit configuration and identified workflow ID and domain key requirements
- 🧪 Tests: Not applicable - research session
- 📁 Files: Identified files requiring updates for ChatKit integration
- 🔁 Next prompts: Create agent workflow in OpenAI Agent Builder, update backend with workflow ID
- 🧠 Reflection: The frontend build cache contained hardcoded URL even after modifying .env.production; need to ensure clean build

## Evaluation notes (flywheel)

- Failure modes observed: Frontend Docker image still contained hardcoded URL from previous build
- Graders run and results (PASS/FAIL): N/A - research session
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Clean Docker build cache before rebuilding frontend
