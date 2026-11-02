# Development image. Compose Watch syncs source into this dependency image.
FROM node:24-bookworm-slim
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY crm/package.json ./crm/package.json
COPY careers/package.json ./careers/package.json
COPY shared/ui/package.json ./shared/ui/package.json
RUN npm ci --no-audit --no-fund
COPY backend ./backend
COPY crm ./crm
COPY careers ./careers
COPY shared ./shared
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev", "--workspace", "@sleektech/backend"]
