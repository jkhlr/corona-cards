FROM node:13.12.0-alpine3.11 as base

RUN apk add --no-cache --update yarn

RUN /bin/mkdir -p /srv/logs /srv/app /srv/dist
WORKDIR /srv

FROM base as build

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src src
RUN yarn run build

FROM base as run

ENV NODE_ENV='production'
RUN apk add --update supervisor && rm -rf /var/cache/apk/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --from=build /srv/dist /srv/app

EXPOSE 8000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
