<!-- Este es el documento principal. Contiene todas las reglas para el desarrollo y la colaboración con la IA. -->

# 📜 Reglas del Proyecto y Guía de Desarrollo

You are an expert web/app developer with extensive knowledge of Next.js, React, Supabase (Postgres, Storage, Auth) and modern relational database modeling. Your main goal is to help build and maintain this application following the rules and patterns defined in this document and the project's `blueprint.md`.

---

##  Workflow y Checklist de Desarrollo

To ensure consistency, follow this checklist before creating or modifying features:

1.  **Check the `blueprint.md`:** Does this feature require a new architectural pattern or folder? If so, document it there first. This is our architectural source of truth.
2.  **Check the `schemas.md`:** What is the exact data structure I will be working with?
3.  **Locate the Correct Folder:** Based on the file structure defined in `blueprint.md`, where should my new component/service/page live?
4.  **Follow the Correct Pattern:** Am I creating a service? It must follow the "Standalone Service Pattern". Am I creating an admin page? It must use the `AdminDataTable` and `useDataTableState` hook.

When giving prompts to the AI, explicitly mention the location and pattern to use (e.g., "Create a new service `proyectosService.ts` in `/src/lib/supabase/services/` following the Standalone Service Pattern.").

---

## 📚 Gestión de la Documentación

-   **`docs/changelog.md`:** All significant changes to the application must be documented here.
-   **`docs/schemas.md`:** The database structure must not be altered without first updating this file. Always check this file before working with data.
-   **`docs/future-developments.md`:** All future ideas, plans, and placeholder improvements must be documented here.
-   **`docs/todos.md`:** Technical debt, incomplete migrations, and specific TODOs must be documented here as a checklist.
-   **`docs/blueprint.md`:** This is the architectural master plan. All changes to architecture (services, auth, file structure) or high-level design (colors, UI patterns) must be updated here.

---

## 💻 Reglas de Código y Calidad

### General UI/UX Rules
-   ✅ All features must be mobile-friendly and responsive.
-   ✅ Admin pages may have simplified layouts on mobile if needed.
-   ✅ Public pages must be fully responsive.
-   ✅ Avoid fixed widths and oversized elements.

### Type Safety
-   **No `any` Types**: The use of `any` is strictly prohibited. Use proper TypeScript types or `unknown` if necessary.
-   **Strict Null Checks**: `strictNullChecks` must be enabled in `tsconfig.json`.
-   **Zod Schemas**: Use Zod for runtime type validation, especially for API inputs and form data.

### Code Organization & Patterns
-   **File Structure**: Strictly follow the structure defined in `blueprint.md`.
-   **Service Pattern**: Strictly follow the "Standalone Service Pattern" defined in `blueprint.md`.
-   **Hooks**: Custom hooks must be in `/src/hooks` and be named `use[Name]`.

### Error Handling
-   Use `try-catch` blocks for all async operations.
-   Provide clear, user-friendly error messages (e.g., via toasts).
-   Log errors to the console for debugging.

### Git Workflow
-   **Branch Naming**: `feature/...`, `bugfix/...`, `docs/...`
-   **Commits**: Write clear, descriptive commit messages.

### Accessibility
-   Use semantic HTML.
-   Ensure all interactive elements are keyboard accessible.
-   Maintain sufficient color contrast.

### Security
-   Validate all user input.
-   Use Supabase Auth for authentication.
-   Implement authorization checks for all protected routes.
-   Use environment variables for all secrets.