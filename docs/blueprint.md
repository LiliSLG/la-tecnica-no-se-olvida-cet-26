# **App Name**: La técnica no se olvida

## Core Features:

- **Project Intro:** A landing page that describes the goals and scope of the project: the preservation of rural knowledge and technical projects from the students of the CET N°26 of Ingeniero Jacobacci.
- **Project Catalog:** Organizes student technical projects in a clear, filterable manner (by year/topic). Requires users to log in to view the projects.
- **Oral History Archive:** Presents interviews (text, audio, video) with rural families and local knowledge holders.
- **Documentation:** Provides instructions on usage, documentation, and maintenance for future students and teachers.
- **AI-powered Knowledge Base:** Enables user login, then responds to freeform questions based on project information and documentation. The AI identifies whether available documentation contains an answer and presents it to the user.
- **Admin Panel:** Allows authorized users to manage personas, organizations, projects, news, interviews.
- **Rural Community Visibility:** Highlights the role of the CET in the local rural context and fosters intergenerational knowledge sharing.

## Tech Stack:

- **Frontend:** Next.js + React
- **Backend:** Supabase (Postgres + Storage + Auth)
- **Database:** Fully relational model with N:M relations, using enums, arrays, jsonb where appropriate.
- **Storage:** Supabase Storage for images, documents, videos.
- **AI:** Planned future integration with RAG-based system over Postgres + Storage.
- **Auth:** Supabase Auth (email-based, possibly extendable to OAuth).

## Backend

- La app ahora utiliza Supabase (Postgres SQL) como base de datos.
- Las tablas relacionales (many-to-many) fueron creadas para soportar las relaciones entre proyectos, personas, temas, entrevistas y noticias.


## Style Guidelines:

- **Primary color:** Muted violet (#A994D9), representing creativity and wisdom, aligned with education.
- **Background color:** Very light blue (#EBF4FA), creating a calming and trustworthy base.
- **Accent color:** Desaturated green (#98D9A2), evoking the rural origins of the technical school and matching the CET N°26 logo.
- **Typography:** Clean, readable sans-serif fonts.
- **Icons:** Simple and illustrative, reflecting both technical and rural aspects of the content.
- **Layout:** Clear, structured layout with intuitive navigation.

## Design Considerations:

- The system should remain easy to maintain and evolve by future CET students and teachers.
- Data structure and UX must prioritize clarity and accessibility for non-technical users.
- The platform should showcase student work while preserving and honoring local rural knowledge.
- Content curation and editorial roles may evolve — the system must be flexible to accommodate this.

