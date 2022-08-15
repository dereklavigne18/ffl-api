// Packages
const { Promise } = require('bluebird');
const { createClient } = require('redis');

// App Imports
const { logger } = require('./logger');

const REDIS_URL = 'redis://redis:6379';
const TTL_UNIT_SECONDS = 'EX';

const cache = createClient({
  url: REDIS_URL
});
logger.debug('Attempting to connect to Redis');
cache.connect();
logger.debug('Connected to redis');

Promise.promisifyAll(cache);

async function getSet({ key, loader, ttl }) {
  logger.debug(`getSet({ key: ${key}, loader: ${loader}, ttl: ${ttl} })`);

  logger.debug(`Checking if key exists - ${key}`);
  if (await cache.existsAsync(key)) {
    logger.debug(`Key Exists - Loading key - ${key}`);
    const found = await cache.getAsync(key);
    logger.debug(`Loaded key - ${found}`);
    return JSON.parse(found);
  }

  logger.debug(`Falling back on loader - ${ loader }`);
  const loaded = await loader();
  logger.debug(`Load finished (setting cache) - ${loaded}`);
  cache.setAsync(key, JSON.stringify(loaded), TTL_UNIT_SECONDS, ttl);
  logger.debug(`Cache Set`);

  return loaded;
}

module.exports = {
  getSet,
};
