FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENTRYPOINT ["node", "bin/mcp.js"]
