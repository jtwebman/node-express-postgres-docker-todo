FROM node:lts as build
WORKDIR /usr/src/app
ADD . .

FROM node:lts-slim as running
WORKDIR /usr/src/app
HEALTHCHECK CMD node healthcheck
EXPOSE 3000

FROM build as build-dev
RUN npm ci

FROM running as development
RUN apt-get update && apt-get install -y inotify-tools && npm i -g nodemon
COPY --from=build-dev /usr/src/app .
CMD ["nodemon", "server"]

FROM build as build-prod
RUN npm ci --production

FROM running as production
COPY --from=build-prod /usr/src/app .
CMD ["node", "server.js"]