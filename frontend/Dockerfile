FROM node:20-bookworm-slim AS build
WORKDIR /app
ARG BACKEND_URL=http://backend:4000
ENV BACKEND_URL=$BACKEND_URL
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
