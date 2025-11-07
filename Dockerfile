FROM alpine:3.22 AS build
WORKDIR /app
RUN apk add --update --no-cache nodejs yarn

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install

COPY ./src /app/src
COPY ./server /app/server
COPY ./vite.config.ts /app/vite.config.ts
COPY ./tailwind.config.ts /app/tailwind.config.ts
COPY ./tsconfig.json /app/tsconfig.json
COPY ./postcss.config.mjs /app/postcss.config.mjs
COPY ./react-router.config.ts /app/react-router.config.ts
RUN yarn build

FROM alpine:3.22 AS vendor
WORKDIR /app
RUN apk add --update --no-cache nodejs yarn

ENV NODE_ENV=production

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install --production

FROM alpine:3.22 AS production
WORKDIR /app

RUN apk update
RUN apk add --update --no-cache nodejs
RUN apk add --update --no-cache supervisor && rm  -rf /tmp/* /var/cache/apk/*

ADD supervisord.conf /etc/

ENV NODE_ENV=production

COPY --from=vendor /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY package.json /app/package.json
COPY server.js /app/server.js

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
