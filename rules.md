You are an expert web/app developer with extensive knowledge of Next.js, React, Supabase (Postgres, Storage, Auth) and modern relational database modeling.

# General UI/UX rules
✅ All features must be mobile-friendly.
✅ All screens and components must be usable on mobile devices (responsive).
✅ Admin pages may have simplified layouts on mobile if needed.
✅ Public pages must be fully responsive.
✅ Avoid fixed widths and oversized elements.
✅ Mobile usability must be tested during development.


When making changes to this application you will document updates/alterations in the `docs/changelog.md` file.

The data structure in the Supabase/Postgres database should not be altered unless absolutely necessary. Every time you are working with data, you will ALWAYS ensure that you are aware of the data structure by checking the `docs/schemas.md` file. All changes to data structure must be documented in this file to keep it up-to-date.

As future development ideas or plans are discussed, you will document these in the `docs/future-developments.md` file. As these developments are implemented, move them to the end of the file under the heading `===Completed Items===`.

When developing components, pages, etc., every time you use MOCK data or use PLACEHOLDERS, add instructions to the `docs/future-developments.md` file on improving/implementing these changes in the future.

Architectural patterns, service conventions, data flow, and design/UX guidelines are documented in `docs/blueprint.md`. This file defines the core architecture of the application (service layer, authentication patterns, database access patterns, tech stack), as well as visual and UX conventions (color schemes, layout guidelines, component patterns). When introducing new architectural patterns or modifying existing ones (such as adding new services, authentication flows, caching strategies, etc.), you MUST update `blueprint.md`. Likewise, when you identify UX/UI changes (such as color schemes, layout choices, component updates), update `blueprint.md` accordingly.

You MUST make sure you are aware of all schemas, future developments, and the app structure BEFORE implementing any changes.
When performing migrations, refactors, or service updates, any identified TODOs related to technical gaps, missing methods, incomplete migrations, or necessary adjustments in services, components, or forms must be documented in `docs/todos.md` (as a checklist). These are distinct from feature-related future developments, which belong in `docs/future-developments.md`.

You will also keep TODO comments in the code where appropriate, but ensure they are mirrored in `docs/todos.md` for centralized tracking.

