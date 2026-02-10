# Phase 4: Local Kubernetes Deployment (Helm + kubectl-ai)

**Status**: ✅ Complete
**Created**: 2026-02-10
**Updated**: 2026-02-10

## Overview

Cloud-native deployment of the Todo Chatbot application to a local Kubernetes cluster using Minikube, Helm charts, and AI-assisted kubectl operations. Features HTTPS support for ChatKit integration.

## Features Implemented

### Kubernetes Infrastructure
- ✅ Minikube cluster with 4 CPUs and 6GB RAM
- ✅ Helm chart-based deployment
- ✅ Kubernetes namespace isolation (`todo-app`)
- ✅ ConfigMap for non-sensitive configuration
- ✅ Secret management for credentials
- ✅ Resource limits and quotas

### Container Orchestration
- ✅ Frontend: 2 replicas (Next.js)
- ✅ Backend: 2 replicas (FastAPI)
- ✅ NodePort service for frontend (port 30001)
- ✅ ClusterIP service for backend (port 8000)
- ✅ Health checks and readiness probes
- ✅ Rolling updates and rollbacks

### Containerization
- ✅ Multi-stage Docker builds
- ✅ Optimized image sizes (Frontend: 249MB, Backend: 215MB)
- ✅ Runtime environment variable injection
- ✅ Health check endpoints

### HTTPS Support
- ✅ Nginx reverse proxy with SSL
- ✅ Self-signed certificate for local development
- ✅ HTTPS endpoint for ChatKit (port 30003)
- ✅ Secure WebSocket support

## Technology Stack

### Orchestration
| Component | Technology |
|-----------|------------|
| Cluster | Minikube |
| Package Manager | Helm v3 |
| Container Runtime | Docker |
| AI DevOps | kubectl-ai |

### Services
| Component | Type | Port | Replicas | Resources |
|-----------|------|------|----------|-----------|
| Frontend | NodePort | 30001 | 2 | 500m CPU, 512Mi |
| Backend | ClusterIP | 8000 | 2 | 1000m CPU, 1Gi |
| HTTPS Proxy | NodePort | 30003 | 1 | 250m CPU, 256Mi |

