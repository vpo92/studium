# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Studium API - legacy Node.js / Express application.
#
# The API imports source files from ../batchs at build time, so the build
# context MUST be the repository root:
#
#   docker build -f api/docker/Dockerfile.api -t studium/api:latest .
#
# or, from the api/ directory:
#
#   npm run docker:build
#
# Node 8.17.0 is the last 8.x release. This code is Babel 6 / webpack 3 /
# mongoose 5 era, and Node 8.17.0 is the newest version of that line that is
# published for both linux/amd64 and linux/arm64 (node:8.1 is amd64-only).
# ---------------------------------------------------------------------------

FROM node:8.17.0 AS build

# Copy sources to /app/api and /app/batchs
# The build context is the repository root (.).
COPY api /app/api
COPY batchs /app/batchs

# Install the toolchain. Now package.json is directly in the WORKDIR.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Link batchs node_modules. This needs to be relative to /app/api.
RUN ln -s /app/api/node_modules /app/batchs/node_modules

# webpack build.
RUN npm run build


# ---------------------------------------------------------------------------
# Runtime image: production dependencies + the webpack bundle only.
# ---------------------------------------------------------------------------
FROM node:8.17.0 AS runtime

ENV NODE_ENV=production \
    APP_MODE=PROD

# Copy package.json and install production dependencies.
COPY package.json package-lock.json ./
RUN npm install --production --no-audit --no-fund \
    && npm cache clean --force

# The webpack bundle keeps babel-runtime as an external require, but the
# upstream package.json declares it as a devDependency. Copy it (and its two
# runtime dependencies) from the build stage.
COPY --from=build /app/api/node_modules/babel-runtime ./node_modules/babel-runtime
COPY --from=build /app/api/node_modules/core-js ./node_modules/core-js
COPY --from=build /app/api/node_modules/regenerator-runtime ./node_modules/regenerator-runtime

# Bundle + static files served by routes.js when APP_MODE=PROD.
COPY --from=build /app/api/docker/build/server.js ./server.js
COPY --from=build /app/api/docker/build/docs ./docs
COPY --from=build /app/api/docker/build/resources ./resources

RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
