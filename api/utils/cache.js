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
  if (await cache.existsAsync(key)) {
    const found = await cache.getAsync(key);
    return JSON.parse(found);
  }

  const loaded = await loader();
  cache.setAsync(key, JSON.stringify(loaded), TTL_UNIT_SECONDS, ttl);

  return loaded;
}

module.exports = {
  getSet,
};
