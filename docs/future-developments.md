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

### Phase 1: Initial Setup and Infrastructure ✅
- [x] Project structure setup
- [x] Basic configuration
- [x] Development environment setup
- [x] Initial documentation
- [x] Basic CI/CD pipeline

### Phase 2: Data Migration and Service Layer ✅
- [x] Database schema design and implementation
- [x] Supabase client configuration
- [x] Base service implementation
- [x] Entity services implementation
- [x] Relationship services implementation
- [x] Data migration scripts
  - [x] Base migration structure
  - [x] Firebase data extraction utilities
  - [x] Data transformation utilities
  - [x] Entity-specific transformation configurations
  - [x] Main data migration script

### Phase 2 Accomplishments
1. **Database Services Migration**
   - Implemented comprehensive database schema with proper relationships and constraints
   - Created base service infrastructure with type safety and error handling
   - Developed entity services for all core entities (Personas, Organizaciones, Temas, Proyectos, Entrevistas, Noticias)
   - Implemented relationship services for all entity pairs with role support
   - Added full-text search capabilities with Spanish language support

2. **Data Migration Infrastructure**
   - Created robust data extraction utilities from Firebase
   - Implemented flexible data transformation system
   - Developed entity-specific transformation configurations
   - Built main migration script with progress tracking and error handling
   - Added support for dry runs and configurable batch processing

### Pending Improvements and Technical Debt
1. **Migration Script Enhancements**
   - [ ] Implement CLI interface for migration script
     - Command-line arguments for configuration
     - Interactive mode for guided migration
     - Progress visualization
     - Error reporting and recovery options
   - [ ] Add migration validation tools
     - Data integrity checks
     - Relationship verification
     - Data consistency validation
   - [ ] Enhance rollback capabilities
     - Point-in-time recovery
     - Selective rollback by entity
     - Relationship rollback support

2. **Performance Optimizations**
   - [ ] Implement parallel processing for independent entities
   - [ ] Add caching for frequently accessed data
   - [ ] Optimize batch sizes based on entity type
   - [ ] Add progress persistence for long-running migrations

3. **Monitoring and Logging**
   - [ ] Add detailed logging system
   - [ ] Implement migration metrics collection
   - [ ] Create migration dashboard
   - [ ] Add alerting for migration issues

4. **Documentation**
   - [ ] Create migration guide
   - [ ] Add troubleshooting documentation
   - [ ] Document rollback procedures
   - [ ] Create migration best practices guide

### Phase 3: Authentication and Authorization
- [ ] User authentication implementation
- [ ] Role-based access control
- [ ] Permission management
- [ ] Session handling
- [ ] Security enhancements

### Phase 4: Frontend Development
- [ ] Component library setup
- [ ] Page layouts and templates
- [ ] Form implementations
- [ ] Data visualization
- [ ] Responsive design
- [ ] Accessibility features

### Phase 5: Testing and Quality Assurance

#### 1. Test Infrastructure Setup (Priority: High) ✅
- [x] Set up Jest testing environment
  - [x] Configure Jest with TypeScript
  - [x] Set up test database
  - [x] Configure test environment variables
  - [x] Add test utilities and helpers
- [x] Set up testing libraries
  - [x] @testing-library/react for component testing
  - [x] @testing-library/jest-dom for DOM assertions
  - [x] MSW for API mocking
  - [x] Cypress for E2E testing

#### 2. Unit Testing (Priority: High)
- [x] Service Layer Tests
  - [x] BaseService tests
  - [x] PersonasService tests
  - [ ] OrganizacionesService tests
  - [ ] TemasService tests
  - [ ] ProyectosService tests
  - [ ] EntrevistasService tests
  - [ ] NoticiasService tests
  - [ ] Relationship service tests
  - [ ] Error handling tests
- [ ] Utility Function Tests
  - [ ] Validation utilities
  - [ ] Error handling utilities
  - [ ] Type guards
  - [ ] Helper functions

#### 3. Integration Testing (Priority: High)
- [ ] API Integration Tests
  - [ ] CRUD operations
  - [ ] Relationship operations
  - [ ] Error scenarios
  - [ ] Authentication flows
- [ ] Database Integration Tests
  - [ ] Query performance
  - [ ] Transaction handling
  - [ ] Relationship integrity
  - [ ] Data consistency

#### 4. Component Testing (Priority: Medium)
- [ ] Form Components
  - [ ] Input validation
  - [ ] Error handling
  - [ ] Submission flows
- [ ] List Components
  - [ ] Pagination
  - [ ] Filtering
  - [ ] Sorting
- [ ] Modal Components
  - [ ] Open/close behavior
  - [ ] Content rendering
  - [ ] Event handling

#### 5. End-to-End Testing (Priority: Medium)
- [ ] User Flows
  - [ ] Authentication flows
  - [ ] CRUD operations
  - [ ] Search and filtering
  - [ ] File uploads
