# Changelog

## [2025-06-13] Finalización del Módulo de Gestión de Temas
- **CRUD Completo:** Implementada la funcionalidad de Crear, Leer, Actualizar y Borrar (CRUD) para la gestión de Temas en el panel de administración.
- **Arquitectura Frontend:** Establecido el patrón de `Server Component` para la carga inicial de datos y `Client Component` para la interactividad, utilizando el hook `useDataTableState` y el componente `AdminDataTable`.
- **UI/UX Profesional:** Mejorada la interfaz con iconos, tooltips, diálogos de confirmación y notificaciones, creando un estándar para futuras páginas de administración.
- **Página Pública de Detalles:** Creada la página pública en `/temas/[id]` para mostrar los detalles de un tema y sus entidades relacionadas (personas y proyectos).
- **Corrección de Bugs y Tipos:** Resueltos todos los bugs de estado del cliente y errores de TypeScript, resultando en una funcionalidad robusta y type-safe de principio a fin.
- **El módulo de Temas se considera completo y es el prototipo para el resto de los módulos de gestión.**
## [2025-06-12] Finalización del CRUD de Temas y Mejoras de UI/UX
- **CRUD Completo:** Implementada la funcionalidad de Crear, Editar y Borrar para la gestión de Temas en el panel de administración.
- **Formulario Reutilizable:** Creado el componente `TemaForm` con validación (Zod) y manejo de estado (`react-hook-form`), integrado en un modal de `shadcn/ui`.
- **Corrección de Bug de Estado:** Solucionado un bug en la lógica de borrado que eliminaba ítems del estado del cliente incorrectamente. Ahora se actualiza el flag `esta_eliminada` para mantener la consistencia con el filtro "Mostrar eliminados".
- **Mejoras de UI/UX:**
  - Reemplazados los botones de texto de las acciones por botones de iconos (`lucide-react`) con tooltips para mejorar la claridad y accesibilidad.
  - Añadido un botón para limpiar el campo de búsqueda en el `AdminDataTable`.
- La página de gestión de temas se considera el prototipo final para todas las futuras páginas de administración de datos.
## [2025-06-11] Implementación del CRUD en Admin Panel
- **Página de Gestión de Temas (`/admin/temas`):** Creada la primera página de administración funcional.
  - Utiliza un patrón de Server Component para la carga inicial de datos y un Client Component para la interactividad.
  - Integrado con el hook `useDataTableState` para manejar la lógica de búsqueda, filtrado y paginación en el cliente.
  - Implementado el componente reutilizable `AdminDataTable` para mostrar los datos.
- **Funcionalidad de Borrado (Soft Delete):**
  - Añadida la funcionalidad de borrado lógico para los temas.
  - Implementado un diálogo de confirmación (`AlertDialog`) para prevenir borrados accidentales.
  - Se utilizan notificaciones (`sonner`) para dar feedback al usuario sobre el resultado de la operación.
  - La UI se actualiza instantáneamente tras un borrado exitoso.
## [2025-06-10] Finalización de la Refactorización de la Capa de Servicios
- Se ha completado una refactorización exhaustiva de toda la capa de servicios, adoptando un patrón de clases/objetos explícitos e independientes.
- **Eliminación de Abstracciones:** Se han eliminado por completo las clases base (`BaseService`, `CacheableService`, `RelationshipService`) que causaban complejidad y errores de tipo.
- **Servicios de Entidad (`temasService`, `personasService`):** Ahora son clases independientes con métodos CRUD explícitos, siguiendo un patrón consistente.
- **Servicios de Relación (`personaTemaService`):** Se ha adoptado un patrón de objetos simples para manejar las tablas de unión.
- **`authService`:** Se ha limpiado para delegar toda la lógica de perfiles a `personasService`, eliminando la duplicación de código.
- **Limpieza de Tipos:** Se han eliminado los archivos de tipos obsoletos y se han consolidado las definiciones compartidas en `serviceResult.ts`.
- **La capa de servicios se considera ahora estable, completa y lista para el desarrollo del frontend.**
## [2025-06-08] Diseño de Relaciones entre Proyectos
- Diseñada e implementada en el esquema de la base de datos la funcionalidad para relacionar proyectos entre sí.
- Creada la tabla `proyecto_relaciones` para modelar relaciones N:M direccionales.
- Añadido el enum `tipo_relacion_proyecto_enum` para estandarizar los tipos de relación ('referencia', 'mejora', etc.).
- Incluido un campo `descripcion` para añadir contexto a cada relación.
- Actualizada la documentación (`schemas.md`, `blueprint.md`, `future-developments.md`) para reflejar este nuevo diseño.
###- Estandarizado el nombre de la entidad `entrevistas` a `historias_orales` en toda la base de datos y documentación para mayor claridad conceptual.

