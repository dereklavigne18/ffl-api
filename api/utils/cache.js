// Packages
const { Promise } = require('bluebird');
const { createClient } = require('redis');

// App Imports
const { logger } = require('./logger');

const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;
const TTL_UNIT_SECONDS = 'EX';

var cache = null;

async function cacheConnect() {
  if (cache) {
    return;
  }

  cache = createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      connectionTimeout: 10000, // in ms
    }
  });
  logger.debug('Attempting to connect to Redis');
  await cache.connect();
  logger.debug('Connected to redis');
}

async function getSet({ key, loader, ttl }) {
  if (!cache) {
    logger.error("Cache client has not connected.")
  }

  if (await cache.exists(key)) {
    const found = await cache.get(key);
    return JSON.parse(found);
  }

  const loaded = await loader();
  cache.set(key, JSON.stringify(loaded), TTL_UNIT_SECONDS, ttl);

  return loaded;
}

module.exports = {
  cacheConnect,
  getSet,
};
