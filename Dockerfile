# ==========================================
# Stage 1: Build the Vite React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./

# Install npm packages
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy application source code
COPY . .

# Build production bundle (generates /app/dist)
RUN npm run build

# ==========================================
# Stage 2: Serve with Production Nginx
# ==========================================
FROM nginx:alpine AS runner

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration for SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to ensure nginx is serving requests
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
