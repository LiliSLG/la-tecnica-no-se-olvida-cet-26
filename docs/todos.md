# TODO List: Migración y Desarrollo "La técnica no se olvida"

Este documento organiza las tareas pendientes para la migración a Supabase y el desarrollo continuo de la plataforma.

**Principios Clave de Migración/Desarrollo:**
*   **Consistencia:** Seguir el patrón `BaseService` y las convenciones definidas en `blueprint.md > /lib/supabase/ Structure and Service Pattern`.
*   **Schema Primero:** Asegurar que el schema de la base de datos (`database.types.ts`) refleje correctamente las necesidades antes de implementar servicios y UI.
*   **Servicios como Única Fuente de Verdad:** No acceder directamente a Supabase (`supabaseClient.from(...)`) desde los componentes. Usar siempre los servicios.
*   **Tipado Estricto:** Aprovechar TypeScript para garantizar la integridad de los datos entre la UI, los servicios y la base de datos.

---

## ⓪ Configuración de Entorno
- [ ] Crear archivo `.env.local` con las variables:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de tu proyecto Supabase.

---

## ① Actualizaciones de Schema de Base de Datos (Supabase)

### Tabla `personas`
- [ ] Añadir los siguientes campos faltantes (revisar tipos de datos y si alguno puede ser `JSONB` o `TEXT[]`):
  - [ ] `apellido` (TEXT, NOT NULL)
  - [ ] `es_ex_alumno_cet` (BOOLEAN, DEFAULT FALSE)
  - [ ] `ano_egreso_cet` (INTEGER, NULLABLE)
  - [ ] `ano_cursada_actual_cet` (INTEGER, NULLABLE)
  - [ ] `titulo_profesional` (TEXT, NULLABLE)
  - [ ] `descripcion_personal_o_profesional` (TEXT, NULLABLE)
  - [ ] `areas_de_interes_o_expertise` (TEXT[], NULLABLE)
  - [ ] `disponible_para_proyectos` (BOOLEAN, DEFAULT FALSE)
  - [ ] `titulacion_obtenida_cet` (TEXT, NULLABLE)
  - [ ] `proyecto_final_cet_id` (UUID, NULLABLE, FOREIGN KEY a `proyectos.id` si aplica)
  - [ ] `buscando_oportunidades` (BOOLEAN, DEFAULT FALSE)
  - [ ] `estado_situacion_laboral` (TEXT, NULLABLE) <!-- Considerar un ENUM o tabla relacionada si hay valores fijos -->
  - [ ] `historia_de_exito_o_resumen_trayectoria` (TEXT, NULLABLE)
  - [ ] `empresa_o_institucion_actual` (TEXT, NULLABLE)
  - [ ] `cargo_actual` (TEXT, NULLABLE)
  - [ ] `ofrece_colaboracion_como` (TEXT[], NULLABLE)
  - [ ] `telefono_contacto` (TEXT, NULLABLE)
  - [ ] `links_profesionales` (JSONB, NULLABLE) <!-- Ej: [{platform: 'linkedin', url: '...'}, ...] -->
  - [ ] `ubicacion_residencial` (JSONB, NULLABLE) <!-- Ej: {ciudad: '...', provincia: '...'} o usar PostGIS si se necesita geo-búsqueda -->
  - [ ] `visibilidad_perfil` (TEXT, DEFAULT 'publico') <!-- Considerar ENUM: publico, privado, solo_cet -->
  - [ ] `ingresado_por` (UUID, NULLABLE, FOREIGN KEY a `auth.users.id` o `personas.id`)
  - [ ] `modificado_por` (UUID, NULLABLE, FOREIGN KEY a `auth.users.id` o `personas.id`)

### Tabla `entrevistas`
- [ ] Añadir/verificar los siguientes campos (revisar tipos de datos):
  - [ ] `intervieweeName` (TEXT, NOT NULL) <!-- ¿O es un FK a `personas`? Si es así, `persona_id` -->
  - [ ] `summary` (TEXT, NULLABLE)
  - [ ] `type` (TEXT, NOT NULL) <!-- Considerar ENUM: audio, video, transcripcion -->
  - [ ] `mediaUrl` (TEXT, NULLABLE) <!-- URL al archivo en Supabase Storage o link externo -->
  - [ ] `ambitoSaber` (TEXT, NULLABLE)
  - [ ] `fecha` (DATE o TIMESTAMP WITH TIME ZONE, NULLABLE)
  - [ ] `duracion` (INTERVAL o INTEGER en segundos/minutos, NULLABLE)
  - [ ] `lugar` (TEXT, NULLABLE)
  - [ ] `participantes` (UUID[], NULLABLE) <!-- Array de IDs de `personas` -->
  - [ ] `temas` (UUID[], NULLABLE) <!-- Array de IDs de `temas` -->
  - [ ] `organizaciones` (UUID[], NULLABLE) <!-- Array de IDs de `organizaciones` -->
  - [ ] `archivos` (JSONB[], NULLABLE) <!-- Array de objetos {nombre: string, url: string, tipo: string} para archivos asociados -->
  - [ ] `notas` (TEXT, NULLABLE)
  - [ ] `transcripcion_path` (TEXT, NULLABLE) <!-- Path al archivo de transcripción en Supabase Storage -->
  - [ ] `esta_publicada` (BOOLEAN, DEFAULT FALSE)

