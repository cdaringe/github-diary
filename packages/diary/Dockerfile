FROM node:10-alpine
RUN apk update && apk add vim
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
RUN mkdir -p /diary
WORKDIR /diary
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN chown -R node /diary
RUN yarn
COPY src src
USER node
ENTRYPOINT ["/tini", "--", "node", "src/bin.js" ]
