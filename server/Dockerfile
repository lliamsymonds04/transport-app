FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace packages
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm ci

# Copy source files
COPY shared ./shared
COPY server ./server
COPY tsconfig.base.json ./

# Build shared and server
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "dist/server.js"]
