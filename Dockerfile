# Use the official Bun image
FROM oven/bun

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies using Bun
RUN bun install

# Build frontend (assuming your React app is in /frontend)
RUN cd frontend && bun run build

# Expose port (adjust if your server uses a different port)
EXPOSE 3000

# Start your Bun server
CMD ["bun", "run", "server/index.ts"]
