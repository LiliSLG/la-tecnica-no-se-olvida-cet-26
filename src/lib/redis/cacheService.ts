import { Redis } from 'ioredis';
import { ServiceResult } from '@/lib/supabase/types/serviceResult';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { REDIS_KEYS } from './config';
import { redisClient } from './client';
import {
  RedisKey,
  RedisValue,
  CacheOptions,
  CacheEntry,
  CacheStats,
  CacheInvalidationOptions,
} from './types';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

/**
 * Service for managing Redis cache operations
 */
export class CacheService {
  private static instance: CacheService;
  private readonly redis: Redis | null;
  private readonly defaultTtl: number;
  private readonly prefix: string;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
    memoryUsage: 0,
  };

  private constructor(options: CacheOptions = {}) {
    this.redis = isServer ? redisClient.getClient() : null;
    this.defaultTtl = options.ttl || 3600; // Default 1 hour
    this.prefix = options.prefix || 'cache:';
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Gets a value from cache
   * @template T The type of the cached value
   * @param key The cache key
   * @returns A ServiceResult containing the cached value or null
   */
  async get<T>(key: string): Promise<ServiceResult<T | null>> {
    if (!isServer || !this.redis) {
      return createSuccessResult<T | null>(null);
    }

    try {
      const value = await this.redis.get(this.getKey(key));
      if (!value) {
        this.stats.misses++;
        return createSuccessResult<T | null>(null);
      }

      this.stats.hits++;
      return createSuccessResult(JSON.parse(value) as T);
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
    if (!isServer || !this.redis) {
      return createSuccessResult(true);
    }

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
    if (!isServer || !this.redis) {
      return createSuccessResult(true);
    }

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
   * Invalidates cache entries matching a pattern
   * @param pattern The pattern to match
   * @param options Invalidation options
   * @returns A ServiceResult indicating success or failure
   */
  async invalidate(
    pattern: string,
    options: CacheInvalidationOptions = { strategy: 'immediate' }
  ): Promise<ServiceResult<boolean>> {
    if (!isServer || !this.redis) {
      return createSuccessResult(true);
    }

    try {
      const client = this.redis;
      const subscriber = redisClient.getSubscriber();

      if (!subscriber) {
        return createErrorResult<boolean>({
          name: 'CacheError',
          message: 'Redis subscriber not available',
          code: 'CACHE_SUBSCRIBER_ERROR'
        });
      }

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

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private async updateStats(): Promise<void> {
    if (!isServer || !this.redis) return;

    try {
      const info = await this.redis.info('memory');
      const usedMemory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0', 10);
      this.stats.memoryUsage = usedMemory;
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }
}

export const cacheService = CacheService.getInstance(); 