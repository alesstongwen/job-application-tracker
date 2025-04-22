FROM oven/bun

WORKDIR /app

# Install build tools and Python for Debian-based images
RUN apt-get update && apt-get install -y python3 make g++ && apt-get clean

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
