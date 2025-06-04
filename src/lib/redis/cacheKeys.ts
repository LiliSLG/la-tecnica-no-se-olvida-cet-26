import { REDIS_KEYS } from './config';

// Base key types
type EntityKey = string;
type EntityId = string;
type QueryKey = string;

// Entity types for type safety
type EntityType = 
  | 'persona'
  | 'noticia'
  | 'organizacion'
  | 'proyecto'
  | 'entrevista'
  | 'tema';

// Cache key patterns
const PATTERNS = {
  ENTITY: (type: EntityType, id: EntityId) => `${type}:${id}`,
  ENTITY_LIST: (type: EntityType) => `${type}:list`,
  ENTITY_QUERY: (type: EntityType, query: QueryKey) => `${type}:query:${query}`,
  ENTITY_RELATIONSHIP: (type: EntityType, id: EntityId, relation: string) => 
    `${type}:${id}:${relation}`,
  ENTITY_STATS: (type: EntityType) => `${type}:stats`,
} as const;

// Cache key generators
export const cacheKeys = {
  // Persona keys
  persona: {
    byId: (id: EntityId) => PATTERNS.ENTITY('persona', id),
    list: () => PATTERNS.ENTITY_LIST('persona'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('persona', query),
    temas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('persona', id, 'temas'),
    proyectos: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('persona', id, 'proyectos'),
    stats: () => PATTERNS.ENTITY_STATS('persona'),
  },

  // Noticia keys
  noticia: {
    byId: (id: EntityId) => PATTERNS.ENTITY('noticia', id),
    list: () => PATTERNS.ENTITY_LIST('noticia'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('noticia', query),
    temas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('noticia', id, 'temas'),
    personas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('noticia', id, 'personas'),
    organizaciones: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('noticia', id, 'organizaciones'),
    stats: () => PATTERNS.ENTITY_STATS('noticia'),
  },

  // Organizacion keys
  organizacion: {
    byId: (id: EntityId) => PATTERNS.ENTITY('organizacion', id),
    list: () => PATTERNS.ENTITY_LIST('organizacion'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('organizacion', query),
    proyectos: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('organizacion', id, 'proyectos'),
    noticias: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('organizacion', id, 'noticias'),
    stats: () => PATTERNS.ENTITY_STATS('organizacion'),
  },

  // Proyecto keys
  proyecto: {
    byId: (id: EntityId) => PATTERNS.ENTITY('proyecto', id),
    list: () => PATTERNS.ENTITY_LIST('proyecto'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('proyecto', query),
    temas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('proyecto', id, 'temas'),
    personas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('proyecto', id, 'personas'),
    organizaciones: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('proyecto', id, 'organizaciones'),
    stats: () => PATTERNS.ENTITY_STATS('proyecto'),
  },

  // Entrevista keys
  entrevista: {
    byId: (id: EntityId) => PATTERNS.ENTITY('entrevista', id),
    list: () => PATTERNS.ENTITY_LIST('entrevista'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('entrevista', query),
    temas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('entrevista', id, 'temas'),
    stats: () => PATTERNS.ENTITY_STATS('entrevista'),
  },

  // Tema keys
  tema: {
    byId: (id: EntityId) => PATTERNS.ENTITY('tema', id),
    list: () => PATTERNS.ENTITY_LIST('tema'),
    byQuery: (query: QueryKey) => PATTERNS.ENTITY_QUERY('tema', query),
    personas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('tema', id, 'personas'),
    proyectos: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('tema', id, 'proyectos'),
    noticias: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('tema', id, 'noticias'),
    entrevistas: (id: EntityId) => PATTERNS.ENTITY_RELATIONSHIP('tema', id, 'entrevistas'),
    stats: () => PATTERNS.ENTITY_STATS('tema'),
  },

  // Helper methods
  helpers: {
    // Generate a key with prefix
    withPrefix: (key: string) => `${REDIS_KEYS.PREFIX}${key}`,
    
    // Generate a key with TTL
    withTTL: (key: string, ttl: number) => `${key}:ttl:${ttl}`,
    
    // Generate a key for pagination
    withPagination: (key: string, page: number, limit: number) => 
      `${key}:page:${page}:limit:${limit}`,
    
    // Generate a key for sorting
    withSort: (key: string, field: string, order: 'asc' | 'desc') => 
      `${key}:sort:${field}:${order}`,
    
    // Generate a key for filtering
    withFilter: (key: string, filter: Record<string, string>) => {
      const filterString = Object.entries(filter)
        .map(([k, v]) => `${k}:${v}`)
        .join(':');
      return `${key}:filter:${filterString}`;
    },
  },
} as const;

// Type exports
export type CacheKeyPattern = typeof PATTERNS;
export type CacheKeys = typeof cacheKeys; 