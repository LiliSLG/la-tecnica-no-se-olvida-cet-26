# Changelog

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
