# ONLY FOR DEVELOPMENT AND TESTING USE

# Install dependencies with yarn.
# Node 14 is the version Vercel uses.
FROM node:14-alpine as deps

WORKDIR /opt/build
COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile


# Build with Next (no default command).
FROM cypress/base:latest as build

ARG SANITY_TOKEN
ARG SANITY_DATASET

WORKDIR /opt/build
COPY --from=deps /opt/build/node_modules ./node_modules/
COPY --from=deps /root/.cache /root/.cache/
# NB! Copies any .env files as well.
COPY . .

RUN yarn build
