FROM node:23-alpine AS build
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

FROM node:23-alpine AS vendor
WORKDIR /app

ENV NODE_ENV=production

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install --production

FROM node:23-alpine AS production
WORKDIR /app

RUN apk update
RUN apk add --update supervisor && rm  -rf /tmp/* /var/cache/apk/*

ADD supervisord.conf /etc/

ENV NODE_ENV=production

COPY --from=build /app/build /app/build
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=vendor /app/node_modules /app/node_modules

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
