# Deployment Guide: How to Deploy Curbside Compass to Google Cloud Run with Cloud SQL

Welcome! This guide explains how to take your **Curbside Compass** web application and put it on the internet using **Google Cloud Run** and a **Cloud SQL (PostgreSQL)** database, completely automated with a **GitHub Actions** robot helper.

---

## 🌟 The Big Picture: How Everything Works (Like You're 12!)

Imagine you built an awesome LEGO castle in your bedroom, and now you want millions of people in Edmonton to play with it without coming into your bedroom:

1. **Your Web App (The LEGO Castle)**:
   The React and Tailwind code you've built. It runs inside a browser so people can answer questions and see the 3D neighbourhood simulation.
2. **Docker & Nginx (The Magical Lunchbox)**:
   A **Docker Container** is like a sealed lunchbox. Inside this lunchbox, you put your pre-baked website and a tiny, lightning-fast web server called **Nginx**. Because everything is inside the lunchbox, it works identically on your laptop, on a friend's Mac, or inside Google's giant data centers.
3. **Google Cloud Run (The Chef Who Only Cooks When Ordered)**:
   Normally, running a website meant leaving a computer plugged into the wall 24 hours a day, burning electricity and money. **Cloud Run** is serverless: when a citizen visits your link, Google wakes up a container in 1 second, serves the webpage, and if nobody visits at 3 AM, it goes to sleep and costs **$0.00**.
4. **Cloud SQL PostgreSQL (The Steel Filing Cabinet)**:
   When people finish the survey, where do their answers go? If the server restarts, memory disappears. A **PostgreSQL Database** is like a fireproof, lock-and-key digital filing cabinet where survey votes, feedback, and neighbourhood choices are saved safely forever.
5. **GitHub Actions (The Friendly Robot Helper)**:
   Instead of you typing long commands on your computer every time you fix a spelling mistake or tweak a slider, you push code to GitHub. A robot helper automatically wakes up, builds the container, tests it, and delivers it to Google Cloud Run.

---

## 🗺️ Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │              Citizen in Edmonton              │
                      │         (iPhone / Android / Laptop)           │
                      └───────────────────────┬───────────────────────┘
                                              │ HTTPS (Port 443)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Google Cloud Project (e.g., edmonton-curbside-compass)                              │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │ Google Cloud Run Service (Serverless Container)                              │  │
