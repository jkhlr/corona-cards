FROM node:13.12.0-alpine3.11 as build

RUN apk add --no-cache --update yarn

WORKDIR /srv
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src src
COPY public public
RUN yarn run build

FROM nginx:1.16-alpine as prod

WORKDIR /etc/nginx/conf.d
RUN apk add --no-cache --update python py-pip
RUN pip install --no-cache-dir j2cli==0.3.10

COPY proxy-nginx.j2 .
COPY --from=build /srv/dist /usr/share/nginx/html

CMD j2 proxy-nginx.j2 > default.conf && nginx -g "daemon off;";
