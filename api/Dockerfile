FROM node:lts-buster as build
WORKDIR /usr/src/app
ADD . .

FROM node:lts-buster-slim as running
RUN apt-get update && \
    apt-get -y upgrade && \
    apt-get -y autoremove && \ 
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
HEALTHCHECK CMD node healthcheck
EXPOSE 3000

FROM build as build-dev
RUN npm ci && npm run build

FROM running as development
RUN apt-get update && npm i -g nodemon
COPY --from=build-dev /usr/src/app .
CMD ["nodemon", "./src/server.ts"]

FROM build as build-prod
RUN npm ci --production && npm run build

FROM running as production
COPY --from=build-prod /usr/src/app/package.json ./package.json
COPY --from=build-prod /usr/src/app/package-lock.json ./package-lock.json
COPY --from=build-prod /usr/src/app/node_modules ./node_modules
COPY --from=build-dev /usr/src/app/dist ./dist
CMD ["node", "./dist/src/server.js"]