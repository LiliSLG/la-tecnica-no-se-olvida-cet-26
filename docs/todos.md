## proyectosService.ts

- [ ] Implement the following methods if needed:
    - permanentlyDelete(id: string): Promise<ServiceResult<void>>
    - getProjectWithRelations(id: string): Promise<ServiceResult<ProyectoWithRelations | null>>
    - updateProjectWithRelations(id: string, data: UpdateProyectoWithRelations): Promise<ServiceResult<ProyectoWithRelations | null>>
    - getProjectStats(id: string): Promise<ServiceResult<ProjectStats | null>>
    - getProjectTimeline(id: string): Promise<ServiceResult<ProjectTimeline | null>>
    - getProjectContributors(id: string): Promise<ServiceResult<ProjectContributors | null>>
    - getProjectOrganizations(id: string): Promise<ServiceResult<ProjectOrganizations | null>>
    - getProjectTopics(id: string): Promise<ServiceResult<ProjectTopics | null>>
    - getProjectFiles(id: string): Promise<ServiceResult<ProjectFiles | null>>
    - getProjectComments(id: string): Promise<ServiceResult<ProjectComments | null>>
    - getProjectLikes(id: string): Promise<ServiceResult<ProjectLikes | null>>
    - getProjectShares(id: string): Promise<ServiceResult<ProjectShares | null>>
    - getProjectViews(id: string): Promise<ServiceResult<ProjectViews | null>>
    - getProjectAnalytics(id: string): Promise<ServiceResult<ProjectAnalytics | null>>
    - getProjectReports(id: string): Promise<ServiceResult<ProjectReports | null>>
    - getProjectAuditLog(id: string): Promise<ServiceResult<ProjectAuditLog | null>>
    - getProjectPermissions(id: string): Promise<ServiceResult<ProjectPermissions | null>>
    - getProjectSettings(id: string): Promise<ServiceResult<ProjectSettings | null>>
    - getProjectNotifications(id: string): Promise<ServiceResult<ProjectNotifications | null>>
    - getProjectIntegrations(id: string): Promise<ServiceResult<ProjectIntegrations | null>>
    - getProjectWebhooks(id: string): Promise<ServiceResult<ProjectWebhooks | null>>
    - getProjectAPIKeys(id: string): Promise<ServiceResult<ProjectAPIKeys | null>>
    - getProjectSecrets(id: string): Promise<ServiceResult<ProjectSecrets | null>>
    - getProjectEnvironments(id: string): Promise<ServiceResult<ProjectEnvironments | null>>
    - getProjectDeployments(id: string): Promise<ServiceResult<ProjectDeployments | null>>
    - getProjectBuilds(id: string): Promise<ServiceResult<ProjectBuilds | null>>
    - getProjectTests(id: string): Promise<ServiceResult<ProjectTests | null>>
    - getProjectCoverage(id: string): Promise<ServiceResult<ProjectCoverage | null>>
    - getProjectDependencies(id: string): Promise<ServiceResult<ProjectDependencies | null>>
    - getProjectVulnerabilities(id: string): Promise<ServiceResult<ProjectVulnerabilities | null>>
    - getProjectLicenses(id: string): Promise<ServiceResult<ProjectLicenses | null>>
    - getProjectDocumentation(id: string): Promise<ServiceResult<ProjectDocumentation | null>>
    - getProjectWiki(id: string): Promise<ServiceResult<ProjectWiki | null>>
    - getProjectIssues(id: string): Promise<ServiceResult<ProjectIssues | null>>
    - getProjectPullRequests(id: string): Promise<ServiceResult<ProjectPullRequests | null>>
    - getProjectReleases(id: string): Promise<ServiceResult<ProjectReleases | null>>
    - getProjectTags(id: string): Promise<ServiceResult<ProjectTags | null>>
    - getProjectBranches(id: string): Promise<ServiceResult<ProjectBranches | null>>
    - getProjectCommits(id: string): Promise<ServiceResult<ProjectCommits | null>>

