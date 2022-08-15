FROM node:18

COPY . /app/
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# For the sake of development, all packages should be installed outside the working directory (so we can mount safely)
ENV NODE_PATH /etc/ffl-api/node_modules
COPY package.json /etc/ffl-api/package.json
RUN npm install --prefix /etc/ffl-api