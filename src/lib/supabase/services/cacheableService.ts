import { cacheService } from '../../redis/cacheService';
import { cacheKeys } from '../../redis/cacheKeys';
import { Database } from '../types/database.types';
import { ServiceResult, QueryOptions, BaseServiceConfig } from '@/lib/supabase/types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';

type EntityType = Exclude<keyof typeof cacheKeys, 'helpers'>;
type EntityId = string;

/**
 * Configuration for cacheable services
 */
export interface CacheableServiceConfig {
  /** The type of entity being cached */
  entityType: EntityType;
  /** Time to live for cached items in seconds */
  ttl?: number;
  /** Whether caching is enabled for this service */
  enableCache?: boolean;
}

/**
 * Base class for services that support caching
 * @template T The type of entity being cached
 */
export class CacheableService<T extends { id: string }> {
  protected readonly entityType: EntityType;
  protected readonly ttl: number;
  protected readonly enableCache: boolean;

  constructor(config: CacheableServiceConfig) {
    this.entityType = config.entityType;
    this.ttl = config.ttl || 3600; // Default 1 hour
    this.enableCache = config.enableCache ?? true;
  }

  /**
   * Retrieves an entity from cache by ID
   */
  protected async getFromCache(id: EntityId): Promise<ServiceResult<T | null>> {
    if (!this.enableCache) return createSuccessResult<T | null>(null);
    
    const key = cacheKeys[this.entityType].byId(id);
    return cacheService.get<T>(key);
  }

  /**
   * Stores an entity in cache by ID
   */
  protected async setInCache(id: EntityId, data: T): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    const key = cacheKeys[this.entityType].byId(id);
    return cacheService.set(key, data, this.ttl);
  }

  /**
   * Invalidates cache entries for an entity
   */
  protected async invalidateCache(id: EntityId): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    const key = cacheKeys[this.entityType].byId(id);
    const result = await cacheService.delete(key);
    if (!result.success) return result;
    
    // Invalidate related caches
    const listKey = cacheKeys[this.entityType].list();
    return cacheService.delete(listKey);
  }

  /**
   * Invalidates cache entries for related entities
   */
  protected async invalidateRelatedCaches(id: EntityId, relations: Array<keyof typeof cacheKeys[EntityType]>): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    for (const relation of relations) {
      const key = cacheKeys[this.entityType][relation]?.(id);
      if (key) {
        const result = await cacheService.delete(key);
        if (!result.success) return result;
      }
    }
    return createSuccessResult(true);
  }

  /**
   * Retrieves a list of entities from cache
   */
  protected async getListFromCache(): Promise<ServiceResult<T[] | null>> {
    if (!this.enableCache) return createSuccessResult<T[] | null>(null);
    
    const key = cacheKeys[this.entityType].list();
    return cacheService.get<T[]>(key);
  }

  /**
   * Stores a list of entities in cache
   */
  protected async setListInCache(data: T[]): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    const key = cacheKeys[this.entityType].list();
    return cacheService.set(key, data, this.ttl);
  }

  /**
   * Retrieves search results from cache
   */
  protected async getQueryFromCache(query: string): Promise<ServiceResult<T[] | null>> {
    if (!this.enableCache) return createSuccessResult<T[] | null>(null);
    
    const key = cacheKeys[this.entityType].byQuery(query);
    return cacheService.get<T[]>(key);
  }

  /**
   * Stores search results in cache
   */
  protected async setQueryInCache(query: string, data: T[]): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    const key = cacheKeys[this.entityType].byQuery(query);
    return cacheService.set(key, data, this.ttl);
  }

  /**
   * Retrieves statistics from cache
   */
  protected async getStatsFromCache(): Promise<ServiceResult<Record<string, any> | null>> {
    if (!this.enableCache) return createSuccessResult<Record<string, any> | null>(null);
    
    const key = cacheKeys[this.entityType].stats();
    return cacheService.get<Record<string, any>>(key);
  }

  /**
   * Stores statistics in cache
   */
  protected async setStatsInCache(stats: Record<string, any>): Promise<ServiceResult<boolean>> {
    if (!this.enableCache) return createSuccessResult(true);
    
    const key = cacheKeys[this.entityType].stats();
    return cacheService.set(key, stats, this.ttl);
  }
} 