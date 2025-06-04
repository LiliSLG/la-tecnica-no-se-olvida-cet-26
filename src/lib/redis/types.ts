export type RedisKey = string;
export type RedisValue = string | number | boolean | null;

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheEntry<T> {
  key: RedisKey;
  value: T;
  ttl: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage: number;
}

export type CacheInvalidationStrategy = 'immediate' | 'lazy' | 'scheduled';

export interface CacheInvalidationOptions {
  strategy: CacheInvalidationStrategy;
  delay?: number;
  pattern?: string;
} 