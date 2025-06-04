# Changelog

## [Unreleased]

### Added
- Redis integration for caching
- Cache service implementation
- Cache key management system
- Service integration with caching for:
  - PersonasService
  - ProyectosService
  - NoticiasService

### Changed
- Updated BaseService to support caching
- Improved error handling in services
- Enhanced cache invalidation strategies
- Optimized database indexes for better query performance:
  - Added timestamp indexes for sorting operations
  - Added soft delete indexes for efficient filtering
  - Added junction table indexes for relationship queries
  - Added role-based relationship table indexes
  - Added composite indexes for common query patterns
  - Added partial indexes for active records
  - Optimized full-text search indexes with additional fields
- Optimized query patterns in services:
  - Added efficient existence checks using count queries
  - Implemented pagination and sorting in BaseService
  - Added field selection optimization
  - Consolidated relationship queries
  - Added support for filtering and sorting options
- Optimized PersonasService:
  - Replaced relationship queries with optimized getRelatedEntities
  - Added pagination and sorting support to getAll
  - Improved search with field selection and query options
  - Enhanced error handling and validation

### Fixed
- Cache invalidation issues in relationship updates
- Missing indexes for common query patterns
- Inefficient full-text search indexes
- N+1 query problems in relationship services
- Redundant queries in relationship services
- Updated BaseService to return `ServiceResult<T | null>`

### Optimized Service Methods
- **PersonasService**: Replaced `getAll` with `getAllWithPagination` for pagination and sorting. Updated `search` to use field selection and query options.
- **ProyectosService**: Replaced `getAll` with `getAllWithPagination` for pagination and sorting. Updated `getByStatus`, `getByTema`, `getByPersona`, `getByOrganizacion`, `getTemas`, `getPersonas`, and `getOrganizaciones` to use `getRelatedEntities` for relationship queries and support `QueryOptions`.
- **NoticiasService**: Replaced `getAll` with `getAllWithPagination` for pagination and sorting. Updated `getByTema`, `getByPersona`, `getByOrganizacion`, `getTemas`, `getPersonas`, and `getOrganizaciones` to use `getRelatedEntities` for relationship queries and support `QueryOptions`.