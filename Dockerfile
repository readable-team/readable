FROM oven/bun:1
WORKDIR /app

ARG TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV TURBO_REMOTE_ONLY=true

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tini \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH="/root/.pulumi/bin:$PATH"

COPY . .
RUN bun install --frozen-lockfile

ENV NODE_ENV=production
RUN bun run build

USER bun
ENTRYPOINT ["/usr/bin/tini", "--"]
