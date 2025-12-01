FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build -w apps/web

FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /usr/src/app/apps/web/public ./apps/web/public
COPY --from=builder /usr/src/app/apps/web/.next/standalone ./
COPY --from=builder /usr/src/app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