---

## ② Capa de Servicios (`/lib/supabase/services/`)

### `proyectosService.ts`
- [ ] **Revisión Crítica de Métodos:** La lista actual es exhaustiva pero potencialmente excesiva para un servicio genérico. Implementar primero los métodos CRUD básicos y aquellos esenciales para las relaciones principales. Añadir métodos más específicos (`getProjectStats`, `getProjectTimeline`, etc.) *solo cuando sean requeridos por la UI y representen una lógica de datos reutilizable*. Muchos de estos podrían ser cálculos o composiciones hechas en el frontend o en Edge Functions específicas si son complejos.
- [ ] **Implementar Métodos Esenciales (si no existen o necesitan refactor):**
    - [ ] `create(data: CreateProyecto): Promise<ServiceResult<Proyecto>>`
    - [ ] `getById(id: string): Promise<ServiceResult<Proyecto | null>>`
    - [ ] `getAll(params?: any): Promise<ServiceResult<Proyecto[]>>` (con filtros, paginación)
    - [ ] `update(id: string, data: UpdateProyecto): Promise<ServiceResult<Proyecto | null>>`
    - [ ] `delete(id: string): Promise<ServiceResult<void>>` (logical delete)
    - [ ] `permanentlyDelete(id: string): Promise<ServiceResult<void>>`
- [ ] **Implementar Métodos Relacionales Clave (ejemplos, añadir según necesidad):**
    - [ ] `getProjectWithRelations(id: string): Promise<ServiceResult<ProyectoWithRelations | null>>` (incluye autores, temas, organizaciones, etc.)
    - [ ] `updateProjectWithRelations(id: string, data: UpdateProyectoWithRelations): Promise<ServiceResult<ProyectoWithRelations | null>>` (para manejar la actualización de M:N y otras relaciones complejas en una transacción o secuencia controlada)
    - [ ] `getProjectContributors(id: string): Promise<ServiceResult<Persona[] | null>>`
    - [ ] `getProjectOrganizations(id: string): Promise<ServiceResult<Organizacion[] | null>>`
    - [ ] `getProjectTopics(id: string): Promise<ServiceResult<Tema[] | null>>`
    - [ ] `getProjectFiles(id: string): Promise<ServiceResult<ProjectFile[] | null>>` (si los archivos se gestionan como entidades relacionadas)
- [ ] **Evaluar y posponer/descartar el resto de la lista original** (e.g., `getProjectLikes`, `getProjectAuditLog`, `getProjectAPIKeys`, etc.) hasta que haya una necesidad clara en la UI. Algunos podrían ser características futuras separadas.

### `noticiasService.ts`
- [ ] Migrar completamente a la nueva arquitectura `BaseService`.
- [ ] Asegurar que todos los métodos son consistentes con el nuevo patrón.
- [ ] Actualizar todas las importaciones y usos en la aplicación para que apunten a `@/lib/supabase/services/noticiasService`.

### Otros Servicios (`entrevistasService`, `organizacionesService`, `temasService`, `personasService`, `relationshipService`)
- [ ] Verificar que todos los servicios existentes sigan el patrón `BaseService` y las convenciones del proyecto.
- [ ] Implementar los métodos CRUD básicos y los métodos relacionales necesarios si aún no existen o requieren adaptación.

### `personasService.ts`
- [ ] **Implementar Métodos Faltantes:**
    - [ ] `getByIds(ids: string[]): Promise<ServiceResult<Persona[]>>` - Para obtener múltiples personas por sus IDs
    - [ ] `search(term: string): Promise<ServiceResult<Persona[]>>` - Para búsqueda de personas
- [ ] **Update type conversion in `getById` to properly map database fields to domain model:**
    - [ ] Map `foto_url` to `fotoURL`
    - [ ] Map `categoria_principal` to `categoriaPrincipal`
    - [ ] Map `es_admin` to `esAdmin`
    - [ ] Map `esta_eliminado` to `activo`
    - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
    - [ ] Map `eliminado_en` to `eliminadoEn`
    - [ ] Map `created_at` to `creadoEn`
    - [ ] Map `updated_at` to `actualizadoEn`

