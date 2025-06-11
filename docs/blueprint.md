<!-- This is the project's master plan. It defines the WHAT and WHERE, but not the HOW (rules are in /rules.md) -->

# 🏗️ Project Blueprint: La Técnica no se Olvida

## 🎯 Overview

Digital platform for preserving and disseminating rural knowledge and technical projects of CET N°26 students from Ingeniero Jacobacci.

## 🎯 Core Features

### Project Catalog
- Comprehensive project database with detailed information
- Integration of technical analyses, such as satellite data monitoring (NDVI)
- Project relationships and dependencies tracking
- File attachments and documentation management

---

## 🛠️ Tech Stack & Architecture

-   **Frontend:** Next.js (App Router) with React and TypeScript.
-   **Styling:** Tailwind CSS with `shadcn/ui` components.
-   **Backend & Database:** **Supabase**
    -   **Database:** PostgreSQL (relational model).
    -   **Authentication:** Supabase Auth.
    -   **Storage:** Supabase Storage.
    -   **Serverless Functions:** Supabase Edge Functions.

---

## 🗂️ Folder Structure

This is the standard folder structure for the project. All new files must be created in their corresponding directory.

-   **/src/app/**: Pages and layouts (App Router).
    -   **/admin/**: Admin panel pages (e.g., `/admin/temas`).
    -   **/api/**: API routes.
    -   **/(public)/**: Grouping for public pages (e.g., `/temas`, `/proyectos`).
-   **/src/components/**: Reusable UI components.
    -   **/admin/**: Admin-specific components (e.g., `AdminDataTable`).
    -   **/common/**: Components shared across the app (e.g., `BackButton`).
    -   **/ui/**: `shadcn/ui` components.
-   **/src/hooks/**: Reusable React hooks (e.g., `useDataTableState`). **This is the only folder for hooks.**
-   **/src/lib/**: Low-level logic, utilities, and integrations.
    -   **/supabase/**: All Supabase-related code.
        -   **/services/**: **The only location for database services.**
-   **/src/providers/**: React Context providers (e.g., `AuthProvider`).
-   **/docs/**: Project documentation.

---

## 🏛️ Architectural Patterns

### "Standalone" Service Pattern
After a complete refactoring, the project uses an explicit, inheritance-free service pattern. All new entity services (e.g., `proyectosService`, `noticiasService`) **must** follow these rules:
-   **No Inheritance:** They are `standalone` classes that don't extend any base class.
-   **Explicit Methods:** They implement their own `create`, `update`, `getById`, `getAll`, and `delete`.
-   **Local Types:** They define their types (`Row`, `Insert`, `Update`) at the beginning of the file, imported from `database.types.ts`.
-   **Singleton Export:** The file exports a single instance of the service (e.g., `export const temasService = new TemasService();`).
-   **Location:** `/src/lib/supabase/services/`.

### UI Patterns
-   **Admin Sidebar Pattern:** The admin panel uses a layout with a persistent sidebar on desktop and collapsible on mobile.
-   **AdminDataTable Pattern:** All data management lists in the admin must use the reusable `AdminDataTable` component, powered by the `useDataTableState` hook.

---

## 🎨 Style and Design Guide

-   **Primary Color:** Muted violet (`#A994D9`). Represents creativity and wisdom.
-   **Background Color:** Very light blue (`#EBF4FA`). Creates a calm and reliable base.
-   **Accent Color:** Desaturated green (`#98D9A2`). Evokes rural origins.
-   **Typography:** Clean and readable sans-serif fonts.
-   **Icons:** Simple and illustrative (`lucide-react`).
-   **Layout:** Clear, clean, and always responsive structure.

### UX Principles
-   **Modern and Clean**: Use a modern and minimalist design that reflects the technical nature of the project.
-   **Consistency**: Maintain a coherent color palette and styles throughout the application.
-   **Accessibility**: Ensure the application is accessible to all users, following WCAG 2.1.
-   **Responsive Design**: The application must be fully functional and usable on mobile devices.
-   **Visual Feedback**: Provide clear feedback for all user actions.
-   **Intuitive Navigation**: Clear and easy-to-understand structure.