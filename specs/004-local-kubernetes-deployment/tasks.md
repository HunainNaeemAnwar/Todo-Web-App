# Implementation Tasks: Local Kubernetes Deployment (Helm + kubectl-ai)

**Feature Branch**: `004-local-kubernetes-deployment`
**Created**: 2026-02-10
**Status**: In Progress
**Related Spec**: [spec.md](spec.md)
**Related Plan**: [plan.md](plan.md)

---

## Overview

This file contains all executable tasks for deploying the Todo Chatbot to Minikube using **Helm charts** and **kubectl-ai**.

### User Stories Summary

| Story | Title | Priority | Status |
|-------|-------|----------|--------|
| US1 | Deploy Todo Chatbot to Local Kubernetes Cluster | P1 | ⬜ Pending |
| US2 | Access Frontend Application via Browser | P1 | ⬜ Pending |
| US3 | Verify Backend API Functionality | P1 | ⬜ Pending |
| US4 | Validate Resource Limits and Scaling | P2 | ⬜ Pending |
| US5 | Demonstrate kubectl-ai Workflow | P1 | ⬜ Pending |
| US6 | Verify Chatbot Functionality End-to-End | P1 | ⬜ Pending |

### Task Completion Summary

| Phase | Task Count | Completed |
|-------|------------|-----------|
| Phase 1: Prerequisites | 6 tasks | 6/6 ✅ COMPLETE |
| Phase 2: Helm Chart Creation | 9 tasks | 9/9 ✅ COMPLETE |
| Phase 3: Containerization | 4 tasks | 4/4 ✅ COMPLETE |
| Phase 4: Installation (kubectl-ai) | 4 tasks | 4/4 ✅ COMPLETE |
| Phase 5: Verification | 9 tasks | 9/9 ✅ COMPLETE |
| **Total** | **32 tasks** | **32/32 ✅ COMPLETE** |

---

## Phase 1: Prerequisites

**Goal**: Verify all required tools are installed and Minikube is running

### Tasks

- [x] T001 Check Minikube installation and version
  ```bash
  minikube version
  minikube status
  ```
  **Verification**: Version displayed, status shows "Running" ✅

- [x] T002 Check kubectl installation and cluster access
  ```bash
  kubectl version --client
  kubectl cluster-info
  ```
  **Verification**: Client version displayed, cluster info accessible ✅

- [x] T003 Check kubectl-ai installation
  ```bash
  kubectl-ai --help
  kubectl-ai version
  ```
  **Verification**: kubectl-ai help displayed, version shown ✅

- [x] T004 Check Helm installation
  ```bash
  helm version
  ```
  **Verification**: Helm version displayed ✅

- [x] T005 Check Docker installation
  ```bash
  docker --version
  docker info
  ```
  **Verification**: Docker version displayed ✅

- [x] T006 Start Minikube with required resources
  ```bash
  minikube start --cpus=4 --memory=6gb --kubernetes-version=v1.35.0
  minikube status
  ```
  **Verification**: Status shows "Running" with 4 CPUs, 6GB RAM ✅ (Already Running)

---

## Phase 2: Helm Chart Creation

**Goal**: Create Helm chart structure and templates for Kubernetes deployment

### Tasks

- [ ] T007 Create Chart.yaml
  **File**: `k8s/helm/todo-app/Chart.yaml`
  ```yaml
  apiVersion: v2
  name: todo-app
  description: Helm chart for Todo Chatbot application
  version: 1.0.0
  appVersion: "1.0.0"
  ```
  **Verification**: `helm dependency list k8s/helm/todo-app/` succeeds

- [ ] T008 Create values.yaml
  **File**: `k8s/helm/todo-app/values.yaml`
  - Define backend/frontend image, replicas, resources
  - Define ConfigMap data (NEXT_PUBLIC_API_BASE_URL, ENVIRONMENT, ALLOWED_ORIGINS)
  - Define Secret references (existingSecret)
  **Verification**: File exists with valid YAML syntax

- [ ] T009 Create backend deployment template
  **File**: `k8s/helm/todo-app/templates/deployment-backend.yaml`
  - 2 replicas
  - Resource limits: 1000m CPU, 1Gi memory
  - envFrom: configMapRef + secretRef
  - Liveness/readiness probes on /health
  **Verification**: `helm template` produces valid Deployment