│  │                                                                              │  │
│  │   ┌──────────────────────────────────────────────────────────────────────┐   │  │
│  │   │ Nginx Web Server (Port 8080)                                         │   │  │
│  │   │  ├── Serves compiled Vite HTML/JS/CSS assets                         │   │  │
│  │   │  └── Proxy /api/* requests to backend or Cloud Run sidecar           │   │  │
│  │   └──────────────────────────────────┬───────────────────────────────────┘   │  │
│  └──────────────────────────────────────┼───────────────────────────────────────┘  │
│                                         │ Cloud SQL Auth Proxy / Unix Socket        │
│                                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │ Cloud SQL Instance (PostgreSQL 16)                                           │  │
│  │  └── Database: curbside_compass_db                                           │  │
│  │       ├── table: survey_responses                                            │  │
│  │       └── table: anonymous_postal_stats                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Implementation Roadmap

### Step 1: Prepare Google Cloud (Your Cloud Kingdom)

1. **Sign in to Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com/).
   - Click the project dropdown at the top and click **New Project**. Name it `curbside-compass-prod`.
2. **Enable Google Cloud APIs**:
   Open Cloud Shell (the `>_` icon at top right) and run:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     sqladmin.googleapis.com \
     artifactregistry.googleapis.com \
     cloudbuild.googleapis.com \
     secretmanager.googleapis.com
   ```
3. **Create an Artifact Registry (Container Warehouse)**:
   This is where your Docker lunchboxes are stored:
   ```bash
   gcloud artifacts repositories create curbside-repo \
     --repository-format=docker \
     --location=northamerica-northeast1 \
     --description="Docker repository for Curbside Compass"
   ```

---

### Step 2: Create Your Cloud SQL Database (The Steel Filing Cabinet)

1. **Create the Cloud SQL PostgreSQL Instance**:
   Run this in Cloud Shell (choose `northamerica-northeast1` for Montreal or `us-central1` for low latency):
   ```bash
   gcloud sql instances create curbside-db-instance \
     --database-version=POSTGRES_16 \
     --tier=db-f1-micro \
     --region=northamerica-northeast1 \
     --root-password="ChooseAStrongPassword123!"
   ```
   *(Note: `db-f1-micro` is very inexpensive, costing ~$7–$10/month, and can scale up whenever high public traffic arrives).*

2. **Create the Database and Application User**:
   ```bash
   # Create the application database
   gcloud sql databases create curbside_db --instance=curbside-db-instance

   # Create a secure user for your app
   gcloud sql users create curbside_app_user \
     --instance=curbside-db-instance \
     --password="SuperSecureAppPassword456!"
   ```

3. **Database Schema (What the Filing Cabinet Holds)**:
   Create the initial table to store user responses safely:
   ```sql
   CREATE TABLE survey_submissions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       postal_code_prefix VARCHAR(3),
       neighbourhood VARCHAR(100),
       street_layout VARCHAR(50),
       answers JSONB NOT NULL,
       persona_title VARCHAR(100),
       policy_x_score NUMERIC(5,2),
       policy_y_score NUMERIC(5,2)
   );
   ```

---

### Step 3: Configure the Web App Container for Cloud Run

Google Cloud Run expects your container to listen on the port given by the `$PORT` environment variable (which is `8080` by default).

1. **Update `nginx.conf`**:
   Adjust Nginx to listen on port `8080` (Cloud Run's default) and handle Cloud Run health checks.
2. **Update `Dockerfile`**:
   Ensure multi-stage caching: Node 20 builds the Vite bundles, and lightweight Nginx Alpine serves the static assets.

---

### Step 4: Automate Deployments with GitHub Actions (The Robot)

Every time you commit to `main`, GitHub Actions will:
1. Check out your code.
2. Build the Docker container.
3. Push it to Google Artifact Registry.
4. Deploy it directly to Cloud Run without downtime!

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [ main ]

env:
  PROJECT_ID: curbside-compass-prod
  REGION: northamerica-northeast1
  SERVICE_NAME: curbside-compass
  REPOSITORY: curbside-repo

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker for Artifact Registry
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build and Push Docker Container
        run: |
          IMAGE_TAG="${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE_NAME }}:${{ github.sha }}"
          docker build -t $IMAGE_TAG .
          docker push $IMAGE_TAG
          echo "IMAGE_TAG=$IMAGE_TAG" >> $GITHUB_ENV

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image ${{ env.IMAGE_TAG }} \
            --region ${{ env.REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --port 8080 \
            --memory 512Mi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 10
```

---

### Step 5: Connecting the Database with Cloud Run

Because your app is an interactive client-side React app with simulation math running in the browser:
- For storing survey submissions, we attach a lightweight Node/Express API endpoint or Cloud Function proxy that receives the anonymous survey payload.
- In Cloud Run, you enable the **Cloud SQL connection**:
  ```bash
  gcloud run services update curbside-compass \
    --region=northamerica-northeast1 \
    --add-cloudsql-instances=curbside-compass-prod:northamerica-northeast1:curbside-db-instance
  ```
- This creates an encrypted internal Unix socket (`/cloudsql/...`), so your database is never exposed directly to the public internet!

---

## 🎯 Verification & Launch Checklist

- [ ] `nginx.conf` listens on port `8080` for Cloud Run.
- [ ] Dockerfile compiles cleanly with `npm run build` and tests locally.
- [ ] Google Cloud Project created with Cloud Run, Cloud SQL, and Artifact Registry enabled.
- [ ] Cloud SQL PostgreSQL instance running with `survey_submissions` table.
- [ ] GitHub repository secrets populated with `GCP_SA_KEY`.
- [ ] GitHub Actions workflow triggers and deploys green.
- [ ] Live URL loaded over HTTPS with zero console errors.