## [2025-06-07] Basic Authentication Implementation
- Updated `supabaseClient.ts` to use `createBrowserClient` from `@supabase/ssr` to ensure compatibility with Next.js 15 App Router and Client Components. This change prevents the known `@supabase/node-fetch` error when using `supabaseClient` in `AuthProvider.tsx` and other client components. No changes were needed in `authService.ts` or `supabaseStorage.ts`.

- Implemented core authentication system using Supabase Auth:
  - Created `AuthProvider.tsx` component for managing auth state and session
  - Added `/login` page with email/password form
  - Implemented session persistence in localStorage
  - Added protected routes for `/admin/*` paths
- Added authentication middleware:
  - Redirects unauthenticated users to login
  - Redirects authenticated users away from login page
  - Protects admin routes
- Integrated authentication flow with existing `authService.ts` and `supabaseClient.ts`:
  - Session management
  - User state tracking
  - Automatic token refresh

### Refactored
- Standardized all service classes to correctly extend `BaseService` with proper generic parameters and constructor calls.
- Fixed inheritance and super() calls in:
  - `proyectoOrganizacionRolService.ts`
  - `proyectoPersonaRolService.ts`
  - `entrevistaOrganizacionRolService.ts`
  - `entrevistaPersonaRolService.ts`
  
## [2025-06-01] Migración Firestore → Supabase (Fase 1 y Fase 2)

- Migración completa de servicios:
    - Personas → `personasService.ts`
    - Proyectos → `proyectosService.ts`
    - Entrevistas → `historiasOralesService.ts`
    - Noticias → `noticiasService.ts`
    - Organizaciones → `organizacionesService.ts`
    - Temas → `temasService.ts`
- Creación de tablas relacionales en Supabase:
    - `persona_tema`
    - `proyecto_tema`
    - `entrevista_tema`
    - `noticia_tema`
    - `proyecto_persona_rol`
    - `proyecto_organizacion_rol`
- Ajuste en `src/lib/supabase/supabaseClient.ts`
- Estándar de timestamps → `new Date().toISOString()`
- Eliminación de `serverTimestamp` y conversión de Firestore `Timestamp` a `string`
- Uso de `logical delete` unificado en todos los servicios (`estaEliminada`, `eliminadoPorUid`, `eliminadoEn`)
- Eliminación de hacks Firestore (chunking de 30 IDs, `documentId`, `array-contains`, etc.)


## 31/05/2025
- Started centralizing project context for AI (Firebase Studio) interaction.
- Defined `docs/schemas.md` with current TypeScript interfaces.
- Outlined `docs/future-developments.md`.
- Established `rules.md` for guiding AI development.
- **Previous major changes to note for AI:**
    - Implemented CRUD for `participantes` (Personas) in Admin Panel, including profile picture upload (to Firebase Storage on form save) and refined role management (`categoriaPrincipal`, `capacidadesPlataforma` (with `es_admin_sistema` synced to `esAdmin` boolean)). Placeholder creation from Project form now uses a modal (`AddPersonaModal.tsx`) and assigns `categoriaPrincipal`.
    - Implemented CRUD for `organizaciones` in Admin Panel, including logo upload (to Firebase Storage on form save).
    - Implemented CRUD for `noticias` in Admin Panel, supporting both original articles and links to external news, including image upload for original articles.
    - Implemented initial structure for `entrevistas` (oral history) CRUD in Admin Panel and public view, supporting video links/embeds.
    - Refined "Red de Tutores y Acompañantes" and started "Red de Egresados CET 26" public pages to use updated `Persona` fields and card-based design.
    - Implemented "smart redirection" and conditional "Update" button (based on `isDirty`) in forms.
    - Addressed various Firestore and Storage permission issues.
    - Standardized on logical deletes (`estaEliminado`, `estaEliminada`) with restore options in admin panels.


