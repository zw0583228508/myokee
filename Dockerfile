FROM node:20-alpine

WORKDIR /workspace

RUN npm install -g pnpm

# Copy workspace manifests first (layer caching)
COPY package.json pnpm-workspace.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install dependencies
RUN pnpm install

# Copy full source
COPY . .

# Build api-server
RUN pnpm --filter @workspace/api-server run build

WORKDIR /workspace/artifacts/api-server

EXPOSE 10000

CMD ["node", "dist/index.cjs"]
