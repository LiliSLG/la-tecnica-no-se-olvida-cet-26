import { redisClient } from './client';
import { REDIS_KEYS } from './config';
import {
  RedisKey,
  RedisValue,
  CacheOptions,
  CacheEntry,
  CacheStats,
  CacheInvalidationOptions,
} from './types';

export class CacheService {
  private static instance: CacheService;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memoryUsage: 0,
  };

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(key: RedisKey, options?: CacheOptions): RedisKey {
    const prefix = options?.prefix || REDIS_KEYS.PREFIX;
    return `${prefix}${key}`;
  }

  public async get<T>(key: RedisKey, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.generateKey(key, options);
    const client = redisClient.getClient();

    try {
      const value = await client.get(fullKey);
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  public async set<T>(
    key: RedisKey,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    const fullKey = this.generateKey(key, options);
    const client = redisClient.getClient();
    const ttl = options?.ttl || REDIS_KEYS.TTL.DEFAULT;

    try {
      const serializedValue = JSON.stringify(value);
      await client.set(fullKey, serializedValue, 'EX', ttl);
      this.stats.keys++;
      await this.updateStats();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  public async delete(key: RedisKey, options?: CacheOptions): Promise<void> {
    const fullKey = this.generateKey(key, options);
    const client = redisClient.getClient();

    try {
      await client.del(fullKey);
      this.stats.keys = Math.max(0, this.stats.keys - 1);
      await this.updateStats();
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  public async exists(key: RedisKey, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.generateKey(key, options);
    const client = redisClient.getClient();

    try {
      const exists = await client.exists(fullKey);
      return exists === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  public async invalidate(
    pattern: string,
    options?: CacheInvalidationOptions
  ): Promise<void> {
    const client = redisClient.getClient();
    const subscriber = redisClient.getSubscriber();

    try {
      switch (options?.strategy || 'immediate') {
        case 'immediate':
          const keys = await client.keys(pattern);
          if (keys.length > 0) {
            await client.del(...keys);
            this.stats.keys = Math.max(0, this.stats.keys - keys.length);
          }
          break;

        case 'lazy':
          await subscriber.publish(REDIS_KEYS.CHANNELS.CACHE_INVALIDATION, pattern);
          break;

        case 'scheduled':
          if (options.delay) {
            setTimeout(async () => {
              const keys = await client.keys(pattern);
              if (keys.length > 0) {
                await client.del(...keys);
                this.stats.keys = Math.max(0, this.stats.keys - keys.length);
              }
            }, options.delay);
          }
          break;
      }

      await this.updateStats();
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  public async getStats(): Promise<CacheStats> {
    await this.updateStats();
    return { ...this.stats };
  }

  private async updateStats(): Promise<void> {
    const client = redisClient.getClient();
    try {
      const info = await client.info('memory');
      const memoryUsage = this.parseMemoryUsage(info);
      this.stats.memoryUsage = memoryUsage;
    } catch (error) {
      console.error('Cache stats update error:', error);
    }
  }

  private parseMemoryUsage(info: string): number {
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        return parseInt(line.split(':')[1], 10);
      }
    }
    return 0;
  }

  public async clear(): Promise<void> {
    const client = redisClient.getClient();
    try {
      const keys = await client.keys(`${REDIS_KEYS.PREFIX}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      this.stats = {
        hits: 0,
        misses: 0,
        keys: 0,
        memoryUsage: 0,
      };
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const cacheService = CacheService.getInstance(); 