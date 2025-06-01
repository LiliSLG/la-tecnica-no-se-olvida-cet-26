# Current Data Schemas — as of 2024-05-31

## personas
- Core table for all users/persons in the system.
- Includes special fields for CET alumni (may later be normalized).
- Uses enums, arrays and jsonb.
- Relationships:
    - persona_tema (N:M with temas)

## temas
- Simple table of themes/categories.
- Used in multiple entities.

## organizaciones
- Table of organizations.
- Uses jsonb for location.

## noticias
- Articles and external links.
- Relationship:
    - noticia_tema (N:M with temas)

## entrevistas
- Interviews (oral history archive).
- Uses enums and arrays.
- Relationships:
    - entrevista_tema (N:M with temas)

## proyectos
- Student projects.
- Main entity.
- Relationships:
    - proyecto_tema
    - proyecto_autor
    - proyecto_tutor
    - proyecto_colaborador
    - proyecto_organizacion_tutoria
    - proyecto_entrevista
    - proyecto_archivo (replaces previous `archivosAdjuntos` array)

## Tables N:M
- persona_tema
- noticia_tema
- entrevista_tema
- proyecto_tema
- proyecto_autor
- proyecto_tutor
- proyecto_colaborador
- proyecto_organizacion_tutoria
- proyecto_entrevista

## Notes:
- All tables include created/updated timestamps and logical deletion (`estaEliminada`).
- Storage is done using Supabase Storage (buckets), URLs are stored in tables.
