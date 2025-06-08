# App Name: La técnica no se olvida

## Core Features (Current / In Progress / Mocked on Web)

- **Project Intro:**  
  A landing page that describes the goals and scope of the project: the preservation of rural knowledge and technical projects from the students of the CET N°26 of Ingeniero Jacobacci.

- **Project Catalog:**  
  Organizes student technical projects in a clear, filterable manner (by year/topic/etc.). Publicly viewable list, with more details potentially requiring login.

- **Oral History Archive:**  
  Presents interviews (video, audio, transcriptions) with rural families and local knowledge holders.

- **News & Updates Section:**  
  Allows admins to post news about the CET, the platform, or relevant community events.

- **Community Network Pages:**  
    - **Red de Tutores y Acompañantes:** Showcasing individuals and organizations offering support to student projects.  
    - **Red de Egresados CET 26 y Estudiantes:** Highlighting alumni trajectories and current student talent, fostering connections and opportunities.

- **Admin Panel:**  
  Allows authorized users (admins, content managers) to manage all platform content: personas (participants), organizations, projects, news, interviews, and topics.

- **AI-powered Knowledge Base (Future - Concept Page Implemented):**  
  Enables users to ask freeform questions based on the platform's indexed content (projects, interviews, news), with the AI retrieving and presenting relevant information.  
  **AI as a Supportive Tool:** The AI component is envisioned as a transversal support across the platform. Its goal is not to replace the richness of community knowledge and human expertise, but to facilitate access, discovery, and learning based on the collective wisdom captured in the projects, interviews, and community contributions.

## Future Features (Vision / Planned / Mocked)

- **Courses & Trainings:**  
  Highlight and catalog training opportunities offered by CET, local organizations, and community partners.  
  A mock version is currently present on the home page to illustrate potential functionality.

- **Job Board (Bolsa de Trabajo):**  
  Provide a space for internships, freelance projects, and job opportunities aligned with the technical focus areas of CET students and graduates.  
  (Planned feature, could connect with Red de Egresados & local employers.)

- **Interactive Maps:**  
  Enable visualization of locations connected to projects, interviews, and collaborating organizations.  
  Example applications:  
    - Map of project implementation sites (e.g., fields, facilities, communities).  
    - Map on individual project pages showing application locations.  
    - Map of collaborating organizations and their geographic reach.

## Tech Stack (Supabase Version)

- **Frontend:** Next.js (App Router) with React and TypeScript.
- **Styling:** Tailwind CSS with Shadcn UI components.
- **Backend Services & Database:** **Supabase**  
    - **Database:** PostgreSQL (fully relational model).  
    - **Authentication:** Supabase Auth (Email/Password, Google Sign-In, etc.).  
    - **Storage:** Supabase Storage (for images, documents, PDFs, video/audio files).  
    - **Serverless Functions:** Supabase Edge Functions (Deno-based, for automated backend logic, data consistency, AI processing).

- **AI (Content Query - Future):**  
  Planned integration with a RAG-based system. This could involve:  
    - Using PostgreSQL extensions like pgvector for vector embeddings.  
    - Supabase Edge Functions orchestrating calls to embedding models (e.g., OpenAI, Sentence Transformers via a Deno-compatible library) and LLMs (e.g., Google Gemini, OpenAI GPT).

## Data Model Approach (PostgreSQL with Supabase)

- The application utilizes a **fully relational model** implemented in PostgreSQL, managed via Supabase.
- **Tables** defined for:  
  personas, proyectos, organizaciones, temas, noticias, historias_orales, etc.
- **Relationships** (one-to-many, many-to-many) established via foreign keys and junction tables:  
  Example: proyecto_autores junction table for M:N relationship between proyectos and personas acting as authors.
- **Data types:** PostgreSQL types used include:  
  TEXT, VARCHAR, INTEGER, BOOLEAN, TIMESTAMP WITH TIME ZONE, UUID (for primary keys), JSONB (for flexible fields if necessary), ARRAY types, and potentially vector (from pgvector for AI).
- **Data integrity and consistency:** enforced through database constraints (primary keys, foreign keys, NOT NULL, CHECK constraints), and potentially database triggers or Supabase Edge Functions.
- **Row Level Security (RLS):** primary mechanism for controlling data access permissions.

## Style Guidelines