### `organizacionesService.ts`
- [ ] **Implementar Métodos Faltantes:**
    - [ ] `getByIds(ids: string[]): Promise<ServiceResult<Organizacion[]>>` - Para obtener múltiples organizaciones por sus IDs
    - [ ] `search(term: string): Promise<ServiceResult<Organizacion[]>>` - Para búsqueda de organizaciones
- [ ] **Update type conversion in `getById` to properly map database fields to domain model:**
    - [ ] Map `nombre` to `nombreOficial`
    - [ ] Map `logo_url` to `logoURL`
    - [ ] Map `sitio_web` to `sitioWeb`
    - [ ] Map `esta_eliminada` to `estaEliminada`
    - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
    - [ ] Map `eliminado_en` to `eliminadoEn`
    - [ ] Map `created_at` to `creadoEn`
    - [ ] Map `updated_at` to `actualizadoEn`

### `temasService.ts`
- [ ] **Implementar Métodos Faltantes:**
    - [ ] `getByIds(ids: string[]): Promise<ServiceResult<Tema[]>>` - Para obtener múltiples temas por sus IDs
    - [ ] `getAllActivos(): Promise<ServiceResult<Tema[]>>` - Para obtener todos los temas activos
- [ ] **Update type conversion in `getById` to properly map database fields to domain model:**
    - [ ] Map `esta_eliminado` to `estaEliminado`
    - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
    - [ ] Map `eliminado_en` to `eliminadoEn`
    - [ ] Map `created_at` to `creadoEn`
    - [ ] Map `updated_at` to `actualizadoEn`

### CursosService
- [ ] Create `cursosService.ts` with the following methods:
  - [ ] `getAll(): Promise<ServiceResult<Curso[]>>` - To retrieve all courses
  - [ ] `getById(id: string): Promise<ServiceResult<Curso>>` - To retrieve a course by ID
  - [ ] `search(term: string): Promise<ServiceResult<Curso[]>>` - To search courses by term
  - [ ] `getByNivel(nivel: NivelCurso): Promise<ServiceResult<Curso[]>>` - To get courses by level
  - [ ] `getByTema(tema: string): Promise<ServiceResult<Curso[]>>` - To get courses by topic

---

## ③ Migración de Formularios a Supabase Services y Storage

**Checklist Genérico para Migración de Formularios:**
*   [ ] Usar el servicio Supabase correspondiente (ej. `personasService.create`, `temasService.update`).
*   [ ] Actualizar los tipos de datos del formulario (`Yup` schema, `zod` schema, o tipos de estado de React Hook Form) para que coincidan *exactamente* con el schema de Supabase (`database.types.ts`).
*   [ ] Implementar subida de archivos/imágenes a **Supabase Storage** usando `supabaseStorage.ts` y actualizar el progreso de subida.
*   [ ] Reemplazar cualquier lógica de Firebase Storage/Firestore.
*   [ ] Actualizar la validación del formulario para que coincida con las restricciones del schema de Supabase (longitudes, tipos, campos obligatorios).
*   [ ] Implementar manejo de errores robusto específico para operaciones de Supabase (mostrar mensajes de error al usuario).
*   [ ] Implementar estados de carga (`isLoading`) durante las operaciones asíncronas.
*   [ ] Actualizar la lógica de reseteo del formulario.
*   [ ] Manejar correctamente campos opcionales y relaciones (ej. selectores para temas, autores, etc.).
*   [ ] Actualizar etiquetas y placeholders si es necesario.

### Formularios Específicos (Aplicar Checklist Genérico y atender particularidades):

**`AddPersonaModal.tsx` / `PersonaForm.tsx` (unificar si es posible o tratar por separado si son muy distintos):**
- (Aplicar Checklist Genérico)
- [ ] Particularidades:
    - [ ] Corregir problemas de tipo con el enum `CategoriaPrincipalPersona` (asegurar que coincida con los valores permitidos en DB o usar una tabla relacionada).
    - [ ] Manejar campos específicos de `personas` (ver Schema): `es_ex_alumno_cet`, `links_profesionales`, `ofrece_colaboracion_como`, etc.
    - [ ] Manejo de foto de perfil (subida, previsualización).
    - [ ] Considerar si "ingresado_por" y "modificado_por" se gestionan automáticamente (e.g., con Edge Functions o desde el servicio usando el usuario autenticado).
    - [ ] Revisar y refactorizar el flujo de envío del formulario en `PersonaForm.tsx` para manejar correctamente los resultados de envío y errores.

