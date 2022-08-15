FROM node:18

COPY . /app/
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# For the sake of development, all packages should be installed outside the working directory (so we can mount safely).
# Adding the bin to path will help with running the commands
ENV NODE_PATH /etc/ffl-api/node_modules
COPY package.json /etc/ffl-api/package.json
RUN npm install --prefix /etc/ffl-api
ENV PATH="${PATH}:/etc/ffl-api/node_modules/.bin"