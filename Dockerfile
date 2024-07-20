FROM oven/bun:1
WORKDIR /app

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
