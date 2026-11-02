# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Studium API - legacy Node.js / Express application.
#
# The API imports source files from ../batchs at build time, so the build
# context MUST be the repository root:
#
#   docker build -f api/Dockerfile -t studium/api:latest .
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

WORKDIR /app

# Install the toolchain first so this layer is cached when only source changes.
COPY api/package.json api/package-lock.json ./api/
RUN cd api && npm install --no-audit --no-fund

# API sources + the batch sources imported by prosopographyService/draftService.
COPY api ./api
COPY batchs ./batchs

# batchs/.babelrc resolves its Babel plugins from batchs/node_modules.
# Reuse the API toolchain instead of installing a second dependency tree.
RUN ln -s /app/api/node_modules /app/batchs/node_modules

# webpack build -> api/docker/build/server.js (+ docs/ and resources/)
RUN cd api && npm run build


# ---------------------------------------------------------------------------
# Runtime image: production dependencies + the webpack bundle only.
# ---------------------------------------------------------------------------
FROM node:8.17.0 AS runtime

ENV NODE_ENV=production \
    APP_MODE=PROD

WORKDIR /app

# Copy package.json and install production dependencies.
COPY api/package.json api/package-lock.json ./
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
