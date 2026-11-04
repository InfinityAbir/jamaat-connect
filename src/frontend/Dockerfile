# Build stage
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies
COPY src/frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY src/frontend/ ./
RUN npm run build

# Runtime stage - nginx
FROM nginx:alpine AS final
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]