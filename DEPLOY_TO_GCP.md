# Deploying Curbside Compass to Google Cloud Run (GCP)

This guide explains how to update and deploy the Curbside Compass container to **Google Cloud Run**.

---

## 1. Quick Deploy via Cloud SDK CLI (Recommended)

Since your container is now configured to listen on port **8080** (matching Google Cloud Run's ingress standards), you can build and deploy directly from your repository root using Google Cloud Build and Cloud Run in a single command.

### Step 1: Log in and set your project
```bash
# Authenticate with your Google Cloud account
gcloud auth login

# Set your target Google Cloud project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Run the automated deployment script
```bash
./scripts/deploy-cloud-run.sh
```

*Or run the `gcloud` command directly:*
```bash
gcloud run deploy curbside-compass \
  --source . \
  --platform managed \
  --region northamerica-northeast1 \
  --port 8080 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

*Cloud Build will automatically package the `Dockerfile`, push the image to Google Artifact Registry, and create a new revision on Cloud Run.*

---

## 2. Deploying via Google Cloud Console (Web UI)

If you prefer using the browser console:

1. Open the [Google Cloud Console - Cloud Run](https://console.cloud.google.com/run).
2. Select your project from the top dropdown.
3. Click on your existing service (`curbside-compass` or equivalent) or click **Create Service**.
4. Click **Edit & Deploy New Revision**.
5. Under **Container**, confirm:
   - **Container port**: `8080`
   - **Startup probe / Liveness probe**: Path `/healthz` on port `8080`
6. Click **Deploy**.

---

## 3. Continuous Deployment (CI/CD) via GitHub

If your repository is connected to GitHub:
1. In Cloud Run, click **Set Up Continuous Deployment**.
2. Select your repository and branch (`main`).
3. Build Type: **Dockerfile** (Path: `/Dockerfile`).
4. Whenever you push changes to GitHub, Google Cloud Build will automatically build and deploy the new revision.

---

## 4. Local Testing with Docker

To verify the container locally before deploying to GCP:
```bash
# Build and run container with docker-compose
docker compose up --build

# In a browser or terminal, verify health endpoint:
curl http://localhost:3000/healthz
# Expected output: OK
```