## AddPersonaModal.tsx
- [ ] Migrate persona creation to Supabase service (personasService) and use Supabase Storage for image uploads
- [ ] Replace all usage of firebase storage and createPersonaPlaceholder with Supabase equivalents
- [ ] Migrate Firebase Storage upload to Supabase Storage
- [ ] Replace createPersonaPlaceholder with PersonasService.create
- [ ] Update form types to match Supabase schema
- [ ] Fix type issues with CategoriaPrincipalPersona enum
- [ ] Update form validation to match new schema
- [ ] Add proper error handling for Supabase operations
- [ ] Update file upload progress tracking for Supabase
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations

## TemaForm.tsx
- [ ] Migrate to use TemasService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for tema metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for tema relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for tema status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for tema categories
- [ ] Update form field placeholders to match Supabase schema

## ProjectForm.tsx
- [ ] Migrate ProjectForm.tsx to use the new Supabase service (ProyectosService) for CRUD operations 

## AddTemaModal.tsx
- [ ] Migrate to use TemasService from Supabase
- [ ] Update form types to match Supabase schema
- [ ] Implement proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema

## AddOrganizacionModal.tsx
- [ ] Migrate AddOrganizacionModal.tsx to use the new Supabase service (OrganizacionesService) for CRUD operations 

# Migration TODOs

## Forms Migration

### AddOrganizacionModal.tsx
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to handle all fields
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for email and website fields
- [ ] Add proper handling for organization type field

### ProjectForm.tsx
- [ ] Replace remaining Firebase-style functions with Supabase equivalents
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to handle all fields
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update file upload handling to use Supabase Storage
- [ ] Update relationship handling to use Supabase relations
- [ ] Add proper handling for project status transitions
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for project metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for project attachments
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for project relationships

### TemaForm.tsx
- [ ] Migrate to use TemasService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for tema metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for tema relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for tema status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for tema categories
- [ ] Update form field placeholders to match Supabase schema

### NoticiaForm.tsx
- [ ] Migrate to use NoticiasService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for noticia metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for noticia relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for noticia status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for noticia categories
- [ ] Update form field placeholders to match Supabase schema
- [ ] Add proper handling for image uploads
- [ ] Update image preview handling
- [ ] Add proper handling for external URLs
- [ ] Update tema selection handling
- [ ] Add proper handling for publication dates
- [ ] Update form field validation for dates
- [ ] Add proper handling for featured status
- [ ] Update form field validation for featured status
- [ ] Add proper handling for publication status
- [ ] Update form field validation for publication status

### EntrevistaForm.tsx
- [ ] Migrate to use EntrevistasService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for entrevista metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for entrevista relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for entrevista status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for entrevista categories
- [ ] Update form field placeholders to match Supabase schema
- [ ] Add proper handling for thumbnail uploads
- [ ] Update thumbnail preview handling
- [ ] Add proper handling for transcription file uploads
- [ ] Update transcription file handling
- [ ] Add proper handling for video URLs
- [ ] Update video platform handling
- [ ] Add proper handling for recording dates
- [ ] Update form field validation for dates
- [ ] Add proper handling for publication status
- [ ] Update form field validation for publication status
- [ ] Add proper handling for keywords
- [ ] Update form field validation for keywords
- [ ] Add proper handling for information sources
- [ ] Update form field validation for information sources
- [ ] Add proper handling for collectors
- [ ] Update form field validation for collectors

### OrganizacionForm.tsx
- [ ] Migrate to use OrganizacionesService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for organizacion metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for organizacion relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for organizacion status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for organizacion types
- [ ] Update form field placeholders to match Supabase schema
- [ ] Add proper handling for logo uploads
- [ ] Update logo preview handling
- [ ] Add proper handling for SVG files
- [ ] Update form field validation for URLs
- [ ] Add proper handling for contact information
- [ ] Update form field validation for contact information
- [ ] Add proper handling for location data
- [ ] Update form field validation for location data
- [ ] Add proper handling for website URLs
- [ ] Update form field validation for website URLs
- [ ] Add proper handling for email addresses
- [ ] Update form field validation for email addresses
- [ ] Add proper handling for phone numbers
- [ ] Update form field validation for phone numbers

