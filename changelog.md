## [Unreleased]
### Fixed
- Updated BaseService to return `ServiceResult<T | null>` and `ServiceResult<T[] | null>` for create, update, getById, and getAll methods, to properly handle null results and error cases in both entity and relationship services.
- Updated all service usages to expect nullable data in these results.
- Added `exists` method to BaseService to properly check entity existence.
- Removed unused `ErrorCode` import from services.
- Fixed type signatures across all services to properly handle null cases.

### Added
- Created NoticiaPersonaRolService to handle noticia-persona relationships with roles
- Added CRUD operations for managing noticia-persona relationships
- Implemented proper validation and error handling for relationship operations
- Added type-safe role validation with ValidRole type
- Created NoticiaOrganizacionRolService to handle noticia-organizacion relationships with roles
- Added CRUD operations for managing noticia-organizacion relationships
- Added new migration (002) to create noticia_organizacion_rol table with proper indexes and RLS policies

### Improved
- Enhanced type safety in NoticiaPersonaRolService by properly typing database query results
- Added explicit type definitions for Persona and Noticia entities
- Fixed return type signatures to match database query results exactly
- Enhanced type safety in NoticiaOrganizacionRolService by properly typing database query results
- Added explicit type definitions for Organizacion entity
- Added proper RLS policies for noticia_organizacion_rol table 