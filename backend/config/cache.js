const IORedis = require('ioredis');

let redis;

function createRedis(overrides = {}) {
  if (redis) {
    return redis;
  }

  const {
    host = process.env.REDIS_HOST || '127.0.0.1',
    port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password = process.env.REDIS_PASSWORD,
    lazyConnect = true
  } = overrides;

  redis = new IORedis({ host, port, password, lazyConnect });
  return redis;
}

module.exports = { createRedis };
