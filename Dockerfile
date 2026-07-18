# Use official Node.js 18 image as a build environment
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy dependency definitions
COPY package*.json ./
COPY turbo.json ./

# Install all dependencies (including dev dependencies for TypeScript compilation)
RUN npm install

# Copy source code (excluding items in .dockerignore)
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/shared/infrastructure/database/schema.prisma

# Build the TypeScript code (using esbuild for speed)
RUN npx esbuild src/api/server.ts --bundle --platform=node --target=node18 --outfile=dist/api/server.js

# -----------------------------------------------------
# Production Environment
# -----------------------------------------------------
FROM node:18-bullseye-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/shared/infrastructure/database ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3000

# Run the API Gateway
CMD ["node", "dist/api/server.js"]