- **Primary color:** Muted violet (#A994D9), representing creativity and wisdom, aligned with education.
- **Background color:** Very light blue (#EBF4FA), creating a calming and trustworthy base.
- **Accent color:** Desaturated green (#98D9A2), evoking the rural origins of the technical school and matching the CET N°26 logo.
- **Typography:** Clean, readable sans-serif fonts.
- **Icons:** Simple and illustrative, reflecting both technical and rural aspects of the content (e.g., Lucid Icons).
- **Layout:** Clear, structured layout with intuitive navigation. Responsive design is critical.

## Theme / Design System
- The project uses Tailwind CSS utility-first styling.
- Global theme (colors, typography) will be defined in Tailwind config.
- Components will be built with consistent design tokens.
- Existing utility classes (flex, spacing) are compatible with this system.


## UX / Design
- **Modern & Clean**: Use a modern, minimalist design that reflects the technical nature of the project.
- **Consistency**: Maintain a coherent color palette and style throughout the application.
- **Accessibility**: Ensure the application is accessible to all users, following WCAG 2.1.
- **Responsive Design**:
  - The application must be fully responsive and usable on mobile devices.
  - All screens must adapt to different screen sizes.
  - Public pages must be fully functional on mobile.
  - Admin pages may have simplified layouts on mobile, maintaining essential functionality.
- **Visual Feedback**: Provide clear feedback for all user actions.
- **Intuitive Navigation**: Clear and easy-to-understand structure.


## Design Considerations & Project Philosophy

- **Sustainability & Maintainability:**  
  The system is designed to be content-manageable through the Admin Panel by authorized CET personnel (teachers, students with roles), while the platform's structure and codebase are maintained by the development team.

- **User-Centricity:**  
  Data structure and UX must prioritize clarity and accessibility, especially for non-technical users contributing or consuming content.

- **Community & Legacy:**  
  The platform should showcase student work while preserving and honoring local rural knowledge, fostering intergenerational connections.

- **AI as a Supportive Tool:**  
  The AI component is envisioned as a transversal support across the platform. Its goal is not to replace the richness of community knowledge and human expertise, but to facilitate access, discovery, and learning based on the collective wisdom captured in the projects, interviews, and community contributions.

- **Flexibility:**  
  Content curation, roles, and platform features may evolve; the system should be adaptable.

- **Collaboration:**  
  The platform itself is a collaborative effort in terms of content — fostering collaboration within the CET community and its surroundings — while the platform structure and codebase remain under the control of the development team.

  ---

# 📘 Architecture Notes

## UI Patterns and Layout Conventions

### Admin Sidebar Pattern
The Admin Panel uses a **Sidebar-based layout** as the default navigation pattern:
- On desktop: persistent Sidebar is shown.
- On mobile: Sidebar collapses into a drawer menu for better usability.
- This layout is applied consistently across all `/admin/*` pages.
- The Sidebar contains global admin navigation, while page-level actions are placed within the main content area.

### AdminDataTable Pattern
For displaying and managing lists of entities in the Admin Panel, the project uses a **standardized AdminDataTable component**:
- Provides consistent UI and UX across entity management screens.
- Includes built-in support for:
  - Search
  - Sorting
  - Filtering
  - Pagination
  - Custom column rendering
  - Empty state handling
  - Loading state
  - Error state
- All new Admin CRUD pages must use AdminDataTable as the base table component.
- Existing legacy tables should be migrated to this pattern as part of ongoing refactors (see `docs/todos.md`).

## /lib/supabase/ Structure and Service Pattern

This section documents the current architecture and conventions for the `/lib/supabase/` folder and service layer.

### ✅ Folder structure

```
/lib/supabase/
├── supabaseClient.ts
├── supabaseStorage.ts
├── storageMigration.ts
├── schema.sql
├── rls_policies.sql
├── indexes.sql
├── services/
│   ├── authService.ts
│   ├── historiasOralesService.ts
│   ├── noticiasService.ts
│   ├── organizacionesService.ts
│   ├── temasService.ts
│   ├── personasService.ts
│   ├── proyectosService.ts
│   ├── relationshipService.ts
│   └── (any other BaseService-based service)
├── errors/
│   ├── types.ts
│   ├── utils.ts
├── types/
│   ├── database.types.ts
│   ├── service.ts
│   ├── serviceResult.ts
│   └── (any other shared type)
├── scripts/
│   ├── migrations/
│   │   ├── baseMigration.ts
│   │   ├── dataTransformer.ts
│   │   ├── firebaseExtractor.ts
│   │   ├── migrateData.ts
│   │   └── (etc.)
│   ├── extractFirebaseUsers.ts
│   ├── migrateUsers.ts
└── __tests__/
    ├── (unit tests for services)
```

### ✅ Service usage pattern

#### Singleton pattern

Each service exports a singleton instance:

```typescript
import PersonasService from './personasService';
export const personasService = new PersonasService();
export default personasService;
```

#### Usage in components

```typescript
import personasService from '@/lib/supabase/services/personasService';

const personas = await personasService.getAll();
const persona = await personasService.getById(id);
await personasService.create(data);
await personasService.update(id, data);
await personasService.delete(id);
```

### ❌ Prohibited patterns

- No direct `from('table')` calls in components.
- No usage of legacy function-based API (e.g. `getAllTemas()`).
- No service files outside `/services/`.
- No duplicate `types.ts` or `utils.ts` in `/supabase/`.

### 📝 Migration status

- ✅ Architecture cleaned and committed.
- 🔄 Forms and Sections: In progress (see `/docs/todos.md`).

## Service Architecture
- All services now follow the updated BaseService pattern.
- No services override base method signatures (getById, getAll, create, update, delete).
- For mapped data, services provide parallel methods (e.g., getByIdMapped, getAllMapped).
- Error handling is fully standardized using createSuccess and createError from service.ts.
- Services are now safe to consume in the new frontend.

### BaseService
The `BaseService` class provides a foundation for all services in the application. It handles:
- Supabase client initialization
- Common CRUD operations
- Error handling
- Type safety
- Field mapping between database and domain models

### CacheableService
The `CacheableService` extends `BaseService` to add caching capabilities:
- In-memory caching for frequently accessed data
- Automatic cache invalidation on updates
- Configurable cache TTL (Time To Live)
- Cache key management
- Cache hit/miss tracking

Usage:
```typescript
class MyService extends CacheableService<MyType> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'my_table', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000 // Maximum number of items in cache
    });
  }
}
```

### ServiceResult
The `ServiceResult` type standardizes service responses:
```typescript
type ServiceResult<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  } | null;
};
```

Usage:
- All service methods should return `Promise<ServiceResult<T>>`
- `data` is null when operation fails
- `error` is null when operation succeeds
- Provides consistent error handling across the application


## Authentication

The authentication system follows this architecture:

- **authService.ts**: Provides core authentication methods (signIn, signUp, signOut, getCurrentUser, resetPassword, updatePassword). Uses the Supabase client.
- **AuthProvider.tsx**: React context provider that manages session state (session, user, loading, signIn, signOut). Listens to Supabase auth state changes. Wraps the app so that authentication state is accessible to all components.
- **/middleware.ts**: Protects `/admin/*` routes by redirecting unauthenticated users to `/login`. Redirects authenticated users away from `/login` to `/admin`.
- **/app/login/page.tsx**: Provides a login form (email/password) with error handling and redirection.

Session persistence is handled by Supabase's built-in localStorage mechanism. The AuthProvider listens to changes and keeps the React app state in sync.

The current system supports basic email/password login and route protection. Future improvements (such as role-based access control or OAuth) should extend this architecture and be documented here.
Note on Supabase Client:

In order to ensure compatibility with Next.js 15 App Router and Client Components, we use `createBrowserClient` from `@supabase/ssr` in `supabaseClient.ts`. This prevents compatibility issues (such as the known `@supabase/node-fetch` error) when using `supabaseClient` in components like `AuthProvider.tsx`. This approach follows Supabase's official recommendations for Next.js App Router. The architecture maintains a single shared instance of the Supabase client for use in all services.


## Cache & Frontend-safe Services

- `BaseService` is the base class for services that are safe to use in the frontend (app router, admin pages, public pages).
- `CacheableService` extends `BaseService` and adds Redis-based caching functionality. It must only be used in the backend (API routes, server components).
- Services that are used in the frontend (such as `PersonasService`, `ProyectosService`, etc.) must extend only `BaseService`, to avoid introducing Redis or Node.js-only modules (such as `dns`) into the frontend bundle.
- The separation between `BaseService` and `CacheableService` is required to ensure the frontend builds and runs correctly in the browser.


The application uses Supabase Authentication with the following architecture:

- `authService.ts`: Main authentication service that handles:
  - User sign in/up
  - Password management
  - Session handling
  - User profile integration with PersonasService
  - Error handling and type safety

The service follows the standard service architecture pattern and integrates with the user profile system through PersonasService.