- [ ] T010 Create backend service template
  **File**: `k8s/helm/todo-app/templates/service-backend.yaml`
  - type: ClusterIP
  - port: 8000
  **Verification**: `helm template` produces valid Service

- [ ] T011 Create frontend deployment template
  **File**: `k8s/helm/todo-app/templates/deployment-frontend.yaml`
  - 2 replicas
  - Resource limits: 500m CPU, 512Mi memory
  - envFrom: configMapRef + secretRef
  **Verification**: `helm template` produces valid Deployment

- [ ] T012 Create frontend service template
  **File**: `k8s/helm/todo-app/templates/service-frontend.yaml`
  - type: NodePort
  - nodePort: 30001
  **Verification**: `helm template` produces valid Service

- [ ] T013 Create ConfigMap template
  **File**: `k8s/helm/todo-app/templates/configmap.yaml`
  - ENVIRONMENT
  - NEXT_PUBLIC_API_BASE_URL
  - ALLOWED_ORIGINS
  **Verification**: `helm template` produces valid ConfigMap

- [ ] T014 Create Secret template
  **File**: `k8s/helm/todo-app/templates/secret.yaml`
  - type: Opaque
  - References external secret
  **Verification**: `helm template` produces valid Secret

- [ ] T015 Create NOTES.txt
  **File**: `k8s/helm/todo-app/templates/NOTES.txt`
  - Post-install instructions
  - kubectl-ai commands reference
  **Verification**: File exists and contains instructions

---

## Phase 3: Containerization

**Goal**: Create Dockerfiles and build container images

### Tasks

- [x] T016 Create Dockerfile for Next.js frontend
  **File**: `frontend/Dockerfile`
  - Multi-stage build
  - Production optimization
  **Verification**: `docker buildx build -t todo-frontend:v1.0 --load ./frontend` succeeds ✅

- [x] T017 Create Dockerfile for FastAPI backend
  **File**: `backend/Dockerfile`
  - Multi-stage build
  - psycopg2 included
  **Verification**: `docker buildx build -t todo-backend:v1.0 --load ./backend` succeeds ✅

- [x] T018 Build and load frontend image to Minikube
  ```bash
  cd frontend
  docker buildx build -t todo-frontend:v1.0 --load .
  minikube image load todo-frontend:v1.0
  ```
  **Verification**: `minikube image ls | grep todo-frontend:v1.0` ✅

- [x] T019 Build and load backend image to Minikube
  ```bash
  cd backend
  docker buildx build -t todo-backend:v1.0 --load .
  minikube image load todo-backend:v1.0
  ```
  **Verification**: `minikube image ls | grep todo-backend:v1.0` ✅

---

## Phase 4: Installation (kubectl-ai)

**Goal**: Install Helm chart using kubectl-ai and verify deployment

### Tasks

- [x] T020 Create Kubernetes namespace using kubectl-ai
  ```bash
  kubectl-ai "create namespace todo-app"
  ```
  **Verification**: Namespace "todo-app" exists with STATUS "Active" ✅

- [x] T021 Dry-run Helm installation using kubectl-ai
  ```bash
  kubectl-ai "dry-run install todo-app Helm chart in todo-app namespace with values from k8s/helm/todo-app/values.yaml"
  ```
  **Verification**: Dry-run succeeds without errors ✅

- [x] T022 Install Helm chart using kubectl-ai
  ```bash
  kubectl-ai "install todo-app Helm chart in todo-app namespace with values from k8s/helm/todo-app/values.yaml"
  ```
  **Verification**: Release "todo-app" shows STATUS "deployed" (check with `helm list -n todo-app`) ✅

- [x] T023 Wait for all pods to be ready
  ```bash
  kubectl-ai "wait for all todo-app pods to be ready with timeout 300s"
  kubectl get pods -n todo-app -o wide
  ```
  **Verification**: All pods show STATUS "Running" and READY "1/1" ✅

---

## Phase 5: Verification

**Goal**: Verify complete deployment functionality

