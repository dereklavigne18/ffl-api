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
  logger.debug(`getSet({ key: ${key}, loader: ${loader}, ttl: ${ttl} })`);
  if (!cache) {
    logger.error("Cache client has not connected.")
  }

  logger.debug(`Checking if key exists - ${key}`);
  if (await cache.exists(key)) {
    logger.debug(`Key Exists - Loading key - ${key}`);
    const found = await cache.get(key);
    logger.debug(`Loaded key - ${found}`);
    return JSON.parse(found);
  }

  logger.debug(`Falling back on loader - ${ loader }`);
  const loaded = await loader();
  logger.debug(`Load finished (setting cache) - ${loaded}`);
  cache.set(key, JSON.stringify(loaded), TTL_UNIT_SECONDS, ttl);
  logger.debug(`Cache Set`);

  return loaded;
}

module.exports = {
  cacheConnect,
  getSet,
};
