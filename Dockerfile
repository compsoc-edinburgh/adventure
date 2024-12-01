FROM node:23

COPY . /app
WORKDIR /app

RUN npx remix vite:build

CMD ["npx", "remix-serve", "build/server/index.js"]