### PersonaForm.tsx
- [ ] Migrate to use PersonasService from Supabase
- [ ] Update form types to match Supabase schema exactly
- [ ] Add proper error handling for Supabase operations
- [ ] Update form validation to match new schema
- [ ] Add proper type definitions for form data
- [ ] Update form submission logic to use new service
- [ ] Add proper error messages for Supabase operations
- [ ] Update form reset logic to match new schema
- [ ] Add proper loading states for Supabase operations
- [ ] Update form field types to match Supabase schema
- [ ] Add proper handling for optional fields
- [ ] Add proper validation for all fields
- [ ] Update form state management to match Supabase schema
- [ ] Add proper handling for persona metadata
- [ ] Update form field validation to match Supabase constraints
- [ ] Add proper handling for persona relationships
- [ ] Update form field dependencies to match Supabase schema
- [ ] Add proper handling for persona status transitions
- [ ] Update form field labels to match Supabase schema
- [ ] Add proper handling for persona categories
- [ ] Update form field placeholders to match Supabase schema
- [ ] Add proper handling for profile photo uploads
- [ ] Update photo preview handling
- [ ] Add proper handling for SVG files
- [ ] Update form field validation for URLs
- [ ] Add proper handling for contact information
- [ ] Update form field validation for contact information
- [ ] Add proper handling for location data
- [ ] Update form field validation for location data
- [ ] Add proper handling for professional links
- [ ] Update form field validation for professional links
- [ ] Add proper handling for platform capabilities
- [ ] Update form field validation for platform capabilities
- [ ] Add proper handling for profile visibility
- [ ] Update form field validation for profile visibility
- [ ] Add proper handling for employment status
- [ ] Update form field validation for employment status
- [ ] Add proper handling for CET information
- [ ] Update form field validation for CET information
- [ ] Add proper handling for professional interests
- [ ] Update form field validation for professional interests
- [ ] Add proper handling for collaboration offers 

## Service Migration

### CreateProjectContent.tsx
- [ ] Update import from `@/lib/supabase/proyectosService` to `@/lib/supabase/services/proyectosService`
- [ ] Update `addProject` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

### EditProjectContent.tsx
- [ ] Update import from `@/lib/supabase/proyectosService` to `@/lib/supabase/services/proyectosService`
- [ ] Update `getProjectById` and `updateProject` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

### EgresadosEstudiantesContent.tsx
- [ ] Update import from `@/lib/supabase/personasService` to `@/lib/supabase/services/personasService`
- [ ] Update `getPublicEgresadosYEstudiantes` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### HistoriaOralListContent.tsx
- [ ] Update imports from old paths to new `/services/` paths
- [ ] Update `getPublicadasEntrevistas` usage to match new service interface
- [ ] Update `getPersonaById` usage to match new service interface
- [ ] Update `getAllTemasActivos` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### JobBoardContent.tsx
- [ ] Update import from `@/lib/supabase/temasService` to `@/lib/supabase/services/temasService`
- [ ] Update `getAllTemasActivos` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### NoticiaDetailContent.tsx
- [ ] Update import from `@/lib/supabase/noticiasService` to `@/lib/supabase/services/noticiasService`
- [ ] Update `getNoticiaById` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### NoticiasListContent.tsx
- [ ] Update import from `@/lib/supabase/noticiasService` to `@/lib/supabase/services/noticiasService`
- [ ] Update `getPublicadasNoticias` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### PersonaDetailContent.tsx
- [ ] Update import from `@/lib/supabase/personasService` to `@/lib/supabase/services/personasService`
- [ ] Update `getPersonaById` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### ProjectDetailContent.tsx
- [ ] Update import from `@/lib/supabase/proyectosService` to `@/lib/supabase/services/proyectosService`
- [ ] Update `getProjectById` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### TutorsNetworkContent.tsx
- [ ] Update imports from old paths to new `/services/` paths
- [ ] Update `getPublicTutoresYColaboradores` usage to match new service interface
- [ ] Update `getPublicOrganizaciones` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching logic to use new service methods

### Admin Pages
#### organizaciones-gestion/editar/[id]/page.tsx
- [ ] Update import from `@/lib/supabase/organizacionesService` to `@/lib/supabase/services/organizacionesService`
- [ ] Update `getOrganizacionById` and `updateOrganizacion` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-temas/nueva/page.tsx
- [ ] Update import from `@/lib/supabase/temasService` to `@/lib/supabase/services/temasService`
- [ ] Update `addTema` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-temas/editar/[id]/page.tsx
- [ ] Update import from `@/lib/supabase/temasService` to `@/lib/supabase/services/temasService`
- [ ] Update `getTemaById` and `updateTema` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-noticias/editar/[id]/page.tsx
- [ ] Update import from `@/lib/supabase/noticiasService` to `@/lib/supabase/services/noticiasService`
- [ ] Update `getNoticiaById` and `updateNoticia` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-noticias/nueva/page.tsx
- [ ] Update import from `@/lib/supabase/noticiasService` to `@/lib/supabase/services/noticiasService`
- [ ] Update `addNoticia` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-entrevistas/editar/[id]/page.tsx
- [ ] Update import from `@/lib/supabase/entrevistasService` to `@/lib/supabase/services/entrevistasService`
- [ ] Update `getEntrevistaById` and `updateEntrevista` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

