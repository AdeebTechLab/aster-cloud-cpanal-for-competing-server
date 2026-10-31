FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci

COPY frontend ./frontend
RUN npm run build --workspace frontend

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "frontend"]