FROM oven/bun

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ npm && apt-get clean

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN cd frontend && npm install
RUN cd frontend && npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
