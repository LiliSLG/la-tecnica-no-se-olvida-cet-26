import { RedisOptions } from 'ioredis';

export const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
};

export const REDIS_KEYS = {
  PREFIX: 'ltnso:', // La Técnica No Se Olvida prefix
  SEPARATOR: ':',
  TTL: {
    DEFAULT: 3600, // 1 hour in seconds
    SHORT: 300,    // 5 minutes in seconds
    LONG: 86400,   // 24 hours in seconds
  },
  CHANNELS: {
    CACHE_INVALIDATION: 'cache:invalidation',
    HEALTH_CHECK: 'health:check',
  },
} as const;

export const REDIS_CHANNELS = {
  CACHE_INVALIDATION: 'cache:invalidation',
  HEALTH_CHECK: 'health:check',
} as const; 