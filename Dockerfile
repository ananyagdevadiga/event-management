# =============================================
# Stage 1: Build the React application
# =============================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Pass Supabase environment variables at build time
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

# Build the production React app
RUN npm run build

# =============================================
# Stage 2: Serve with Nginx
# =============================================
FROM nginx:1.25-alpine AS production

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Expose only port 80 (Nginx)
EXPOSE 80

# Health check to verify container is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
