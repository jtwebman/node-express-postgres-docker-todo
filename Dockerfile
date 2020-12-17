FROM node:lts as build
WORKDIR /usr/src/app
ADD . .
RUN find

FROM node:lts-slim as running
WORKDIR /usr/src/app
HEALTHCHECK CMD node healthcheck
EXPOSE 3000

FROM build as build-dev
ENV NODE_ENV=development
RUN npm ci

FROM running as development
COPY --from=build-dev /usr/src/app .
RUN npm i nodemon -g
CMD ["nodemon", "server"]

FROM build as build-prod
RUN npm ci --production

FROM running as production
COPY --from=build-prod /usr/src/app .
CMD ["node", "server.js"]