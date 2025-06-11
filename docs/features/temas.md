# Feature: Topics (Temas)

## What does this feature do?
This feature manages the "Topics" (Temas), which form the central taxonomy of the application. Topics are used as a transversal axis to categorize and connect all other major entities, such as People, Projects, Oral Histories, and News.

## Entities Involved
- **Primary Table:** `temas`
- **Junction Tables (Relationships):**
  - `persona_tema`
  - `proyecto_tema`
  - `historia_oral_tema`
  - `noticia_tema`

## Main Use Cases
- **Admin Users:**
  - Perform full CRUD (Create, Read, Update, Delete) operations on topics through a dedicated admin page (`/admin/temas`).
  - The admin view uses the `AdminDataTable` component, which supports searching, sorting, and filtering (including viewing soft-deleted items).
  - Creation and editing are handled through a modal form with Zod validation.
  - Deletion is a soft-delete operation with a confirmation dialog.
- **Public Users:**
  - View a public detail page for each topic at `/temas/[id]`.
  - The detail page displays the topic's information and lists all related (and published) People and Projects.
  - Can filter content across the site using topics.

## Special Flows
- **Virtual "Actions" Column:** The admin data table includes a virtual column for "Actions" (View, Edit, Delete) that is not tied to a database field.
- **Client-Side State Management:** The admin page loads all topics (including deleted ones) initially, and all filtering/sorting is handled client-side by the `useDataTableState` hook for a fast user experience.

## Chatbot Considerations
The chatbot should be able to answer questions like:
- "List all available topics."
- "What is the 'Agroecology' topic about?"
- "What projects are related to the 'Renewable Energy' topic?"
- "Which people are experts in the 'Soil Management' topic?"

## Current Status: ✅ Completed
- The backend service (`temasService`) is fully implemented with a standalone, explicit architecture.
- The admin page (`/admin/temas`) is fully functional with complete CRUD capabilities.
- The public detail page (`/temas/[id]`) is functional and displays related entities.
- The navigation flow between the admin panel and the public page is complete.
- This module is considered the gold standard for future admin modules. 