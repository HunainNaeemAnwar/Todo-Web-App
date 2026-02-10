# Implementation Plan: Local Kubernetes Deployment (Helm + kubectl-ai)

**Feature Branch**: `004-local-kubernetes-deployment`
**Created**: 2026-02-10
**Status**: In Progress
**Related Spec**: [spec.md](spec.md)

---

## Technical Context

### AI DevOps Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| kubectl-ai | AI-assisted Kubernetes operations | Generate manifests, deployments, troubleshooting |

### kubectl-ai Commands Reference

```bash
# Deploy Helm chart
kubectl-ai "install todo-app Helm chart in todo-app namespace"

# Scale deployments
kubectl-ai "scale todo-backend to 3 replicas"
kubectl-ai "scale todo-frontend to 3 replicas"

# Check pod status
kubectl-ai "show me all pods in todo-app namespace"

# Troubleshoot issues
kubectl-ai "why are the backend pods failing?"
kubectl-ai "check health of todo-app deployment"

# Upgrade and rollback
kubectl-ai "upgrade todo-app Helm chart with new values"
kubectl-ai "rollback todo-app to previous revision"

# Get service URLs
kubectl-ai "get the frontend service URL for todo-app"
```

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Minikube Cluster                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   todo-app Namespace                      │   │
│  │                                                          │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────┐│   │
│  │  │   Frontend  │───▶│   Backend   │───▶│   Neon     ││   │
│  │  │   (Next.js) │    │  (FastAPI)  │    │ PostgreSQL ││   │
│  │  │   NodePort  │    │  ClusterIP  │    │  (External)││   │
│  │  │  :30001     │    │   :8000     │    │            ││   │
│  │  │  v1.0       │    │   v1.0      │    │            ││   │
│  │  │  2 replicas │    │  2 replicas │    │            ││   │
│  │  │  500m/512Mi │    │ 1000m/1Gi   │    │            ││   │
│  │  └─────────────┘    └─────────────┘    └────────────┘│   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              todo-app-config (ConfigMap)                   │   │
│  │  - NEXT_PUBLIC_API_BASE_URL=http://todo-backend:8000      │   │
│  │  - ENVIRONMENT=production                                 │   │
│  │  - ALLOWED_ORIGINS=...                                    │   │
│  │                                                              │   │
│  │              todo-app-secrets (Secret)                      │   │
│  │  - DATABASE_URL=postgresql://...                           │   │
│  │  - GEMINI_API_KEY=...                                    │   │
│  │  - BETTER_AUTH_SECRET=...                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          │ minikube service todo-frontend --url
          ▼
     Browser Access
    (http://localhost:30001)
```

### Helm Chart Structure

```
k8s/helm/todo-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
└── templates/
    ├── deployment-backend.yaml
    ├── deployment-frontend.yaml
    ├── service-backend.yaml
    ├── service-frontend.yaml
    ├── configmap.yaml
    ├── secret.yaml
    └── NOTES.txt
```

### Component Specifications

| Component | Image Tag | Replicas | CPU Limit | Memory Limit | Service Type | Port |
|-----------|-----------|----------|-----------|--------------|--------------|------|
| Frontend | todo-frontend:v1.0 | 2 | 500m | 512Mi | NodePort | 30001 |
| Backend | todo-backend:v1.0 | 2 | 1000m | 1Gi | ClusterIP | 8000 |

### External Dependencies

| Dependency | Type | Connection Method |
|------------|------|------------------|
| Neon PostgreSQL | Database | External via Secrets (DATABASE_URL) |
| Gemini API | AI Service | External via Secrets (GEMINI_API_KEY) |
| Better Auth | Auth Service | External via Secrets (BETTER_AUTH_SECRET) |

---

## Key Decisions

### KD-001: Helm for Kubernetes Manifest Management

**Decision**: Use Helm charts for all Kubernetes deployments
**Reason**: Reusable, versioned, templated manifests with rollback capability
**Impact**: All resources managed via `helm install/upgrade/rollback`

### KD-002: kubectl-ai for AI-Assisted Operations

**Decision**: Use kubectl-ai for all Kubernetes operations
**Reason**: AI-assisted manifest generation, troubleshooting, and scaling
**Impact**: All kubectl/helm operations via kubectl-ai commands

### KD-003: NodePort for Frontend Access

**Decision**: Use NodePort service type for frontend
**Reason**: Minikube environment, no Ingress controller needed
**Impact**: Accessible via `minikube service todo-frontend --url`

### KD-004: ClusterIP for Backend

**Decision**: Use ClusterIP service type for backend
**Reason**: Internal communication only, not exposed externally
**Impact**: Frontend accesses via DNS name `todo-backend.todo-app.svc.cluster.local`

### KD-005: External Neon Database

**Decision**: Connect to existing Neon PostgreSQL externally
**Reason**: Managed database already available, no local state needed
**Impact**: No persistent volumes, no database pods

---

## kubectl-ai Commands Reference

### Installation

```bash
# Create namespace using kubectl-ai
kubectl-ai "create namespace todo-app"

# Install Helm chart
kubectl-ai "install todo-app Helm chart in todo-app namespace with values from k8s/helm/todo-app/values.yaml"

# Dry-run first
kubectl-ai "dry-run install todo-app Helm chart in todo-app namespace"
```

### Upgrades

```bash
# Upgrade after making changes
kubectl-ai "upgrade todo-app Helm chart in todo-app namespace"

# Upgrade with new image version
kubectl-ai "upgrade todo-app Helm chart with backend.image.tag=v1.1"
```

### Scaling and Troubleshooting

```bash
# Scale deployments
kubectl-ai "scale todo-backend to 3 replicas"
kubectl-ai "scale todo-frontend to 2 replicas"

# Check status
kubectl-ai "show all pods in todo-app namespace"
kubectl-ai "show deployment status for todo-app"

# Troubleshoot
kubectl-ai "why are the backend pods failing?"
kubectl-ai "check health of todo-backend service"
kubectl-ai "show logs for todo-backend pods"
```

### Rollback

```bash
# Check revision history
kubectl-ai "show Helm revision history for todo-app"

# Rollback to previous version
kubectl-ai "rollback todo-app to previous Helm revision"
```

### Access

```bash
# Get frontend URL
kubectl-ai "get the frontend service URL for todo-app"

# Check endpoints
kubectl-ai "show endpoints for todo-backend and todo-frontend"
```

---

## Helm Commands Reference (Fallback)

```bash
# Create namespace first
kubectl create namespace todo-app

# Install Helm chart
helm install todo-app k8s/helm/todo-app/ \
  --namespace todo-app \
  --create-namespace \
  -f k8s/helm/todo-app/values.yaml

# Upgrade
helm upgrade todo-app k8s/helm/todo-app/ \
  --namespace todo-app \
  -f k8s/helm/todo-app/values.yaml

# Rollback
helm rollback todo-app 0 -n todo-app
```

---

## Execution Sequence

### Step 1: Prerequisites Verification

| Task | Command | Verification |
|------|---------|--------------|
| Check Minikube | `minikube status` | Shows "Running" |
| Verify kubectl | `kubectl version --client` | Client version displayed |
| Check Helm | `helm version` | Helm version displayed |
| Check kubectl-ai | `kubectl-ai --help` | kubectl-ai help displayed |
| Check Docker | `docker --version` | Docker version displayed |

### Step 2: Start Minikube

```bash
minikube start --cpus=4 --memory=6gb --kubernetes-version=v1.35.0
minikube status
```

### Step 3: Create Helm Chart Structure

```bash
mkdir -p k8s/helm/todo-app/templates
```

### Step 4: Create Helm Chart Files

- Chart.yaml
- values.yaml
- templates/*.yaml

### Step 5: Build and Load Images

```bash
cd frontend && docker buildx build -t todo-frontend:v1.0 --load . && minikube image load todo-frontend:v1.0
cd backend && docker buildx build -t todo-backend:v1.0 --load . && minikube image load todo-backend:v1.0
```

### Step 6: Install Helm Chart (via kubectl-ai)

```bash
kubectl-ai "create namespace todo-app"
kubectl-ai "install todo-app Helm chart in todo-app namespace"
```

### Step 7: Access Application

```bash
minikube service todo-frontend -n todo-app --url
```

---

## Verification Checklist

### Pre-Deployment
- [ ] Minikube running with 4 CPUs, 6GB RAM
- [ ] kubectl configured correctly
- [ ] Helm installed and working
- [ ] kubectl-ai installed and working
- [ ] Docker images build successfully
- [ ] Neon database connection string available
- [ ] API keys available

### Deployment
- [ ] Namespace "todo-app" created
- [ ] ConfigMap "todo-app-config" exists
- [ ] Secret "todo-app-secrets" exists
- [ ] Helm release "todo-app" installed
- [ ] Backend deployment with 2 replicas Running
- [ ] Backend service (ClusterIP) created
- [ ] Frontend deployment with 2 replicas Running
- [ ] Frontend service (NodePort 30001) created

### Post-Deployment
- [ ] All pods in Running state
- [ ] Backend health endpoint responding
- [ ] Frontend accessible via browser
- [ ] Task creation via API works
- [ ] Chatbot UI loads and functions
- [ ] Resource limits enforced
- [ ] No errors in logs

---

## Estimated Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Prerequisites | 5 min | Verify tools, start Minikube |
| Helm Chart Creation | 15 min | Create Chart.yaml, values.yaml, templates |
| Containerization | 15 min | Build Docker images |
| Installation | 5 min | Install Helm chart (kubectl-ai) |
| Verification | 10 min | Test endpoints, browser |
| **Total** | **~50 min** | End-to-end deployment |

---

## Related Documents

- **Specification**: [spec.md](spec.md)
- **Tasks**: [tasks.md](tasks.md)
