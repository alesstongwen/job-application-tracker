FROM oven/bun

WORKDIR /app

# Install build tools and Python needed for node-gyp
RUN apk add --no-cache python3 make g++  # For Alpine-based images like oven/bun

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy rest of the files
COPY . .

# Build frontend
RUN cd frontend && bun run build

EXPOSE 3000

CMD ["bun", "run", "server/index.ts"]
