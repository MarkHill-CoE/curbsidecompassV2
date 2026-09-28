#!/usr/bin/env bash
set -e

# ==============================================================================
# Google Cloud Run Deployment Script for Curbside Compass
# ==============================================================================
# Prerequisites:
# 1. Google Cloud SDK (`gcloud`) installed and authenticated:
#    gcloud auth login
# 2. Target GCP project selected:
#    gcloud config set project YOUR_PROJECT_ID
# ==============================================================================

SERVICE_NAME="${SERVICE_NAME:-curbside-compass}"
REGION="${REGION:-northamerica-northeast1}"
PORT="8080"

echo "=================================================================="
echo " Deploying Curbside Compass to Google Cloud Run"
echo " Service : ${SERVICE_NAME}"
echo " Region  : ${REGION}"
echo " Port    : ${PORT}"
echo "=================================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud SDK (gcloud) is not installed."
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || true)
if [ -z "$CURRENT_PROJECT" ] || [ "$CURRENT_PROJECT" = "(unset)" ]; then
    echo "❌ Error: No default Google Cloud project set."
    echo "Run: gcloud config set project YOUR_GCP_PROJECT_ID"
    exit 1
fi

echo "Deploying to GCP Project: ${CURRENT_PROJECT}..."

# Deploy directly from source via Google Cloud Build + Cloud Run
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --platform managed \
  --region "${REGION}" \
  --port "${PORT}" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1

echo "=================================================================="
echo "✅ Deployment completed successfully!"
gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format="value(status.url)"
echo "=================================================================="