- [ ] Admin Panel
  - [ ] Dashboard functionality
  - [ ] User management
  - [ ] Content management
  - [ ] Settings management

#### 6. Performance Testing (Priority: Medium)
- [ ] Load Testing
  - [ ] API response times
  - [ ] Database query performance
  - [ ] Concurrent user handling
- [ ] Stress Testing
  - [ ] Maximum concurrent users
  - [ ] Resource utilization
  - [ ] Error handling under load

#### 7. Security Testing (Priority: High)
- [ ] Authentication Testing
  - [ ] Login flows
  - [ ] Session management
  - [ ] Password policies
- [ ] Authorization Testing
  - [ ] Role-based access
  - [ ] Permission checks
  - [ ] Resource protection
- [ ] Data Protection
  - [ ] Input validation
  - [ ] XSS prevention
  - [ ] CSRF protection

#### 8. Accessibility Testing (Priority: Medium)
- [ ] WCAG Compliance
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast
  - [ ] Focus management
- [ ] Mobile Responsiveness
  - [ ] Layout adaptation
  - [ ] Touch interactions
  - [ ] Viewport handling

#### Dependencies and Order
1. Test Infrastructure Setup must be completed first
2. Unit Testing can begin once infrastructure is ready
3. Integration Testing requires unit tests to be in place
4. Component Testing can run in parallel with integration tests
5. E2E Testing should start after component tests
6. Performance Testing can begin after E2E tests
7. Security Testing should be ongoing throughout
8. Accessibility Testing can be done in parallel with other tests

#### Progress Tracking
- [x] Test Infrastructure (4/4)
- [x] BaseService Tests (4/4)
- [x] PersonasService Tests (6/6)
- [ ] OrganizacionesService Tests (0/6)
- [ ] TemasService Tests (0/6)
- [ ] ProyectosService Tests (0/6)
- [ ] EntrevistasService Tests (0/6)
- [ ] NoticiasService Tests (0/6)
- [ ] Relationship Service Tests (0/6)
- [ ] Utility Function Tests (0/4)
- [ ] Integration Tests (0/8)
- [ ] Component Tests (0/6)
- [ ] E2E Tests (0/8)
- [ ] Performance Tests (0/6)
- [ ] Security Tests (0/9)
- [ ] Accessibility Tests (0/8)
- Total Progress: 14/91 (15.4%)

#### Success Criteria
- Test coverage > 80% for critical paths
- All critical user flows tested
- No high-priority security vulnerabilities
- WCAG 2.1 AA compliance
- Performance metrics within acceptable ranges
- All tests passing in CI/CD pipeline

### Phase 6: Deployment and DevOps
- [ ] Production environment setup
- [ ] Deployment automation
- [ ] Monitoring and logging
- [ ] Backup and recovery
- [ ] Performance optimization
- [ ] Security hardening

### Phase 7: Documentation and Training
- [ ] User documentation
- [ ] API documentation
- [ ] Developer guides
- [ ] Training materials
- [ ] Maintenance procedures

### Phase 8: Maintenance and Support
- [ ] Bug tracking system
- [ ] Support ticket system
- [ ] Regular updates
- [ ] Performance monitoring
- [ ] Security updates
- [ ] User feedback system

## === Completed Items ===

- Initial migration of core data model from Firebase Firestore to Supabase Postgres relational schema.
- Full creation of core tables: `personas`, `temas`, `organizaciones`, `noticias`, `entrevistas`, `proyectos`.
- Creation of all N:M relationship tables for projects, persons, interviews, and news.
- Replacement of `archivosAdjuntos` array in projects with relational table `proyecto_archivo`.
- Initial CRUD in Admin Panel for `personas`, `organizaciones`, `proyectos`, `noticias`, `entrevistas`.
- Basic public listing pages for `proyectos`, `noticias`, `entrevistas`, "Red de Tutores", "Red de Egresados".
- Logical delete implemented for all major tables (`estaEliminada`).
- Supabase Storage in place to replace Firebase Storage for `fotoURL`, `logoURL`, `archivoPrincipalURL`, etc.

## Phase 4: Query Optimization ✅

### Core Query Optimization (Completed)
- [x] Implement BaseService with common CRUD operations
- [x] Add error handling and validation utilities
- [x] Set up query performance monitoring
- [x] Implement caching strategy
- [x] Optimize PersonasService
- [x] Optimize ProyectosService
- [x] Optimize NoticiasService
- [x] Optimize TemasService
- [x] Optimize EntrevistasService
- [x] Optimize OrganizacionesService

### Overall Progress
- [x] Base Infrastructure (4/4)
- [x] Service Optimizations (6/6)
- Total Progress: 10/10 (100%)

## Future Optimizations

### Advanced Query Optimizations
- [ ] Add query performance monitoring
- [ ] Implement caching for frequently accessed data
- [ ] Add query logging and analytics
- [ ] Optimize complex joins and relationships

