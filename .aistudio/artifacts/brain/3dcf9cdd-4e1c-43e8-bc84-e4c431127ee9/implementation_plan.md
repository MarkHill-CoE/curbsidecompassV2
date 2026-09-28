# Implementation Plan: Update Google Cloud Run (GCP) Deployment

## Context & Objective
You recently updated `nginx.conf` and `Dockerfile` to listen on port **8080** (the standard default ingress port for Google Cloud Run). To successfully publish your updated application to Google Cloud Platform (GCP), we need to synchronize the container health checks with port 8080 and provide the exact `gcloud` deployment commands.

---

## Proposed Changes

### 1. Fix Health Checks for Port 8080
- **`Dockerfile`**:
  - Update `HEALTHCHECK` command from `http://localhost/healthz` to `http://localhost:8080/healthz` so container health monitors pass on GCP.
- **`docker-compose.yml`**:
  - Update host port binding to `"3000:8080"` and health check probe to `http://localhost:8080/healthz` for local Docker parity.

### 2. Add Quick Deployment Script & GCP Guide
- Create a script `scripts/deploy-cloud-run.sh` with parameter prompts (or default project/region) that runs:
  ```bash
  gcloud run deploy curbside-compass \
    --source . \
    --region northamerica-northeast1 \
    --port 8080 \
    --allow-unauthenticated
  ```
- Document the two deployment paths:
  1. **Direct Source Deploy** (simplest: Cloud Build packages and deploys in one step).
  2. **Container Image Deploy** via Google Artifact Registry (standard CI/CD pipeline).

---

## Verification Plan
1. **Configuration Verification**: Run `compile_applet` and `lint_applet` to ensure codebase integrity.
2. **Local Container Test**: Verify `Dockerfile` healthcheck and configuration syntax.
3. **Deployment Readiness**: Ensure execution permissions and commands are validated for standard GCP project structures.