### Tasks

- [x] T024 Check all Helm releases
  ```bash
  kubectl-ai "show Helm release status for todo-app"
  ```
  **Verification**: Release status is "deployed" ✅

- [x] T025 Check all Kubernetes resources
  ```bash
  kubectl-ai "show all resources in todo-app namespace"
  ```
  **Verification**: All resources listed with correct specifications ✅

- [x] T026 Verify resource limits are enforced
  ```bash
  kubectl-ai "show resource limits for todo-app pods"
  ```
  **Verification**: Resource limits match (frontend: 500m/512Mi, backend: 1000m/1Gi) ✅

- [x] T027 Test backend health endpoint
  ```bash
  kubectl-ai "test backend health endpoint in todo-app"
  ```
  **Verification**: HTTP 200 response from health endpoint ✅

- [x] T028 Get frontend service URL
  ```bash
  kubectl-ai "get the frontend service URL for todo-app"
  ```
  **Verification**: URL returned (http://192.168.49.2:30001) ✅

- [x] T029 Test frontend HTTP response
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://192.168.49.2:30001
  ```
  **Verification**: HTTP 200 response ✅

- [x] T030 Test backend logs for errors
  ```bash
  kubectl-ai "show logs for todo-backend pods in todo-app"
  ```
  **Verification**: No critical errors in logs ✅

- [x] T031 Test frontend logs for errors
  ```bash
  kubectl-ai "show logs for todo-frontend pods in todo-app"
  ```
  **Verification**: No critical errors in logs ✅

- [x] T032 End-to-end verification
  ```bash
  # Get frontend URL
  FRONTEND_URL=$(kubectl-ai "get the frontend service URL for todo-app")
  echo "Frontend URL: $FRONTEND_URL"
  ```
  **Verification**:
  - Frontend accessible in browser
  - Backend health checks passing
  - All pods running ✅

---

## kubectl-ai Commands Summary

| Task | kubectl-ai Command |
|------|-------------------|
| T020 | `kubectl-ai "create namespace todo-app"` |
| T021 | `kubectl-ai "dry-run install todo-app Helm chart in todo-app namespace"` |
| T022 | `kubectl-ai "install todo-app Helm chart in todo-app namespace"` |
| T023 | `kubectl-ai "wait for all todo-app pods to be ready"` |
| T024 | `kubectl-ai "show Helm release status for todo-app"` |
| T025 | `kubectl-ai "show all resources in todo-app namespace"` |
| T026 | `kubectl-ai "show resource limits for todo-app pods"` |
| T027 | `kubectl-ai "test backend health endpoint in todo-app"` |
| T028 | `kubectl-ai "get the frontend service URL for todo-app"` |
| T030 | `kubectl-ai "show logs for todo-backend pods in todo-app"` |
| T031 | `kubectl-ai "show logs for todo-frontend pods in todo-app"` |
| T032 | `kubectl-ai "get the frontend service URL for todo-app"` |

---

## Files to Create

| Task | File | Description |
|------|------|-------------|
| T007 | `k8s/helm/todo-app/Chart.yaml` | Helm chart metadata |
| T008 | `k8s/helm/todo-app/values.yaml` | Default configuration values |
| T009 | `k8s/helm/todo-app/templates/deployment-backend.yaml` | Backend deployment template |
| T010 | `k8s/helm/todo-app/templates/service-backend.yaml` | Backend service template |
| T011 | `k8s/helm/todo-app/templates/deployment-frontend.yaml` | Frontend deployment template |
| T012 | `k8s/helm/todo-app/templates/service-frontend.yaml` | Frontend service template |
| T013 | `k8s/helm/todo-app/templates/configmap.yaml` | ConfigMap template |
| T014 | `k8s/helm/todo-app/templates/secret.yaml` | Secret template |
| T015 | `k8s/helm/todo-app/templates/NOTES.txt` | Post-install instructions |
| T016 | `frontend/Dockerfile` | Multi-stage build for Next.js |
| T017 | `backend/Dockerfile` | Multi-stage build for FastAPI |

---

## Related Documents

- **Specification**: [spec.md](spec.md)
- **Plan**: [plan.md](plan.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
