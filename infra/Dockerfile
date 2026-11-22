FROM node:22.22.2-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /srv
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY apps/api apps/api
COPY apps/worker apps/worker
RUN pnpm --filter @becas/api db:generate && pnpm -r build
FROM build AS api
USER node
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 3001
CMD ["node","apps/api/dist/main.js"]
FROM build AS worker
RUN apt-get update && apt-get install -y --no-install-recommends python3-venv && rm -rf /var/lib/apt/lists/* && python3 -m venv /opt/pdf && /opt/pdf/bin/pip install --no-cache-dir -r apps/worker/requirements.txt
ENV PYTHON_BIN=/opt/pdf/bin/python
ENV NODE_ENV=production
USER node
ENTRYPOINT ["node","apps/worker/dist/main.js"]
CMD ["--help"]
