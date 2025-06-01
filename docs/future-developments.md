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

## === Completed Items ===

- Initial migration of core data model from Firebase Firestore to Supabase Postgres relational schema.
- Full creation of core tables: `personas`, `temas`, `organizaciones`, `noticias`, `entrevistas`, `proyectos`.
- Creation of all N:M relationship tables for projects, persons, interviews, and news.
- Replacement of `archivosAdjuntos` array in projects with relational table `proyecto_archivo`.
- Initial CRUD in Admin Panel for `personas`, `organizaciones`, `proyectos`, `noticias`, `entrevistas`.
- Basic public listing pages for `proyectos`, `noticias`, `entrevistas`, "Red de Tutores", "Red de Egresados".
- Logical delete implemented for all major tables (`estaEliminada`).
- Supabase Storage in place to replace Firebase Storage for `fotoURL`, `logoURL`, `archivoPrincipalURL`, etc.

