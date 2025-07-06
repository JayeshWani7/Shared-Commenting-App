# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci --network-timeout=300000 --maxsockets=5 && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --network-timeout=300000 --maxsockets=5 && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Use dumb-init to handle signals properly and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
