# Future Developments and Improvements

## Pending / To Do

- [ ] **Role Automation:** Implement role automation logic to update `Persona.capacidadesPlataforma` based on actual involvement in projects (`proyecto_autor`, `proyecto_tutor`, etc.). This will now be done via Supabase triggers or backend services (not Cloud Functions).
- [ ] **Detailed Profile Page (`/comunidad/perfil/[personaId]`):** Fully implement fine-grained content visibility based on `Persona.visibilidadPerfil` and the viewing user's role/status. Implement the "Proyectos Destacados" section.
- [ ] **Advanced Filters:** Enhance public list pages (Projects, News, Interviews, Alumni Network) with more advanced filtering capabilities.
- [ ] **Social Interaction Features:** Consider adding "Like", "Share", and "Comments" functionalities to Projects and News.
- [ ] **Rich Text Editor:** Implement a rich text editor (Markdown or WYSIWYG) for `Noticia.contenido` and potentially for long description fields.
- [ ] **Job Board / Opportunities Section:** Develop the "Bolsa de Trabajo" functionality.
- [ ] **AI-Powered Search/QA:** Implement the RAG-based AI query system for platform content, integrated with the new Supabase database and Storage.
- [ ] **Debouncing:** Ensure all autocomplete/search inputs use debouncing for performance.
- [ ] **File Deletion from Storage:** Implement logic to delete associated files from Supabase Storage when a `fotoURL`, `logoURL`, `archivoPrincipalURL`, etc., is removed or when a record is deleted.
- [ ] **Image Optimization:** Consider client-side or server-side image optimization for uploads.
- [ ] **User Onboarding/Profile Completion Flow:** Guide new users to complete their profiles.
- [ ] **Map Integration:** For `ubicacion` fields (stored as `jsonb` with coordinates), consider displaying a map (e.g., Leaflet, Mapbox).

## Mocked or Placeholder Sections to Make Functional

- [ ] "Consultas IA" page: Currently an introductory page, will need to be a functional chat interface.
- [ ] "Estadísticas" in Admin Panel.
- [ ] "Configuración General" in Admin Panel.
- [ ] Placeholder "Ver Perfil Completo" buttons should all lead to the functional profile page.

## Firebase → Supabase Migration Phases

### Phase 1: Initial Cleanup and Preparation
- [ ] **Dependency Audit**
  - [ ] Identify all Firebase dependencies in `package.json`
  - [ ] List all Firebase configuration files
  - [ ] Document all Firebase-related environment variables
  - [ ] Create inventory of Firebase services in use

- [ ] **Documentation Setup**
  - [ ] Create migration tracking section in `changelog.md`
  - [ ] Document current Firebase usage patterns
  - [ ] Set up migration progress tracking
  - [ ] Create rollback plan for each phase

### Phase 2: Core Service Migration
- [ ] **Authentication Migration**
  - [ ] Set up Supabase Auth configuration
  - [ ] Migrate Firebase Auth calls to Supabase Auth
  - [ ] Update auth middleware and protected routes
  - [ ] Test basic auth flows (login, signup)
  - [ ] Implement password reset flow
  - [ ] Test role-based access control

- [ ] **Storage Migration**
  - [ ] Verify Supabase Storage configuration
  - [ ] Test file upload/download operations
  - [ ] Migrate existing files from Firebase Storage
  - [ ] Update all storage-related code
  - [ ] Implement file deletion cleanup
  - [ ] Test storage permissions

- [ ] **Database Services Migration**
  - [ ] Migrate `personasService` to Supabase
  - [ ] Migrate `proyectosService` to Supabase
  - [ ] Migrate `entrevistasService` to Supabase
  - [ ] Migrate `noticiasService` to Supabase
  - [ ] Test all CRUD operations
  - [ ] Verify data relationships

### Phase 3: Code Stabilization
- [ ] **Error Handling Implementation**
  - [ ] Create standardized error response types
  - [ ] Implement consistent error handling
  - [ ] Add proper error logging
  - [ ] Test error scenarios
  - [ ] Document error handling patterns
  - [ ] Implement error recovery strategies

- [ ] **Type Safety Enhancement**
  - [ ] Create Supabase response types
  - [ ] Add runtime type validation
  - [ ] Update existing type definitions
  - [ ] Document type patterns
  - [ ] Add type guards where needed
  - [ ] Test type safety in CI

- [ ] **Transaction Support**
  - [ ] Implement transaction handling
  - [ ] Add rollback mechanisms
  - [ ] Document transaction patterns
  - [ ] Test transaction scenarios
  - [ ] Add transaction logging
  - [ ] Implement retry logic

### Phase 4: Testing and Validation
- [ ] **Test Implementation**
  - [ ] Add unit tests for Supabase services
  - [ ] Add integration tests
  - [ ] Test all CRUD operations
  - [ ] Test all relationships
  - [ ] Add performance tests
  - [ ] Set up test coverage reporting

- [ ] **Data Validation**
  - [ ] Verify data integrity
  - [ ] Test all constraints
  - [ ] Validate storage operations
  - [ ] Document validation results
  - [ ] Test data migration scripts
  - [ ] Verify data consistency

### Phase 5: Optimization and Cleanup
- [ ] **Performance Optimization**
  - [ ] Optimize Supabase queries
  - [ ] Implement caching
  - [ ] Optimize storage operations
  - [ ] Document performance improvements
  - [ ] Add performance monitoring
  - [ ] Implement query logging

- [ ] **Code Cleanup**
  - [ ] Remove Firebase dependencies
  - [ ] Clean up unused imports
  - [ ] Remove Firebase types
  - [ ] Update documentation
  - [ ] Remove Firebase config files
  - [ ] Clean up environment variables

### Phase 6: Finalization
- [ ] **Environment Updates**
  - [ ] Update development setup
  - [ ] Update deployment configs
  - [ ] Update CI/CD pipelines
  - [ ] Document environment changes
  - [ ] Update local development guide
  - [ ] Update deployment documentation

- [ ] **Final Verification**
  - [ ] Verify all features
  - [ ] Test admin functionality
  - [ ] Test public pages
  - [ ] Document verification results
  - [ ] Perform security audit
  - [ ] Test backup and recovery

- [ ] **Documentation Finalization**
  - [ ] Update all documentation
  - [ ] Add migration notes
  - [ ] Document new patterns
  - [ ] Update changelog
  - [ ] Create migration guide
  - [ ] Update API documentation

## === Completed Items ===

- Initial migration of core data model from Firebase Firestore to Supabase Postgres relational schema.
- Full creation of core tables: `personas`, `temas`, `organizaciones`, `noticias`, `entrevistas`, `proyectos`.
- Creation of all N:M relationship tables for projects, persons, interviews, and news.
- Replacement of `archivosAdjuntos` array in projects with relational table `proyecto_archivo`.
- Initial CRUD in Admin Panel for `personas`, `organizaciones`, `proyectos`, `noticias`, `entrevistas`.
- Basic public listing pages for `proyectos`, `noticias`, `entrevistas`, "Red de Tutores", "Red de Egresados".
- Logical delete implemented for all major tables (`estaEliminada`).
- Supabase Storage in place to replace Firebase Storage for `fotoURL`, `logoURL`, `archivoPrincipalURL`, etc.

