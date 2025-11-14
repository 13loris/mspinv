FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile || true
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
