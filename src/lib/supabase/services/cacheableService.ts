import { cacheService } from '../../redis/cacheService';
import { cacheKeys } from '../../redis/cacheKeys';
import { Database } from '../types/database.types';
import { ServiceError } from '../errors/types';
import { ServiceResult, QueryOptions, BaseServiceConfig } from '@/lib/supabase/types/service';


type EntityType = Exclude<keyof typeof cacheKeys, 'helpers'>;
type EntityId = string;

export interface CacheableServiceConfig {
  entityType: EntityType;
  ttl?: number;
  enableCache?: boolean;
}

export class CacheableService<T extends { id: string }> {
  protected readonly entityType: EntityType;
  protected readonly ttl: number;
  protected readonly enableCache: boolean;

  constructor(config: CacheableServiceConfig) {
    this.entityType = config.entityType;
    this.ttl = config.ttl || 3600; // Default 1 hour
    this.enableCache = config.enableCache ?? true;
  }

  protected async getFromCache(id: EntityId): Promise<T | null> {
    if (!this.enableCache) return null;
    
    const key = cacheKeys[this.entityType].byId(id);
    return cacheService.get<T>(key);
  }

  protected async setInCache(id: EntityId, data: T): Promise<void> {
    if (!this.enableCache) return;
    
    const key = cacheKeys[this.entityType].byId(id);
    await cacheService.set(key, data, this.ttl);
  }

  protected async invalidateCache(id: EntityId): Promise<void> {
    if (!this.enableCache) return;
    
    const key = cacheKeys[this.entityType].byId(id);
    await cacheService.delete(key);
    
    // Invalidate related caches
    const listKey = cacheKeys[this.entityType].list();
    await cacheService.delete(listKey);
  }

  protected async invalidateRelatedCaches(id: EntityId, relations: Array<keyof typeof cacheKeys[EntityType]>): Promise<void> {
    if (!this.enableCache) return;
    
    for (const relation of relations) {
      const key = cacheKeys[this.entityType][relation]?.(id);
      if (key) {
        await cacheService.delete(key);
      }
    }
  }

  protected async getListFromCache(): Promise<T[] | null> {
    if (!this.enableCache) return null;
    
    const key = cacheKeys[this.entityType].list();
    return cacheService.get<T[]>(key);
  }

  protected async setListInCache(data: T[]): Promise<void> {
    if (!this.enableCache) return;
    
    const key = cacheKeys[this.entityType].list();
    await cacheService.set(key, data, this.ttl);
  }

  protected async getQueryFromCache(query: string): Promise<T[] | null> {
    if (!this.enableCache) return null;
    
    const key = cacheKeys[this.entityType].byQuery(query);
    return cacheService.get<T[]>(key);
  }

  protected async setQueryInCache(query: string, data: T[]): Promise<void> {
    if (!this.enableCache) return;
    
    const key = cacheKeys[this.entityType].byQuery(query);
    await cacheService.set(key, data, this.ttl);
  }

  protected async getStatsFromCache(): Promise<Record<string, any> | null> {
    if (!this.enableCache) return null;
    
    const key = cacheKeys[this.entityType].stats();
    return cacheService.get<Record<string, any>>(key);
  }

  protected async setStatsInCache(stats: Record<string, any>): Promise<void> {
    if (!this.enableCache) return;
    
    const key = cacheKeys[this.entityType].stats();
    await cacheService.set(key, stats, this.ttl);
  }
} 