## Firebase Migration Audit (Phase 1)

### Dependencies Identified
- Direct dependencies:
  - `@tanstack-query-firebase/react` (v1.0.5)
- Firebase Storage configuration in `next.config.ts`
- Firebase service files referenced but not found:
  - `src/lib/firebase/config.ts`
  - `src/lib/firebase/personasService.ts`

### Configuration Files
- Environment files:
  - `.env*` files (ignored in git)
  - May contain Firebase configuration
- Firebase debug logs (ignored in git):
  - `firebase-debug.log`
  - `firestore-debug.log`
- Next.js configuration:
  - `next.config.ts` contains Firebase Storage configuration

### Environment Variables
- No Firebase-related environment variables found in:
  - `.env` files
  - Code references
- Note: Firebase configuration might be hardcoded in `src/lib/firebase/config.ts`

### Next Steps
1. Remove `@tanstack-query-firebase/react` dependency
2. Update Firebase Storage URLs to use Supabase Storage
3. Migrate remaining Firebase service files to Supabase
4. Review and update environment variables
5. Remove Firebase debug log configurations
6. Check for hardcoded Firebase configuration

## Migration Progress Tracking

### Phase 1: Initial Cleanup and Preparation
- [x] Dependency Audit
  - [x] Identified Firebase dependencies
  - [x] Listed configuration files
  - [x] Documented environment variables
- [x] Documentation Setup
  - [x] Create migration tracking section
  - [x] Document Firebase usage patterns
  - [x] Set up progress tracking
  - [x] Create rollback plan

### Phase 2: Core Service Migration
- [ ] Authentication Migration
- [ ] Storage Migration
- [ ] Database Services Migration

### Phase 3: Code Stabilization
- [ ] Error Handling Implementation
- [ ] Type Safety Enhancement
- [ ] Transaction Support

### Phase 4: Testing and Validation
- [ ] Test Implementation
- [ ] Data Validation

### Phase 5: Optimization and Cleanup
- [ ] Performance Optimization
- [ ] Code Cleanup

### Phase 6: Finalization
- [ ] Environment Updates
- [ ] Final Verification
- [ ] Documentation Finalization

## Firebase Usage Patterns

### Storage Usage
- Firebase Storage is used for:
  - Profile pictures (`fotoURL` in `Persona`)
  - Organization logos (`logoURL` in `Organizacion`)
  - Project files (`archivoPrincipalURL` in `Proyecto`)
  - CET 26 logo (hardcoded URL in `Cet26Content.tsx`)

### Service Usage
- Firebase services are used in:
  - `personasService.ts`:
    - CRUD operations for personas
    - Profile picture upload
    - Logical delete/restore
  - `projectsService.ts`:
    - CRUD operations for projects
    - File upload
    - Logical delete/restore
  - `config.ts`:
    - Firebase initialization
    - Storage configuration

### Components Using Firebase
- `PersonaForm.tsx`: Profile picture upload
- `AddPersonaModal.tsx`: Profile picture upload
- `AdminParticipanteList.tsx`: Persona management
- `AdminProjectList.tsx`: Project management
- `Cet26Content.tsx`: Logo display

### Migration Priorities
1. Storage migration (most critical)
2. Service migration (core functionality)
3. Component updates (UI integration)
4. Configuration cleanup (final step)

## Rollback Plan

