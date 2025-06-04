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
  personas, proyectos, organizaciones, temas, noticias, entrevistas, etc.
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