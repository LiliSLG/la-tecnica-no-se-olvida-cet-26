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
