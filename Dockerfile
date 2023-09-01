FROM node:16-alpine3.16 as builder

ARG GH_BACKEND_URL
ARG GH_IPFS_URL
ARG GH_GA_ID
ARG GH_AMP_ID

ENV BACKEND_URL=${GH_BACKEND_URL} \
    IPFS_URL=${GH_IPFS_URL} \
    GA_ID=${GH_GA_ID} \
    AMP_ID=${GH_AMP_ID}

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN set -x \
    && mv ci.env .env \
    && yarn install \
    && NODE_ENV=production yarn build 


EXPOSE 3003
CMD ["yarn", "start"]
