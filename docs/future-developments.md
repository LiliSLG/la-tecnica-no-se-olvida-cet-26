# Future Developments and Improvements

## Pending / To Do
- [ ] **Cloud Functions for Role Automation:** Implement Cloud Functions to automatically update `Persona.capacidadesPlataforma` (e.g., 'es_autor', 'es_tutor') based on a person's actual involvement in projects (added/removed from `Proyecto.idsAutores`, `Proyecto.idsTutoresPersonas`, etc.).
- [ ] **Detailed Profile Page (`/comunidad/perfil/[personaId]`):** Fully implement fine-grained content visibility based on `Persona.visibilidadPerfil` and the viewing user's status/role. Implement the "Proyectos Destacados" section.
- [ ] **Advanced Filters:** Enhance public list pages (Projects, News, Interviews, Alumni Network) with more advanced filtering capabilities.
- [ ] **Social Interaction Features:** Consider adding "Like", "Share", and "Comments" functionalities to Projects and News.
- [ ] **Rich Text Editor:** Implement a rich text editor (Markdown or WYSIWYG) for `Noticia.contenido` and potentially for long description fields.
- [ ] **Job Board / Opportunities Section:** Develop the "Bolsa de Trabajo" functionality.
- [ ] **AI-Powered Search/QA:** Implement the RAG-based AI query system for platform content.
- [ ] **Debouncing:** Ensure all autocomplete/search inputs use debouncing for performance.
- [ ] **File Deletion from Storage:** Implement logic (likely Cloud Functions) to delete associated files from Firebase Storage when a `fotoURL`, `logoURL`, `archivoPrincipalURL`, etc., is removed from a Firestore document or the document itself is permanently deleted.
- [ ] **Image Optimization:** Consider client-side or server-side image optimization for uploads.
- [ ] **User Onboarding/Profile Completion Flow:** Guide new users (especially those invited पाणी_placeholder) to complete their profiles.
- [ ] **Map Integration:** For `ubicacion` fields with `GeoPoint`, consider displaying a map.

## Mocked or Placeholder Sections to Make Functional
- [ ] "Consultas IA" page: Currently an introductory page, will need to be a functional chat interface.
- [ ] "Estadísticas" in Admin Panel.
- [ ] "Configuración General" in Admin Panel.
- [ ] Placeholder "Ver Perfil Completo" buttons should all lead to the functional profile page.

## === Completed Items ===
- (Move items here as they are completed by the AI or you)
- Initial CRUD for `personas` (now `participantes`), `organizaciones`, `proyectos`, `noticias`, `entrevistas` in Admin Panel.
- Basic public listing pages for `proyectos`, `noticias`, `entrevistas`, "Red de Tutores", "Red de Egresados".
- Image upload to Firebase Storage for `Persona.fotoURL` and `Organizacion.logoURL`.
- Logical delete implemented for major collections.