#### gestion-entrevistas/nueva/page.tsx
- [ ] Update import from `@/lib/supabase/entrevistasService` to `@/lib/supabase/services/entrevistasService`
- [ ] Update `addEntrevista` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update form submission logic to use new service methods

### Admin Components
#### AdminNoticiaList.tsx
- [ ] Update import from `@/lib/supabase/noticiasService` to `@/lib/supabase/services/noticiasService`
- [ ] Update `getAllNoticiasForAdmin`, `logicalDeleteNoticia`, and `restoreNoticia` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching and manipulation logic to use new service methods

#### AdminOrganizacionList.tsx
- [ ] Update import from `@/lib/supabase/organizacionesService` to `@/lib/supabase/services/organizacionesService`
- [ ] Update `getAllOrganizacionesForAdmin`, `logicalDeleteOrganizacion`, and `restoreOrganizacion` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching and manipulation logic to use new service methods

#### AdminTemaList.tsx
- [ ] Update import from `@/lib/supabase/temasService` to `@/lib/supabase/services/temasService`
- [ ] Update `getAllTemasForAdmin`, `logicalDeleteTema`, and `restoreTema` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching and manipulation logic to use new service methods

#### AdminEntrevistaList.tsx
- [ ] Update import from `@/lib/supabase/entrevistasService` to `@/lib/supabase/services/entrevistasService`
- [ ] Update `getAllEntrevistasForAdmin`, `logicalDeleteEntrevista`, and `restoreEntrevista` usage to match new service interface
- [ ] Add proper error handling for Supabase operations
- [ ] Update data fetching and manipulation logic to use new service methods

## Database Schema Updates

### personas table
- [ ] Add missing fields to personas table:
  - [ ] apellido (string)
  - [ ] es_ex_alumno_cet (boolean)
  - [ ] ano_egreso_cet (number)
  - [ ] ano_cursada_actual_cet (number)
  - [ ] titulo_profesional (string)
  - [ ] descripcion_personal_o_profesional (string)
  - [ ] areas_de_interes_o_expertise (string[])
  - [ ] disponible_para_proyectos (boolean)
  - [ ] titulacion_obtenida_cet (string)
  - [ ] proyecto_final_cet_id (string)
  - [ ] buscando_oportunidades (boolean)
  - [ ] estado_situacion_laboral (string)
  - [ ] historia_de_exito_o_resumen_trayectoria (string)
  - [ ] empresa_o_institucion_actual (string)
  - [ ] cargo_actual (string)
  - [ ] ofrece_colaboracion_como (string[])
  - [ ] telefono_contacto (string)
  - [ ] links_profesionales (jsonb)
  - [ ] ubicacion_residencial (jsonb)
  - [ ] visibilidad_perfil (string)
  - [ ] ingresado_por (string)
  - [ ] modificado_por (string)

### Entrevistas Table
- [ ] Add missing fields to `entrevistas` table:
  - `intervieweeName`: string
  - `summary`: string | null
  - `type`: string
  - `mediaUrl`: string | null
  - `ambitoSaber`: string | null
  - `fecha`: string | null
  - `duracion`: number | null
  - `lugar`: string | null
  - `participantes`: string[]
  - `temas`: string[]
  - `organizaciones`: string[]
  - `archivos`: string[]
  - `notas`: string | null
  - `transcripcion`: string | null
  - `esta_publicada`: boolean

# TODOs

## Environment Setup
- [ ] Create `.env.local` file with the following variables:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Services Migration
- [ ] Migrate NoticiasService to new BaseService architecture and ensure all methods are consistent with the new pattern. Update all usages to import from '@/lib/supabase/services/noticiasService'.