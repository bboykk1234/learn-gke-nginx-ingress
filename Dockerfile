FROM node:14.17-alpine AS base

WORKDIR /usr/src/app
RUN chown node:node -R /usr/src/app
COPY --chown=node:node package* ./
USER node
RUN npm install --production
COPY --chown=node:node . .
EXPOSE 3000

CMD [ "node", "index.js" ]
