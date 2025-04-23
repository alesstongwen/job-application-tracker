FROM oven/bun

WORKDIR /app

# Install build tools and npm
RUN apt-get update && apt-get install -y python3 make g++ npm && apt-get clean

# Backend install
COPY package.json bun.lockb ./
RUN bun install

COPY . .

# Frontend install & build using npm for better compatibility
RUN cd frontend && npm install
RUN cd frontend && npm run build

EXPOSE 3000

CMD bun run server/index.ts
