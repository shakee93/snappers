# Stage 1: Dependencies
FROM node:21.1.0-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:21.1.0-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables (placeholders - override in production)
# These are set at build time for static optimization
ENV NEXT_PUBLIC_WP_GRAPHQL=${NEXT_PUBLIC_WP_GRAPHQL:-https://api.gqmobiles.lk/graphql}
ENV NEXT_PUBLIC_TYPESENSE_HOST=${NEXT_PUBLIC_TYPESENSE_HOST:-search.gqmobiles.lk}
ENV NEXT_PUBLIC_TYPESENSE_PORT=${NEXT_PUBLIC_TYPESENSE_PORT:-443}
ENV NEXT_PUBLIC_TYPESENSE_PATH=${NEXT_PUBLIC_TYPESENSE_PATH:-}
ENV NEXT_PUBLIC_TYPESENSE_PROTOCOL=${NEXT_PUBLIC_TYPESENSE_PROTOCOL:-https}
ENV NEXT_PUBLIC_MERCHANT_ID=${NEXT_PUBLIC_MERCHANT_ID:-215650}
ENV NEXT_PUBLIC_PAYHERE_IS_TESTING=${NEXT_PUBLIC_PAYHERE_IS_TESTING:-false}
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN:-http://localhost:3000}
ENV NEXT_PUBLIC_PAYHERE_IS_LIVE=${NEXT_PUBLIC_PAYHERE_IS_LIVE:-true}
ENV PAYHERE_MERCHANT_KEY=${PAYHERE_MERCHANT_KEY:-}
ENV GQ_PAYHERE_MERCHANT_SECRET_KEY=${GQ_PAYHERE_MERCHANT_SECRET_KEY:-}
ENV GENIE_MERCHANT_ID=${GENIE_MERCHANT_ID:-}
ENV GENIE_API_KEY=${GENIE_API_KEY:-}
ENV GENIE_SANDBOX=${GENIE_SANDBOX:-true}

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:21.1.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from standalone build
# The standalone output includes server.js in .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Expose port 3002
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set environment variables (placeholders - override at runtime)
ENV NEXT_PUBLIC_WP_GRAPHQL=${NEXT_PUBLIC_WP_GRAPHQL:-https://api.gqmobiles.lk/graphql}
ENV NEXT_PUBLIC_TYPESENSE_HOST=${NEXT_PUBLIC_TYPESENSE_HOST:-search.gqmobiles.lk}
ENV NEXT_PUBLIC_TYPESENSE_PORT=${NEXT_PUBLIC_TYPESENSE_PORT:-443}
ENV NEXT_PUBLIC_TYPESENSE_PATH=${NEXT_PUBLIC_TYPESENSE_PATH:-}
ENV NEXT_PUBLIC_TYPESENSE_PROTOCOL=${NEXT_PUBLIC_TYPESENSE_PROTOCOL:-https}
ENV NEXT_PUBLIC_MERCHANT_ID=${NEXT_PUBLIC_MERCHANT_ID:-215650}
ENV NEXT_PUBLIC_PAYHERE_IS_TESTING=${NEXT_PUBLIC_PAYHERE_IS_TESTING:-false}
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN:-http://localhost:3000}
ENV NEXT_PUBLIC_PAYHERE_IS_LIVE=${NEXT_PUBLIC_PAYHERE_IS_LIVE:-true}
ENV PAYHERE_MERCHANT_KEY=${PAYHERE_MERCHANT_KEY:-}
ENV GQ_PAYHERE_MERCHANT_SECRET_KEY=${GQ_PAYHERE_MERCHANT_SECRET_KEY:-}
ENV GENIE_MERCHANT_ID=${GENIE_MERCHANT_ID:-}
ENV GENIE_API_KEY=${GENIE_API_KEY:-}
ENV GENIE_SANDBOX=${GENIE_SANDBOX:-true}

CMD ["node", "server.js"]

