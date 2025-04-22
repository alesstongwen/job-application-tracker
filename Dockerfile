# Use Bun official image
FROM oven/bun

WORKDIR /app

# Copy only package files first for better caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Now copy the rest of the files
COPY . .

# Build frontend
RUN cd frontend && bun run build

# Expose port (adjust if needed)
EXPOSE 3000

# Start server
CMD ["bun", "run", "server/index.ts"]
