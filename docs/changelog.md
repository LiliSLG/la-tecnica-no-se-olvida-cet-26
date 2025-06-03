# Changelog


## [2025-06-01] Migración Firestore → Supabase (Fase 1 y Fase 2)

- Migración completa de servicios:
    - Personas → `personasService.ts`
    - Proyectos → `proyectosService.ts`
    - Entrevistas → `entrevistasService.ts`
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