### Phase 1 Rollback
- Keep Firebase dependencies in `package.json` until Phase 2 is complete
- Maintain Firebase configuration files until Phase 3
- Keep Firebase Storage URLs until Supabase Storage is fully tested

### Phase 2 Rollback
- Maintain Firebase Auth until Supabase Auth is fully tested
- Keep Firebase Storage until all files are migrated and verified
- Preserve Firebase service files until Supabase services are stable

### Phase 3 Rollback
- Keep Firebase types until Supabase types are fully implemented
- Maintain Firebase error handling until Supabase error handling is tested
- Preserve Firebase transaction patterns until Supabase transactions are verified

### Phase 4 Rollback
- Keep test data in both Firebase and Supabase
- Maintain test coverage for both implementations
- Preserve validation scripts for both systems

### Phase 5 Rollback
- Keep performance benchmarks for both systems
- Maintain optimization documentation for both
- Preserve cleanup scripts for both systems

### Phase 6 Rollback
- Keep environment configurations for both systems
- Maintain deployment scripts for both
- Preserve documentation for both implementations

### Rollback Triggers
1. Critical functionality failure
2. Data integrity issues
3. Performance degradation
4. Security concerns
5. User experience problems

### Rollback Process
1. Stop new deployments
2. Revert to last stable Firebase version
3. Restore Firebase configuration
4. Verify all functionality
5. Document rollback reason and process

## Storage Migration Progress

### 2024-03-XX - Storage Configuration Updates
- Enhanced Supabase Storage configuration in `next.config.ts`:
  - Added Supabase Storage domain to `remotePatterns`
  - Removed Firebase Storage domain
  - Configured proper image optimization settings
- Improved `supabaseStorage.ts`:
  - Added structured storage configuration with bucket settings
  - Implemented file type validation
  - Added file size limits (5MB max)
  - Enhanced error handling and logging
  - Added type safety for folder names and file types
  - Organized storage into logical folders (profile pictures, organization logos, project files, interviews)

### 2024-03-XX - Storage Migration Utility Implementation
- Created `storageMigration.ts` utility with the following features:
  - Single and batch file migration functions
  - Progress tracking and reporting
  - File type validation and error handling
  - Path mapping between Firebase and Supabase
  - Migration verification
  - Rollback support for failed migrations
- Implemented folder structure mapping:
  - Profile pictures → profile-pictures
  - Organization logos → organization-logos
  - Project files → project-files
  - Interviews → interviews
- Added comprehensive error handling and logging
- Included TypeScript types for better type safety

### 2024-03-XX - Storage Migration Test Implementation
- Created comprehensive test suite for storage migration utility:
  - Unit tests for all migration functions
  - Mock implementations for Firebase and Supabase
  - Test cases for success and failure scenarios
  - Progress tracking validation
  - Verification and rollback testing
- Added Jest testing infrastructure:
  - Installed Jest and related dependencies
  - Configured test environment
  - Set up mock implementations

## Authentication Migration Progress

### 2024-03-XX - Auth Service Implementation
- Created `src/lib/supabase/authService.ts` with core authentication functions
- Implemented sign in, sign up, and sign out functionality
- Added OAuth integration (Google)
- Implemented user profile management
- Added password management features
- Implemented session handling
- Added error handling and user feedback
- Installed required dependency: `@supabase/auth-helpers-nextjs`

### 2024-03-XX - User Data Migration Implementation
- Created migration scripts for user data:
  - `src/lib/supabase/scripts/migrateUsers.ts`: Handles user data migration
  - `src/lib/supabase/scripts/extractFirebaseUsers.ts`: Extracts user data from Firebase
- Implemented data mapping and transformation
- Added progress tracking and verification
- Enhanced error handling and logging
- Installed required dependency: `firebase-admin`

### 2024-03-XX - UI Updates Implementation
- Updated authentication components:
  - Modified `LoginForm.tsx` to use Supabase auth
  - Updated `SignUpForm.tsx` with Supabase integration
  - Enhanced `ForgotPasswordForm.tsx` for password reset
  - Created new `ProfileForm.tsx` for user profile management
