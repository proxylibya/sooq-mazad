FROM node:20-alpine

RUN apk add --no-cache libc6-compat curl python3 make g++
WORKDIR /app

ENV HUSKY=0

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY apps/api/package.json ./apps/api/package.json
RUN npm ci --legacy-peer-deps

COPY . .

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV API_PORT=3020

RUN npm run build

EXPOSE 3020

CMD ["npm", "run", "start"]