**`AddTemaModal.tsx` / `TemaForm.tsx` (unificar si es posible):**
- (Aplicar Checklist Genérico)
- [ ] Particularidades:
    - [ ] Manejo de metadatos del tema.
    - [ ] Manejo de relaciones del tema (ej. subtemas, temas relacionados).

**`AddOrganizacionModal.tsx` / `OrganizacionForm.tsx` (unificar si es posible):**
- (Aplicar Checklist Genérico)
- [ ] Confirm correct Supabase storage folder for organization logos in STORAGE_CONFIG (currently using "organization-logos" as placeholder)
- [ ] Particularidades:
    - [ ] Validación de email y sitio web.
    - [ ] Manejo del campo tipo de organización.
    - [ ] Subida de logo (incluyendo SVGs) y previsualización.
    - [ ] Manejo de información de contacto y ubicación.

**`ProjectForm.tsx`:**
- (Aplicar Checklist Genérico)
- [ ] Particularidades:
    - [ ] Manejo de múltiples archivos adjuntos.
    - [ ] Manejo de relaciones (autores, tutores, temas, organizaciones colaboradoras) usando selectores múltiples o componentes dedicados.
    - [ ] Transiciones de estado del proyecto.
    - [ ] Migrar lógica restante de Firebase.

**`NoticiaForm.tsx`:**
- (Aplicar Checklist Genérico)
- [ ] Particularidades:
    - [ ] Confirmar/crear carpeta correcta en Supabase Storage para imágenes de noticias (actualmente "project-files" es un placeholder, sugerencia: "noticias-images").
    - [ ] Previsualización de imágenes.
    - [ ] Manejo de URLs externas (si aplica).
    - [ ] Selección de temas.
    - [ ] Manejo de fechas de publicación.
    - [ ] Estado de "destacado" y "publicado".

**`EntrevistaForm.tsx`:**
- (Aplicar Checklist Genérico)
- [ ] Particularidades:
    - [ ] Subida de thumbnail y previsualización.
    - [ ] Subida de archivo de transcripción.
    - [ ] Manejo de URLs de video (YouTube, Vimeo, etc.) y archivos de audio/video directos.
    - [ ] Selección de plataforma de video.
    - [ ] Fecha de grabación.
    - [ ] Selección de entrevistados, participantes, temas, organizaciones.
    - [ ] Keywords (podría ser `TEXT[]` o una tabla de tags).
    - [ ] Fuentes de información y recolectores.

---

## ④ Migración de Componentes y Páginas (Consumo de Servicios)

**Checklist Genérico para Migración de Componentes/Páginas:**
*   [ ] Actualizar importaciones de servicios para que apunten a la nueva ruta (`@/lib/supabase/services/XyzService`).
*   [ ] Adaptar el uso de los métodos del servicio a la nueva interfaz (ej. `personasService.getAll()` en lugar de `getPublicEgresadosYEstudiantes()`, si la funcionalidad es la misma pero con un nombre más genérico y parámetros).
*   [ ] Implementar manejo de errores adecuado para las llamadas al servicio.
*   [ ] Asegurar que los datos se obtienen y muestran correctamente.

### Componentes/Páginas Públicas (Aplicar Checklist Genérico):
- [ ] `CreateProjectContent.tsx` (Usa `proyectosService.create`)
- [ ] `EditProjectContent.tsx` (Usa `proyectosService.getById`, `proyectosService.update`)
- [ ] `EgresadosEstudiantesContent.tsx` (Usa `personasService.getAll` con filtros apropiados)
- [ ] `HistoriaOralListContent.tsx` (Usa `entrevistasService.getAll`, `personasService.getById`, `temasService.getAll`)
- [ ] `JobBoardContent.tsx` (Usa `temasService.getAll`, y futuramente un `ofertasLaboralesService`)
- [ ] `NoticiaDetailContent.tsx` (Usa `noticiasService.getById`)
- [ ] `NoticiasListContent.tsx` (Usa `noticiasService.getAll` con filtros de "publicadas")
- [ ] `PersonaDetailContent.tsx` (Usa `personasService.getById`)
- [ ] `ProjectDetailContent.tsx` (Usa `proyectosService.getProjectWithRelations` o similar)
- [ ] `TutorsNetworkContent.tsx` (Usa `personasService.getAll` y `organizacionesService.getAll` con filtros apropiados)

