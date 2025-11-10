FROM alpine:3.22 AS eshop-build
WORKDIR /app
RUN apk add --update --no-cache nodejs yarn

COPY ./eshop/package.json /app/package.json
COPY ./eshop/yarn.lock /app/yarn.lock

RUN yarn install

COPY ./eshop/src /app/src
COPY ./eshop/server /app/server
COPY ./eshop/vite.config.ts /app/vite.config.ts
COPY ./eshop/tailwind.config.ts /app/tailwind.config.ts
COPY ./eshop/tsconfig.json /app/tsconfig.json
COPY ./eshop/postcss.config.mjs /app/postcss.config.mjs
COPY ./eshop/react-router.config.ts /app/react-router.config.ts
RUN yarn build

FROM alpine:3.22 AS eshop-vendor
WORKDIR /app
RUN apk add --update --no-cache nodejs yarn

ENV NODE_ENV=production

COPY ./eshop/package.json /app/package.json
COPY ./eshop/yarn.lock /app/yarn.lock

RUN yarn install --production

FROM alpine:3.22 AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apk update
RUN apk add --update --no-cache nodejs
RUN apk add --update --no-cache poetry
RUN apk add --update --no-cache curl
RUN apk add --update --no-cache supervisor && rm  -rf /tmp/* /var/cache/apk/*

ENV DATA_DIR=data

# Core files
COPY core/fetch_stars.sh /app/core/fetch_stars.sh
RUN echo -e "*/15 * * * * supervisorctl -c /etc/supervisor/supervisord.conf start core\n" >> /etc/crontabs/root
RUN crond -b

# eShop files
COPY --from=eshop-vendor /app/node_modules /app/eshop/node_modules
COPY --from=eshop-build /app/build /app/eshop/build
COPY eshop/package.json /app/eshop/package.json
COPY eshop/server.js /app/eshop/server.js

# notifier files
COPY notifier/aoc_bot /app/notifier/aoc_bot
COPY notifier/.python-version /app/notifier/.python-version
COPY notifier/poetry.lock /app/notifier/poetry.lock
COPY notifier/pyproject.toml /app/notifier/pyproject.toml
RUN cd notifier && poetry install --no-cache -vv --without dev

# Supervisor config
COPY supervisord.conf /etc/supervisor/

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisor/supervisord.conf"]