- Added loading states and error handling:
  - Implemented loading indicators for auth operations
  - Added toast notifications for success/error feedback
  - Enhanced form validation with Zod schemas
- Implemented profile management features:
  - Added avatar upload functionality
  - Created password change form
  - Enhanced user metadata management
- Improved UI/UX:
  - Added responsive layouts
  - Implemented consistent styling
  - Enhanced accessibility
  - Added loading and error states
  - Improved form validation feedback

### Database Services Migration (2.3)

#### Core Database Setup (2.3.1) - Completed
- Created initial database schema with tables for:
  - `personas`: User profiles with admin capabilities
  - `organizaciones`: Organization information
  - `temas`: Topic categorization
  - `proyectos`: Project management
  - `entrevistas`: Interview scheduling and content
  - `noticias`: News articles and external links
- Implemented junction tables for many-to-many relationships:
  - `persona_tema`, `proyecto_tema`, `entrevista_tema`, `noticia_tema`
  - `proyecto_persona_rol`, `proyecto_organizacion_rol`
- Set up Row Level Security (RLS) policies for all tables:
  - View policies for public access
  - Insert/Update/Delete policies for authenticated users and admins
  - Soft delete functionality with audit fields
- Created database indexes for performance optimization:
  - Single-column indexes for frequently queried fields
  - Composite indexes for common query patterns
  - Full-text search indexes using GIN for Spanish text search
- Added automatic timestamp management:
  - `created_at` and `updated_at` fields
  - Trigger function for automatic `updated_at` updates

#### Service Layer Implementation (2.3.2) - In Progress

##### Base Service Setup - Completed
- Created base service infrastructure:
  - `src/lib/supabase/types/service.ts`: Common service types and interfaces
  - `src/lib/supabase/types/database.types.ts`: Supabase database schema types
  - `src/lib/supabase/services/baseService.ts`: Abstract base service class
- Implemented core functionality in base service:
  - CRUD operations with type safety
  - Error handling and result wrapping
  - Query building with filters and pagination
  - Soft delete management
  - Full-text search support
  - Automatic timestamp handling
- Added comprehensive type definitions:
  - Service result types
  - Query options
  - Entity interfaces
  - Database schema types
- Implemented error handling:
  - Custom error types
  - Error wrapping
  - Result type safety
- Added utility functions:
  - Query building
  - Result creation
  - Error handling
  - Type guards

##### Entity Services Implementation - In Progress
- Created `PersonasService`:
  - Email-based lookup
  - Admin filtering
  - Category and capacity filtering
  - Topic management
  - Enhanced search with biography
- Created `OrganizacionesService`:
  - Topic management
  - Enhanced search with description
  - Organization-topic relationships
- Created `TemasService`:
  - Related entities lookup (personas, organizaciones, proyectos, entrevistas, noticias)
  - Enhanced search with description
  - Topic relationship management
- Created `ProyectosService`:
  - Status-based filtering
  - Topic management
  - Person and organization role management
  - Enhanced search with description
  - Project relationship management
- Created `EntrevistasService`:
  - Status-based filtering
  - Date-based filtering
  - Topic management
  - Enhanced search with description
- Created `NoticiasService`:
  - Type-based filtering (article/link)
  - Topic management
  - Enhanced search with content

##### Relationship Services Implementation - In Progress
- Created base `RelationshipService` class:
  - Generic relationship management
  - Type-safe relationship operations
  - Error handling and result wrapping
  - Common relationship operations:
    - Add/remove relationships
    - Get relationship lists
    - Check relationship existence
    - Count relationships
- Created `PersonaTemaService`:
  - Persona-tema relationship management
  - Get temas with full details
  - Get personas by tema
  - Add/remove tema from persona
  - Check tema existence
  - Count persona temas
- Created `OrganizacionTemaService`:
  - Organizacion-tema relationship management
  - Get temas with full details
  - Get organizaciones by tema
  - Add/remove tema from organizacion
  - Check tema existence
  - Count organizacion temas
