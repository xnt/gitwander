FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY dist/ ./dist/
ENTRYPOINT ["node", "dist/index.js"]
