# ONLY FOR DEVELOPMENT AND TESTING USE

# Install dependencies with yarn.
FROM node:16-alpine as deps

WORKDIR /opt/build
COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile


# Build with Next (no default command).
FROM cypress/base:latest as build

WORKDIR /opt/build
COPY --from=deps /opt/build/node_modules ./node_modules/
COPY --from=deps /root/.cache /root/.cache/
# NB! Copies any .env file(s) as well!
COPY . .

RUN yarn build
