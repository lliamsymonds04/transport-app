
# Stage 1 - Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

RUN npm ci

# Copy both server and shared code
COPY server ./server
COPY shared ./shared

WORKDIR /app/server

RUN npm run build

# Stage 2 - Run
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/shared ./shared

EXPOSE 3000
CMD ["node", "dist/server.js"]
