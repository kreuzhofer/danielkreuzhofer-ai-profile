# syntax=docker/dockerfile:1

# ============================================
# Base stage - shared dependencies
# ============================================
FROM node:20-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Dependencies stage - install node modules
# ============================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# ============================================
# Development stage - for local development
# ============================================
FROM base AS development

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port 8087 for development
EXPOSE 8087

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=8087
ENV HOSTNAME="0.0.0.0"

# Start development server on port 8087
CMD ["npm", "run", "dev", "--", "-p", "8087"]

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variable for production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ============================================
# Production stage - run the application
# ============================================
FROM base AS production

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8087
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output (requires output: 'standalone' in next.config)
# For now, copy the full .next directory
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port 8087 for production
EXPOSE 8087

# Start production server on port 8087
CMD ["npm", "run", "start", "--", "-p", "8087"]
