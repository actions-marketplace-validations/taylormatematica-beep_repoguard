FROM node:20-alpine

WORKDIR /app

COPY . .

ENTRYPOINT ["node", "bin/mcp.js"]
