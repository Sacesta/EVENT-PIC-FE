# Multi-stage build for React + Vite application
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_BACKEND_URL=https://api.pic-events.co.il
ARG VITE_MAPBOX_TOKEN
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with the environment variable
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

