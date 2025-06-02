# Base de datos Supabase

## Tablas principales

### personas
- id (UUID, PK)
- nombre, apellido, email, fotoURL, categoriaPrincipal, capacidadesPlataforma (array), ...
- ingresadoPor, creadoEn, modificadoPor, actualizadoEn, estaEliminada, eliminadoPorUid, eliminadoEn

### proyectos
- id (UUID, PK)
- titulo, descripcionGeneral, resumenEjecutivo, estadoActual, ...
- creadoPorUid, actualizadoPorUid, creadoEn, actualizadoEn, estaEliminado, eliminadoPorUid, eliminadoEn

### entrevistas
- id (UUID, PK)
- tipoContenido, tituloSaber, descripcionSaber, ...
- creadoPorUid, actualizadoEn, estaPublicada, estaEliminada

### noticias
- id (UUID, PK)
- tipoContenido, titulo, contenido/urlExterna, ...
- creadoPorUid, actualizadoEn, estaPublicada, esDestacada, estaEliminada

### organizaciones
- id (UUID, PK)
- nombreOficial, tipo, descripcion, ...
- creadoEn, actualizadoEn, estaEliminada

### temas
- id (UUID, PK)
- nombre, descripcion, categoriaTema, ...
- creadoEn, actualizadoEn, estaEliminada

## Tablas relacionales (many-to-many)

- persona_tema (persona_id, tema_id)
- proyecto_tema (proyecto_id, tema_id)
- entrevista_tema (entrevista_id, tema_id)
- noticia_tema (noticia_id, tema_id)
- proyecto_persona_rol (proyecto_id, persona_id, rol)
- proyecto_organizacion_rol (proyecto_id, organizacion_id, rol)


## Notes:
- All tables include created/updated timestamps and logical deletion (`estaEliminada`).
- Storage is done using Supabase Storage (buckets), URLs are stored in tables.