- Created `ProyectoTemaService`:
  - Proyecto-tema relationship management
  - Get temas with full details
  - Get proyectos by tema
  - Add/remove tema from proyecto
  - Check tema existence
  - Count proyecto temas
- Created `EntrevistaTemaService`:
  - Entrevista-tema relationship management
  - Get temas with full details
  - Get entrevistas by tema
  - Add/remove tema from entrevista
  - Check tema existence
  - Count entrevista temas
- Created `NoticiaTemaService`:
  - Noticia-tema relationship management
  - Get temas with full details
  - Get noticias by tema
  - Add/remove tema from noticia
  - Check tema existence
  - Count noticia temas
- Created `ProyectoPersonaRolService`:
  - Proyecto-persona relationship management
  - Get roles with full details
  - Get personas by proyecto
  - Add/remove role from persona
  - Check role existence
  - Count persona roles
- Created `ProyectoOrganizacionRolService`:
  - Proyecto-organizacion relationship management
  - Get roles with full details
  - Get organizaciones by proyecto
  - Add/remove role from organizacion
  - Check role existence
  - Count organizacion roles
- Created `EntrevistaPersonaRolService`:
  - Entrevista-persona relationship management
  - Get personas with roles for an entrevista
  - Get entrevistas by persona with roles
  - Add/remove persona from entrevista with role
  - Update persona role in entrevista
  - Check persona existence
  - Count personas in entrevista
- Created `EntrevistaOrganizacionRolService`:
  - Entrevista-organizacion relationship management
  - Get organizaciones with roles for an entrevista
  - Get entrevistas by organizacion with roles
  - Add/remove organizacion from entrevista with role
  - Update organizacion role in entrevista
  - Check organizacion existence
  - Count organizaciones in entrevista

## [Unreleased]

### Added
- Initial project setup with Next.js 14, TypeScript, and Tailwind CSS
- Basic project structure and configuration
- Documentation setup with README and changelog
- Database schema design and implementation
- Supabase client configuration and types
- Base service implementation for common database operations
- Entity Services Implementation:
  - PersonasService with CRUD operations and search functionality
  - OrganizacionesService with CRUD operations and search functionality
  - TemasService with CRUD operations and search functionality
  - ProyectosService with status-based filtering, tema management, and persona/organizacion relationships
  - EntrevistasService with status-based filtering, fecha-based filtering, and tema management
  - NoticiasService with type-based filtering, tema management, and enhanced search
- Relationship Services Implementation:
  - Base RelationshipService for common relationship operations
  - PersonaTemaService for managing persona-tema relationships
  - OrganizacionTemaService for managing organizacion-tema relationships
  - ProyectoTemaService for managing proyecto-tema relationships
  - EntrevistaTemaService for managing entrevista-tema relationships
  - NoticiaTemaService for managing noticia-tema relationships
  - ProyectoPersonaRolService for managing proyecto-persona relationships with roles
  - ProyectoOrganizacionRolService for managing proyecto-organizacion relationships with roles
  - EntrevistaPersonaRolService for managing entrevista-persona relationships with roles
  - EntrevistaOrganizacionRolService for managing entrevista-organizacion relationships with roles
