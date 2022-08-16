// Native
const fs = require("fs");
const path = require("path");

// Packages
const { ApolloServer } = require("apollo-server");

// Server Start
const { logger, LogLevel } = require("./utils/logger");
const environment = process.env.NODE_ENV;
if (environment === "development") {
  logger.setLogLevel(LogLevel.DEBUG);
}

const { cacheConnect } = require("./utils/cache");
const resolvers = require("./resolvers");
const typeDefs = fs.readFileSync(
  path.resolve(__dirname, "schema.graphql"),
  "utf-8"
);

async function serverStarted({ url }) {
  await cacheConnect();
  logger.info(`Server Started at ${url}`);
}

const server = new ApolloServer({ typeDefs, resolvers });
server
  .listen({
    port: 3000,
  })
  .then(serverStarted);
