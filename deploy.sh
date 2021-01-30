#!/bin/bash

# Get node.js package version
PACKAGE_VERSION=$(grep '"version":' package.json | cut -d\" -f4)

# Build containers dev and production
docker build -t jtwebman/node-express-postgres-docker-todo:dev --target=development .
docker build -t jtwebman/node-express-postgres-docker-todo .

# Tag production with package version as well
docker tag jtwebman/node-express-postgres-docker-todo "jtwebman/node-express-postgres-docker-todo:$PACKAGE_VERSION"

# Push versions to docker hub
docker push jtwebman/node-express-postgres-docker-todo:latest
docker push "jtwebman/node-express-postgres-docker-todo:$PACKAGE_VERSION"
docker push jtwebman/node-express-postgres-docker-todo:dev