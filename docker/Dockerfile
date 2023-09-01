FROM node:16-alpine3.16 as builder

ARG GH_BACKEND_URL
ARG GH_IPFS_URL
ARG GH_GA_ID
ARG GH_AMP_ID

ENV BACKEND_URL=${GH_BACKEND_URL} \
    IPFS_URL=${GH_IPFS_URL} \
    GA_ID=${GH_GA_ID} \
    AMP_ID=${GH_AMP_ID}

WORKDIR /opt/subsocial/app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN set -x \
    && mv ci.env .env \
    && NODE_ENV=production yarn build

FROM gcr.io/distroless/nodejs:16 AS runner

ARG GH_BACKEND_URL
ARG GH_IPFS_URL
ARG GH_GA_ID
ARG GH_AMP_ID

ENV BACKEND_URL=${GH_BACKEND_URL} \
    IPFS_URL=${GH_IPFS_URL} \
    GA_ID=${GH_GA_ID} \
    AMP_ID=${GH_AMP_ID}

WORKDIR /opt/subsocial/app

COPY --from=builder /opt/subsocial/app .

CMD [ "/opt/subsocial/app/node_modules/.bin/next", "start", "-p", "3003" ]

