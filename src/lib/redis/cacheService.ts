import { Redis } from 'ioredis';
import { ServiceResult } from '@/types/service';
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
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memoryUsage: 0,
  };

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

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

  async get<T>(key: string): Promise<ServiceResult<T>> {
    try {
      const data = await this.redis.get(key);
      if (!data) {
        return { data: null };
      }
      return { data: JSON.parse(data) as T };
    } catch (error) {
      console.error('Error getting from cache:', error);
      return { error: { message: 'Error getting from cache' } };
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<ServiceResult<void>> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, stringValue);
      } else {
        await this.redis.set(key, stringValue);
      }
      return { data: undefined };
    } catch (error) {
      console.error('Error setting cache:', error);
      return { error: { message: 'Error setting cache' } };
    }
  }

  async delete(key: string): Promise<ServiceResult<void>> {
    try {
      await this.redis.del(key);
      return { data: undefined };
    } catch (error) {
      console.error('Error deleting from cache:', error);
      return { error: { message: 'Error deleting from cache' } };
    }
  }

  async clear(): Promise<ServiceResult<void>> {
    try {
      await this.redis.flushall();
      return { data: undefined };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { error: { message: 'Error clearing cache' } };
    }
  }

  public async exists(key: RedisKey, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.generateKey(key, options);
    const client = this.redis;

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
    const client = this.redis;
    const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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
    const client = this.redis;
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
}

export const cacheService = CacheService.getInstance(); 