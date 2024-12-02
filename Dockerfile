FROM node:23-slim AS build
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install

COPY ./src /app/src
COPY ./vite.config.ts /app/vite.config.ts
COPY ./tailwind.config.ts /app/tailwind.config.ts
COPY ./tsconfig.json /app/tsconfig.json
COPY ./postcss.config.mjs /app/postcss.config.mjs
RUN yarn build

FROM node:23-slim AS production
WORKDIR /app

COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock

RUN NODE_ENV=production yarn install

CMD ["yarn", "serve"]
