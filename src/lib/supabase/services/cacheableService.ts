import { ServiceResult } from '@/lib/supabase/types/service';
import { createSuccessResult } from '@/lib/supabase/types/serviceResult';
import { BaseService } from './baseService';
import { cacheService } from '@/lib/redis/cacheService';
import { cacheKeys } from '@/lib/redis/cacheKeys';
import { ValidationError } from '../errors/types';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

export interface CacheableServiceConfig {
  entityType: keyof typeof cacheKeys;
  ttl: number;
  enableCache: boolean;
}

export abstract class CacheableService<T extends { id: string }> extends BaseService<T> {
  private readonly ttl: number;
  private readonly enableCache: boolean;
  private readonly entityType: keyof typeof cacheKeys;

  constructor(supabase: any, config: CacheableServiceConfig) {
    super(supabase, { tableName: config.entityType as any });
    this.entityType = config.entityType;
    this.ttl = config.ttl;
    this.enableCache = config.enableCache;
  }

  protected async getFromCache(id: string): Promise<ServiceResult<T | null>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult<T | null>(null);
    }
    const key = `${this.entityType}:${id}`;
    return cacheService.get<T>(key);
  }

  protected async setInCache(id: string, data: T): Promise<ServiceResult<boolean>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult(true);
    }
    const key = `${this.entityType}:${id}`;
    return cacheService.set(key, data, this.ttl);
  }

  protected async invalidateCache(id: string): Promise<ServiceResult<boolean>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult(true);
    }
    const key = `${this.entityType}:${id}`;
    return cacheService.delete(key);
  }

  protected async getListFromCache(): Promise<ServiceResult<T[] | null>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult<T[] | null>(null);
    }
    const key = `${this.entityType}:list`;
    return cacheService.get<T[]>(key);
  }

  protected async setListInCache(data: T[]): Promise<ServiceResult<boolean>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult(true);
    }
    const key = `${this.entityType}:list`;
    return cacheService.set(key, data, this.ttl);
  }

  protected async getQueryFromCache(query: string): Promise<ServiceResult<T[] | null>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult<T[] | null>(null);
    }
    const key = `${this.entityType}:query:${query}`;
    return cacheService.get<T[]>(key);
  }

  protected async setQueryInCache(query: string, data: T[]): Promise<ServiceResult<boolean>> {
    if (!isServer || !this.enableCache) {
      return createSuccessResult(true);
    }
    const key = `${this.entityType}:query:${query}`;
    return cacheService.set(key, data, this.ttl);
  }

  // Override BaseService methods to add caching
  public async getById(id: string): Promise<ServiceResult<T | null>> {
    // Try to get from cache first
    const cachedResult = await this.getFromCache(id);
    if (cachedResult.success && cachedResult.data) {
      return createSuccessResult(cachedResult.data);
    }

    // If not in cache, get from database
    const result = await super.getById(id);
    if (result.success && result.data) {
      // Cache the result
      await this.setInCache(id, result.data);
    }
    return result;
  }

  public async getAll(options?: any): Promise<ServiceResult<T[] | null>> {
    // Try to get from cache first if not bypassing cache
    if (!options?.bypassCache) {
      const cachedResult = await this.getListFromCache();
      if (cachedResult.success && cachedResult.data) {
        return createSuccessResult(cachedResult.data);
      }
    }

    // If not in cache, get from database
    const result = await super.getAll(options);
    if (result.success && result.data && !options?.bypassCache) {
      // Cache the results
      await this.setListInCache(result.data);
    }
    return result;
  }

  public async create(data: Omit<T, 'id'>): Promise<ServiceResult<T | null>> {
    const result = await super.create(data);
    if (result.success && result.data) {
      // Cache the new entity
      await this.setInCache(result.data.id, result.data);
      // Invalidate list cache
      await this.invalidateCache(result.data.id);
    }
    return result;
  }

  public async update(id: string, data: Partial<T>): Promise<ServiceResult<T | null>> {
    const result = await super.update(id, data);
    if (result.success && result.data) {
      // Update cache
      await this.setInCache(id, result.data);
      // Invalidate related caches
      await this.invalidateCache(id);
    }
    return result;
  }

  // Implement abstract methods from BaseService
  protected validateCreateInput(data: Partial<T>): ValidationError | null {
    return null; // Override in derived classes
  }

  protected validateUpdateInput(data: Partial<T>): ValidationError | null {
    return null; // Override in derived classes
  }
} 