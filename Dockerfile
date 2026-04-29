# Use the official Bun image
FROM oven/bun:1.0 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code and build the application
COPY . .
RUN bun run build

# Production stage (serve static files via Nginx)
FROM nginx:alpine AS production

# Copy the static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