### External Dependencies
| Service | Connection |
|---------|------------|
| Neon PostgreSQL | External via Secrets |
| Gemini API | External via Secrets |
| OpenAI ChatKit | HTTPS via domain allowlist |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Minikube Cluster                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   todo-app Namespace                      │   │
│  │                                                          │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────┐   │   │
│  │  │   Frontend  │◄──►│   Backend   │◄──►│   Neon     │   │   │
│  │  │   (Next.js) │    │  (FastAPI)  │    │ PostgreSQL │   │   │
│  │  │   NodePort  │    │  ClusterIP  │    │  (External)│   │   │
│  │  │  :30001     │    │   :8000     │    │            │   │   │
│  │  │  2 replicas │    │  2 replicas │    │            │   │   │
│  │  │  500m/512Mi │    │ 1000m/1Gi   │    │            │   │   │
│  │  └─────────────┘    └─────────────┘    └────────────┘   │   │
│  │         ▲                                          │     │   │
│  │         │                                          │     │   │
│  │  ┌──────┴──────────┐                              │     │   │
│  │  │  HTTPS Proxy    │                              │     │   │
│  │  │   (Nginx)       │                              │     │   │
│  │  │   NodePort      │                              │     │   │
│  │  │   :30003        │                              │     │   │
│  │  │   SSL/TLS       │                              │     │   │
│  │  └─────────────────┘                              │     │   │
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
           │                              │
           │ HTTP                         │ HTTPS
           ▼                              ▼
   Browser (http://)              Browser (https://)
  192.168.49.2:30001            192.168.49.2:30003
```

## Helm Chart Structure

```
k8s/helm/todo-app/
├── Chart.yaml                 # Chart metadata
├── values.yaml                # Default configuration
└── templates/
    ├── deployment-backend.yaml   # Backend deployment (2 replicas)
    ├── deployment-frontend.yaml  # Frontend deployment (2 replicas)
    ├── service-backend.yaml      # ClusterIP service
    ├── service-frontend.yaml     # NodePort service
    ├── configmap.yaml            # Environment variables
    ├── secret.yaml               # Secret references
    └── NOTES.txt                 # Post-install instructions
```

## kubectl-ai Commands

### Installation
```bash
# Create namespace
kubectl-ai "create namespace todo-app"

# Install Helm chart
kubectl-ai "install todo-app Helm chart in todo-app namespace"

# Check status
kubectl-ai "show all pods in todo-app namespace"
```

### Scaling
```bash
# Scale deployments
kubectl-ai "scale todo-backend to 3 replicas"
kubectl-ai "scale todo-frontend to 3 replicas"
```

### Troubleshooting
```bash
# Check logs
kubectl-ai "show logs for todo-backend pods in todo-app"
kubectl-ai "show logs for todo-frontend pods in todo-app"

# Debug issues
kubectl-ai "why are the backend pods failing?"
kubectl-ai "check health of todo-app deployment"
```

### Rollback
```bash
# Check revision history
kubectl-ai "show Helm revision history for todo-app"

# Rollback
kubectl-ai "rollback todo-app to previous Helm revision"
```

## Environment Variables

### ConfigMap (Non-sensitive)
```yaml
NEXT_PUBLIC_API_BASE_URL: http://todo-backend:8000
ENVIRONMENT: production
ALLOWED_ORIGINS: "https://todo-web-app-hunain.vercel.app,http://localhost:3000,http://192.168.49.2:30001"
```

### Secrets (Sensitive)
```yaml
DATABASE_URL: postgresql://user:password@neon-host/db
GEMINI_API_KEY: your-gemini-api-key
BETTER_AUTH_SECRET: your-auth-secret
OPENAI_API_KEY: your-openai-key
CHATKIT_WORKFLOW_ID: your-workflow-id
```

## Runtime Environment Injection

Due to Next.js bundling `NEXT_PUBLIC_*` variables at build time, an entrypoint script replaces placeholders at container startup:

```bash
# entrypoint.sh
# Replace placeholders with actual values
sed -i "s|APP_NEXT_PUBLIC_API_BASE_URL|$NEXT_PUBLIC_API_BASE_URL|g" /app/.next/...
```

## Resource Limits

| Component | CPU Limit | Memory Limit | CPU Request | Memory Request |
|-----------|-----------|--------------|-------------|----------------|
| Frontend | 500m | 512Mi | 250m | 256Mi |
| Backend | 1000m | 1Gi | 500m | 512Mi |
| Nginx Proxy | 250m | 256Mi | 100m | 128Mi |

## Access URLs

| Protocol | URL | Purpose |
|----------|-----|---------|
| HTTP | http://192.168.49.2:30001 | Frontend (standard) |
| HTTPS | https://192.168.49.2:30003 | Frontend (ChatKit requires HTTPS) |
| Internal | http://todo-backend:8000 | Backend service |

## Health Checks

### Backend
- **Liveness**: `GET /health` (initialDelay: 30s, period: 15s)
- **Readiness**: `GET /health` (initialDelay: 15s, period: 10s)
- **Timeout**: 10s (liveness), 5s (readiness)
- **Failure Threshold**: 3

### Response
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-10T13:16:49Z",
  "checks": {
    "database": { "status": "healthy" }
  }
}
```

## ChatKit HTTPS Setup

### Why HTTPS is Required
ChatKit uses `crypto.randomUUID()` which requires a secure context (HTTPS) except for localhost.

### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/tls.crt;
    ssl_certificate_key /etc/nginx/ssl/tls.key;
    
    location / {
        proxy_pass http://todo-frontend:3000;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Certificate
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout todo-app.key \
  -out todo-app.crt \
  -subj "/CN=192.168.49.2" \
  -addext "subjectAltName=IP:192.168.49.2"

# Create Kubernetes secret
kubectl create secret tls todo-app-tls \
  --cert=todo-app.crt \
  --key=todo-app.key \
  -n todo-app
```

## Project Structure

```
project-root/
├── frontend/
│   ├── Dockerfile                    # Multi-stage build
│   ├── entrypoint.sh                 # Runtime env injection
│   ├── next.config.js                # Standalone output
│   └── .env                          # Build placeholders
├── backend/
│   ├── Dockerfile                    # Multi-stage build
│   └── src/api/chatkit_router.py     # ChatKit integration
└── k8s/helm/todo-app/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        ├── deployment-*.yaml
        ├── service-*.yaml
        ├── configmap.yaml
        └── secret.yaml
```

## Deployment Steps

### 1. Prerequisites
```bash
minikube start --cpus=4 --memory=6gb --kubernetes-version=v1.35.0
kubectl version --client
helm version
docker --version
```

### 2. Build Images
```bash
# Frontend
cd frontend
docker build -t todo-frontend:v1.0 .
docker save todo-frontend:v1.0 | minikube image load -

# Backend
cd backend
docker build -t todo-backend:v1.0 .
docker save todo-backend:v1.0 | minikube image load -
```

### 3. Deploy
```bash
# Create namespace
kubectl create namespace todo-app

# Install Helm chart
helm install todo-app k8s/helm/todo-app/ \
  --namespace todo-app \
  --create-namespace

# Verify
kubectl get pods -n todo-app
helm list -n todo-app
```

### 4. Setup HTTPS (Optional but recommended for ChatKit)
```bash
# Create SSL secret
kubectl create secret tls todo-app-tls \
  --cert=todo-app.crt \
  --key=todo-app.key \
  -n todo-app

# Deploy HTTPS proxy
kubectl apply -f k8s/nginx-https.yaml
```

## Verification Checklist

### Pre-Deployment
- [x] Minikube running with 4 CPUs, 6GB RAM
- [x] Docker images built with v1.0 tags
- [x] Images loaded into Minikube
- [x] Helm chart validates (`helm template`)

### Post-Deployment
- [x] All pods in Running state
- [x] Backend health endpoint responding (HTTP 200)
- [x] Frontend accessible via browser
- [x] ChatKit session creation working
- [x] Task creation via API working
- [x] Resource limits enforced
- [x] No critical errors in logs
- [x] HTTPS endpoint accessible (if configured)

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Pod startup | < 2 minutes | ~45 seconds |
| Health check response | < 3 seconds | ~100ms |
| Frontend load | < 10 seconds | ~3 seconds |
| API response | < 2 seconds | ~200ms |
| ChatKit session | < 5 seconds | ~2 seconds |

## Security Considerations

1. **Secrets Management**
   - Sensitive data in Kubernetes Secrets
   - Never commit secrets to git
   - Use external secret management in production

2. **Network Security**
   - Backend only accessible internally (ClusterIP)
   - Frontend exposed via NodePort
   - HTTPS for sensitive operations

3. **Container Security**
   - Non-root user in containers
   - Read-only filesystem where possible
   - Minimal base images (Alpine Linux)

4. **Resource Limits**
   - CPU and memory limits prevent DoS
   - Request values ensure fair scheduling

## Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app --previous
```

### Service Not Accessible
```bash
kubectl get svc -n todo-app
minikube service todo-frontend -n todo-app --url
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app
```

### ChatKit White Screen
- Ensure domain is allowlisted in OpenAI dashboard
- Use HTTPS endpoint (http:// won't work for ChatKit)
- Check browser console for crypto.randomUUID errors
- Verify `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` is set

### Image Pull Errors
```bash
# Check images in Minikube
minikube image ls | grep todo

# Reload if needed
docker save todo-frontend:v1.0 | minikube image load -
```

## Commands Reference

### Helm
```bash
# Install
helm install todo-app k8s/helm/todo-app/ -n todo-app

# Upgrade
helm upgrade todo-app k8s/helm/todo-app/ -n todo-app

# Rollback
helm rollback todo-app 0 -n todo-app

# Uninstall
helm uninstall todo-app -n todo-app
```

### kubectl
```bash
# Get resources
kubectl get all -n todo-app

# Logs
kubectl logs -l app=todo-backend -n todo-app --tail=100
kubectl logs -l app=todo-frontend -n todo-app --tail=100

# Shell into pod
kubectl exec -it deployment/todo-backend -n todo-app -- /bin/sh

# Port forward
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
```

## Future Enhancements

- [ ] Horizontal Pod Autoscaling (HPA)
- [ ] Ingress controller with Let's Encrypt
- [ ] Persistent volumes for logs
- [ ] Prometheus/Grafana monitoring
- [ ] Istio service mesh
- [ ] Multi-environment support (dev/staging/prod)
- [ ] CI/CD pipeline integration
- [ ] Pod disruption budgets
- [ ] Network policies

## References

- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl-ai GitHub](https://github.com/sozercan/kubectl-ai)
- [ChatKit Documentation](https://platform.openai.com/docs/guides/chatkit)
- [Phase 3: AI Conversational Todo](Phase-3.md)

---

**Previous Phase**: [Phase 3 - AI Conversational Todo](Phase-3.md)

**Specifications**: [specs/004-local-kubernetes-deployment/](specs/004-local-kubernetes-deployment/)
