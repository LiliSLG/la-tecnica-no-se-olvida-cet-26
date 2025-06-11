# Feature: Projects (Proyectos)

## What does this feature do?
This feature enables the complete management of technical projects developed at CET N°26. This includes their creation, editing, cataloging, and public display. It is one of the central features of the platform, designed to preserve and showcase the work of students.

## Entities Involved
- **Primary Tables:**
  - `proyectos`: Stores all core information for each project.
- **Junction Tables:**
  - `proyecto_tema`: Links projects with one or more knowledge topics.
  - `proyecto_persona_rol`: Assigns people (authors, tutors, etc.) to a project with a specific role.
  - `proyecto_organizacion_rol`: Assigns organizations to a project with a specific role.
  - `proyecto_relaciones`: Links a project with other projects, defining a directional relationship (e.g., "improves", "continues").
  - `proyecto_archivo`: Stores additional files associated with a project.
  - `proyecto_historia_oral`: Links a project with an oral history archive record.

## Main Use Cases
- **Admin Users:**
  - Create, read, update, and delete projects (CRUD).
  - Assign topics, authors, tutors, and organizations to a project.
  - Upload attachments to a project.
  - Relate a project with other existing projects on the platform.
- **Public Users:**
  - View a list of all published projects.
  - Filter projects by year, topic, or keyword.
  - View a project's detail page, including its description, authors, tutors, files, and related projects.

## Special Flows
- **Project Relationships:** The system allows creating a knowledge graph by linking projects. A relationship is directional (Project B "improves" Project A) and is described with a type and explanatory text. The public interface must be able to show these relationships in both directions ("Based on..." and "Referenced by...").
- **Person Creation from Form:** If an author or tutor doesn't exist, the project form must allow quick creation (through a modal) without leaving the main flow.

## Chatbot Considerations
The chatbot should be able to answer questions like:
- "What are the projects from 2023?"
- "Show me projects related to 'renewable energy'."
- "Search for the project about 'automated greenhouses'."
- "Who were the authors of the 'Automated Greenhouse' project?"
- "What projects are a continuation of the 'Agricultural Drone Design' project?"

## Current Status
- **Backend:** The database schema is fully defined, including relationship logic. Supabase services need to be reviewed and completed.
- **Frontend:** The admin panel for project CRUD and the public listing/detail pages are pending development in the new frontend version.