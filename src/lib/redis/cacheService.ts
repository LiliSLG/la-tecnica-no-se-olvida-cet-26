import { Redis } from 'ioredis';
import { ServiceResult } from '@/lib/supabase/types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { REDIS_KEYS } from './config';
import {
  RedisKey,
  RedisValue,
  CacheOptions,
  CacheEntry,
  CacheStats,
  CacheInvalidationOptions,
} from './types';

/**
 * Service for managing Redis cache operations
 */
export class CacheService {
  private static instance: CacheService;
  private readonly redis: Redis;
  private readonly defaultTtl: number;
  private readonly prefix: string;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memoryUsage: 0,
  };

  private constructor(redis: Redis, options: CacheOptions = {}) {
    this.redis = redis;
    this.defaultTtl = options.ttl || 3600; // Default 1 hour
    this.prefix = options.prefix || 'cache:';
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(new Redis(process.env.REDIS_URL || 'redis://localhost:6379'));
    }
    return CacheService.instance;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Gets a value from cache
   * @template T The type of the cached value
   * @param key The cache key
   * @returns A ServiceResult containing the cached value or null if not found
   */
  async get<T>(key: string): Promise<ServiceResult<T | null>> {
    try {
      const value = await this.redis.get(this.getKey(key));
      if (!value) {
        this.stats.misses++;
        return createSuccessResult<T | null>(null);
      }
      this.stats.hits++;
      return createSuccessResult<T | null>(JSON.parse(value));
    } catch (error) {
      return createErrorResult<T | null>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to get from cache',
        code: 'CACHE_GET_ERROR',
        details: error
      });
    }
  }

  /**
   * Sets a value in cache
   * @template T The type of the value to cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in seconds
   * @returns A ServiceResult indicating success or failure
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<ServiceResult<boolean>> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(this.getKey(key), serialized, 'EX', ttl || this.defaultTtl);
      this.stats.keys++;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to set in cache',
        code: 'CACHE_SET_ERROR',
        details: error
      });
    }
  }

  /**
   * Deletes a value from cache
   * @param key The cache key
   * @returns A ServiceResult indicating success or failure
   */
  async delete(key: string): Promise<ServiceResult<boolean>> {
    try {
      await this.redis.del(this.getKey(key));
      this.stats.keys = Math.max(0, this.stats.keys - 1);
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to delete from cache',
        code: 'CACHE_DELETE_ERROR',
        details: error
      });
    }
  }

  /**
   * Clears all values from cache
   * @returns A ServiceResult indicating success or failure
   */
  async clear(): Promise<ServiceResult<boolean>> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.keys = 0;
      }
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to clear cache',
        code: 'CACHE_CLEAR_ERROR',
        details: error
      });
    }
  }

  /**
   * Checks if a key exists in cache
   * @param key The cache key
   * @returns A ServiceResult containing a boolean indicating if the key exists
   */
  async exists(key: RedisKey): Promise<ServiceResult<boolean>> {
    try {
      const fullKey = this.getKey(key.toString());
      const exists = await this.redis.exists(fullKey);
      return createSuccessResult(exists === 1);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to check cache existence',
        code: 'CACHE_EXISTS_ERROR',
        details: error
      });
    }
  }

  /**
   * Invalidates cache entries matching a pattern
   * @param pattern The pattern to match
   * @param options Invalidation options
   * @returns A ServiceResult indicating success or failure
   */
  async invalidate(
    pattern: string,
    options: CacheInvalidationOptions = { strategy: 'immediate' }
  ): Promise<ServiceResult<boolean>> {
    try {
      const client = this.redis;
      const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

      switch (options.strategy) {
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
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to invalidate cache',
        code: 'CACHE_INVALIDATE_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets cache statistics
   * @returns A ServiceResult containing cache statistics
   */
  async getStats(): Promise<ServiceResult<CacheStats>> {
    try {
      const info = await this.redis.info();
      const memoryUsage = this.parseMemoryUsage(info);
      this.stats.memoryUsage = memoryUsage;
      return createSuccessResult({ ...this.stats });
    } catch (error) {
      return createErrorResult<CacheStats>({
        name: 'CacheError',
        message: error instanceof Error ? error.message : 'Failed to get cache stats',
        code: 'CACHE_STATS_ERROR',
        details: error
      });
    }
  }

  private async updateStats(): Promise<void> {
    try {
      const info = await this.redis.info('memory');
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

// Export a singleton instance
export const cacheService = CacheService.getInstance(); 