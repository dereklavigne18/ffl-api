const { Promise } = require('bluebird');
const redis = require('redis');

const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;

const TTL_UNIT_SECONDS = 'EX';

const cache = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});
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