- Data Migration Scripts Implementation:
  - Base migration structure with:
    - Progress tracking
    - Batch processing
    - Error handling
    - Dry run support
    - Logging functionality
  - Firebase data extraction utilities:
    - Collection data extraction with query support
    - Document data extraction
    - Relationship data extraction
    - Retry mechanism with configurable attempts
    - Progress tracking and error logging
    - Batch processing for large datasets
  - Data transformation utilities:
    - Field mapping and renaming
    - Type conversion and validation
    - Timestamp handling (Firestore to ISO)
    - Relationship transformation
    - Required field validation
    - Default value application
    - Progress tracking and error logging
  - Entity-specific transformation configurations:
    - Persona transformation with:
      - Basic field mappings (nombre, apellido, email, etc.)
      - Admin field mappings (esAdmin, esAdminSistema)
      - Category field mappings (categoriaPrincipal, capacidadesPlataforma)
      - Timestamp handling
      - Relationship field handling
      - Required field validation
      - Default values for optional fields
    - Organizacion transformation with:
      - Basic field mappings (nombre, descripcion, tipo)
      - Contact field mappings (email, telefono, direccion, etc.)
      - Media field mappings (logoURL, sitioWeb, redesSociales)
      - Timestamp handling
      - Relationship field handling
      - Required field validation
      - Default values for optional fields
    - Tema transformation with:
      - Basic field mappings (nombre, descripcion, slug)
      - Category field mappings (categoria, subcategoria, tags)
      - Timestamp handling
      - Relationship field handling (personas, organizaciones, proyectos, etc.)
      - Required field validation
      - Default values for optional fields
    - Proyecto transformation with:
      - Basic field mappings (nombre, descripcion, objetivos, resultados)
      - Status field mappings (estado, fechaInicio, fechaFin, fechaPublicacion)
      - Media field mappings (imagenURL, archivoPrincipalURL, archivosAdicionales)
      - Timestamp handling
      - Relationship field handling (temas, personas, organizaciones)
      - Required field validation
      - Default values for optional fields
    - Entrevista transformation with:
      - Basic field mappings (titulo, descripcion, resumen, notas)
      - Status field mappings (estado, fechaEntrevista, fechaPublicacion, duracion)
      - Media field mappings (videoURL, transcripcionURL, imagenURL, archivosAdicionales)
      - Timestamp handling
      - Relationship field handling (temas, personas, organizaciones)
      - Required field validation
      - Default values for optional fields
    - Noticia transformation with:
      - Basic field mappings (titulo, descripcion, contenido, resumen)
      - Type field mappings (tipo, fuente, autor, fechaPublicacion, fechaNoticia)
      - Media field mappings (imagenURL, archivoURL, archivosAdicionales)
      - Timestamp handling
      - Relationship field handling (temas)
      - Required field validation
      - Default values for optional fields
  - Main data migration script with:
    - Orchestration of the entire migration process
    - Sequential entity migration (personas, organizaciones, temas, proyectos, entrevistas, noticias)
    - Relationship migration for all entity pairs
    - Progress tracking and reporting
    - Error handling and logging
    - Dry run support for testing
    - Configurable batch size and retry settings
    - Rollback support for failed migrations
- Error handling system with:
  - Base error types and interfaces
  - Error code enumeration
  - Error formatting utilities
  - Error logging utilities
  - Error mapping utilities
- Comprehensive error handling documentation
- Enhanced error handling in:
  - Base service layer
  - Entity services
  - Relationship services
  - Migration scripts

### Changed
- Updated project structure to follow Next.js 14 conventions
- Enhanced database schema with proper relationships and constraints
- Improved type safety across all services
- Refined search functionality in entity services
- Removed redundant `auth.ts` file in favor of `authService.ts` for better type safety and user profile integration
- Consolidated authentication logic into `authService.ts` following service architecture pattern

### Fixed
- Type safety issues in relationship services
- Search functionality in entity services
- Error handling in all services

### Security
- Implemented proper error handling and type safety
- Added input validation in all services
- Secured database operations with proper constraints

## [0.1.0] - 2024-02-20

### Added
- Initial project setup
- Basic project structure
- Documentation setup
- Database schema design
- Supabase client configuration
- Base service implementation
- Entity Services Implementation:
  - PersonasService
  - OrganizacionesService
  - TemasService
  - ProyectosService
  - EntrevistasService
  - NoticiasService
- Relationship Services Implementation:
  - Base RelationshipService
  - PersonaTemaService
  - OrganizacionTemaService
  - ProyectoTemaService
  - EntrevistaTemaService
  - NoticiaTemaService
  - ProyectoPersonaRolService
  - ProyectoOrganizacionRolService

### Changed
- Updated project structure
- Enhanced database schema
- Improved type safety
- Refined search functionality

### Fixed
- Type safety issues
- Search functionality
- Error handling

### Security
- Implemented error handling
- Added input validation
- Secured database operations