### Páginas de Administración (Aplicar Checklist Genérico):
- [ ] `admin/organizaciones-gestion/editar/[id]/page.tsx` (Usa `organizacionesService.getById`, `organizacionesService.update`)
- [ ] `admin/gestion-temas/nueva/page.tsx` (Usa `temasService.create`)
- [ ] `admin/gestion-temas/editar/[id]/page.tsx` (Usa `temasService.getById`, `temasService.update`)
- [ ] `admin/gestion-noticias/nueva/page.tsx` (Usa `noticiasService.create`)
- [ ] `admin/gestion-noticias/editar/[id]/page.tsx` (Usa `noticiasService.getById`, `noticiasService.update`)
- [ ] `admin/gestion-entrevistas/nueva/page.tsx` (Usa `entrevistasService.create`)
- [ ] `admin/gestion-entrevistas/editar/[id]/page.tsx` (Usa `entrevistasService.getById`, `entrevistasService.update`)

### Componentes de Administración (Aplicar Checklist Genérico):
- [ ] `AdminNoticiaList.tsx` (Usa `noticiasService.getAll` (admin version), `noticiasService.delete` (logical), `noticiasService.restore`)
- [ ] `AdminOrganizacionList.tsx` (Usa `organizacionesService.getAll` (admin version), `organizacionesService.delete` (logical), `organizacionesService.restore`)
- [ ] `AdminTemaList.tsx` (Usa `temasService.getAll` (admin version), `temasService.delete` (logical), `temasService.restore`)
- [ ] `AdminEntrevistaList.tsx` (Usa `entrevistasService.getAll` (admin version), `entrevistasService.delete` (logical), `entrevistasService.restore`)

---

## TODOs

## Service Methods

### PersonasService
- [ ] Add `getByIds(ids: string[]): Promise<ServiceResult<Persona[]>>` method to retrieve multiple persons by their IDs
- [ ] Add `search(term: string): Promise<ServiceResult<Persona[]>>` method to search persons
- [ ] Update type conversion in `getById` to properly map database fields to domain model:
  - [ ] Map `foto_url` to `fotoURL`
  - [ ] Map `categoria_principal` to `categoriaPrincipal`
  - [ ] Map `es_admin` to `esAdmin`
  - [ ] Map `esta_eliminado` to `activo`
  - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
  - [ ] Map `eliminado_en` to `eliminadoEn`
  - [ ] Map `created_at` to `creadoEn`
  - [ ] Map `updated_at` to `actualizadoEn`

### OrganizacionesService
- [ ] Add `getByIds(ids: string[]): Promise<ServiceResult<Organizacion[]>>` method to retrieve multiple organizations by their IDs
- [ ] Add `search(term: string): Promise<ServiceResult<Organizacion[]>>` method to search organizations
- [ ] Update type conversion in `getById` to properly map database fields to domain model:
  - [ ] Map `nombre` to `nombreOficial`
  - [ ] Map `logo_url` to `logoURL`
  - [ ] Map `sitio_web` to `sitioWeb`
  - [ ] Map `esta_eliminada` to `estaEliminada`
  - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
  - [ ] Map `eliminado_en` to `eliminadoEn`
  - [ ] Map `created_at` to `creadoEn`
  - [ ] Map `updated_at` to `actualizadoEn`

### TemasService
- [ ] Add `getByIds(ids: string[]): Promise<ServiceResult<Tema[]>>` method to retrieve multiple themes by their IDs
- [ ] Add `getAllActivos(): Promise<ServiceResult<Tema[]>>` method to retrieve all active themes
- [ ] Update type conversion in `getById` to properly map database fields to domain model:
  - [ ] Map `esta_eliminado` to `estaEliminado`
  - [ ] Map `eliminado_por_uid` to `eliminadoPorUid`
  - [ ] Map `eliminado_en` to `eliminadoEn`
  - [ ] Map `created_at` to `creadoEn`
  - [ ] Map `updated_at` to `actualizadoEn`

### CursosService
- [ ] Create `cursosService.ts` with the following methods:
  - [ ] `getAll(): Promise<ServiceResult<Curso[]>>` - To retrieve all courses
  - [ ] `getById(id: string): Promise<ServiceResult<Curso>>` - To retrieve a course by ID
  - [ ] `search(term: string): Promise<ServiceResult<Curso[]>>` - To search courses by term
  - [ ] `getByNivel(nivel: NivelCurso): Promise<ServiceResult<Curso[]>>` - To get courses by level
  - [ ] `getByTema(tema: string): Promise<ServiceResult<Curso[]>>` - To get courses by topic

## Type Definitions
- [ ] Export `RolInstitucional` type from `@/lib/types`
- [ ] Export `ServiceResult` type from `@/lib/supabase/services/baseService`

---