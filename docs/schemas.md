# Supabase Database

## Main Tables

### personas
- id (UUID, PK)
- nombre (name)
- apellido (surname)
- email (unique)
- fotoURL (profile picture URL)
- categoriaPrincipal (main category, categoria_principal_persona_enum)
- capacidadesPlataforma (platform capabilities, array text[])
- activo (active, boolean)
- esAdmin (is admin, boolean)
- tituloProfesional (professional title)
- descripcionPersonalOProfesional (personal or professional description)
- areasDeInteresOExpertise (areas of interest or expertise, array text[])
- disponibleParaProyectos (available for projects, boolean)
- esExAlumnoCET (is CET alumni, boolean)
- anoCursadaActualCET (current CET year, integer)
- anoEgresoCET (CET graduation year, integer)
- titulacionObtenidaCET (CET degree obtained)
- proyectoFinalCETId (CET final project ID, UUID, optional FK to proyectos)
- buscandoOportunidades (looking for opportunities, boolean)
- estadoSituacionLaboral (employment status, estado_situacion_laboral_enum)
- historiaDeExitoOResumenTrayectoria (success story or career summary)
- empresaOInstitucionActual (current company or institution)
- cargoActual (current position)
- ofreceColaboracionComo (offers collaboration as, array text[])
- telefonoContacto (contact phone)
- linksProfesionales (professional links, jsonb)
- ubicacionResidencial (residential location, jsonb) see below
- visibilidadPerfil (profile visibility, visibilidad_perfil_enum)
- ingresadoPor (created by)
- creadoEn (created at, timestamp)
- modificadoPor (modified by)
- actualizadoEn (updated at, timestamp)
- estaEliminada (is deleted, boolean)
- eliminadoEn (deleted at, timestamp)
- eliminadoPorUid (deleted by user ID)

---

The `ubicacionResidencial` field represents a person's residential address. It is stored as a structured object in JSONB format with the following fields:

- `direccion`: street and number (string)
- `provincia`: province (string)
- `localidad`: city or town (string)
- `codigo_postal`: postal code (string)
- `lat` (optional): geographic latitude (number)
- `lng` (optional): geographic longitude (number)

This field is interpreted by forms as a nested object. It is recommended to validate at least the text fields as required and keep `lat` and `lng` as optional for future map visualizations.

📌 Note:
It is planned to link these fields to an interactive map location selector in the future, allowing users to choose their position directly from a visual interface. Meanwhile, these values can be entered manually or left blank.

### proyectos
- id (UUID, PK)
- titulo (title)
- descripcionGeneral (general description)
- resumenEjecutivo (executive summary)
- anoProyecto (project year, integer)
- estadoActual (current status, estado_proyecto_enum)
- fechaInicio (start date, timestamp)
- fechaFinalizacionEstimada (estimated completion date, timestamp)
- fechaFinalizacionReal (actual completion date, timestamp)
- fechaPresentacion (presentation date, timestamp)
- archivoPrincipalURL (main file URL)
- nombreArchivoPrincipal (main file name)
- esEliminado (is deleted, boolean)
- creadoPorUid (created by user ID)
- creadoEn (created at, timestamp)
- actualizadoPorUid (updated by user ID)
- actualizadoEn (updated at, timestamp)
- eliminadoEn (deleted at, timestamp)
- eliminadoPorUid (deleted by user ID)

### historias_orales
- id (UUID, PK)
- tipoContenido (content type, tipo_contenido_historia_oral_enum)
- tituloSaber (knowledge title)
- descripcionSaber (knowledge description)
- videoPropioURL (own video URL)
- plataformaVideoPropio (own video platform, plataforma_video_enum)
- urlVideoExterno (external video URL)
- plataformaVideoExterno (external video platform, plataforma_video_enum)
- fuenteVideoExterno (external video source)
- fechaGrabacionORecopilacion (recording or collection date, timestamp)
- ambitoSaber (knowledge scope)
- palabrasClaveSaber (knowledge keywords, array text[])
- fuentesInformacion (information sources, array text[])
- recopiladoPorUids (collected by user IDs, array text[])
- transcripcionTextoCompleto (full transcription text)
- transcripcionFileURL (transcription file URL)
- imagenMiniaturaURL (thumbnail image URL)
- duracionMediaMinutos (media duration in minutes, integer)
- estaPublicada (is published, boolean)
- creadoPorUid (created by user ID)
- creadoEn (created at, timestamp)
- modificadoPorUid (modified by user ID)
- actualizadoEn (updated at, timestamp)
- estaEliminada (is deleted, boolean)
- eliminadoEn (deleted at, timestamp)
- eliminadoPorUid (deleted by user ID)

### noticias
- id (UUID, PK)
- tipoContenido (content type, tipo_contenido_noticia_enum)
- titulo (title)
- subtitulo (subtitle)
- contenido (content)
- urlExterna (external URL)
- fuenteExterna (external source)
- resumenOContextoInterno (internal summary or context)
- fechaPublicacion (publication date, timestamp)
- autorNoticia (news author)
- imagenPrincipalURL (main image URL)
- esDestacada (is featured, boolean)
- estaPublicada (is published, boolean)
- creadoPorUid (created by user ID)
- actualizadoEn (updated at, timestamp)
- modificadoPorUid (modified by user ID)
- estaEliminada (is deleted, boolean)
- eliminadoEn (deleted at, timestamp)
- eliminadoPorUid (deleted by user ID)

### organizaciones
- id (UUID, PK)
- nombreOficial (official name)
- nombreFantasia (trading name)
- tipo (type, tipo_organizacion_enum)
- descripcion (description)
- logoURL (logo URL)
- sitioWeb (website)
- emailContacto (contact email)
- telefonoContacto (contact phone)
- areasDeInteres (areas of interest, array text[])
- abiertaAColaboraciones (open to collaborations, boolean)
- ubicacion (location, jsonb)
- ingresadoPorUid (created by user ID)
- creadoEn (created at, timestamp)
- actualizadoEn (updated at, timestamp)
- modificadoPorUid (modified by user ID)
- estaEliminada (is deleted, boolean)
- eliminadaEn (deleted at, timestamp)
- eliminadaPorUid (deleted by user ID)

### temas
- id (UUID, PK)
- nombre (name)
- descripcion (description)
- categoriaTema (topic category, tema_categoria_enum)
- ingresadoPorUid (created by user ID)
- creadoEn (created at, timestamp)
- actualizadoEn (updated at, timestamp)
- modificadoPorUid (modified by user ID)
- estaEliminada (is deleted, boolean)
- eliminadoEn (deleted at, timestamp)
- eliminadoPorUid (deleted by user ID)

---

### ofertas_laborales
- id (UUID, PK)
- titulo (title)
- descripcion (description)
- empresa (company)
- ubicacion (location)
- estado (status, text)
- estaEliminada (is deleted, boolean)
- eliminadoPorUid (deleted by user ID)
- eliminadoEn (deleted at, timestamp)
- creadoEn (created at, timestamp)
- actualizadoEn (updated at, timestamp)

### historias_orales
- id (UUID, PK)
- titulo (title)
- descripcion (description)
- archivoPrincipalURL (main file URL)
- estado (status, text)
- estaEliminada (is deleted, boolean)
- eliminadoPorUid (deleted by user ID)
- eliminadoEn (deleted at, timestamp)
- creadoEn (created at, timestamp)
- actualizadoEn (updated at, timestamp)

### cursos
- id (UUID, PK)
- titulo (title)
- descripcion (description)
- nivel (level, nivel_curso_enum)
- duracion (duration, integer)
- estado (status, text)
- estaEliminada (is deleted, boolean)
- eliminadoPorUid (deleted by user ID)
- eliminadoEn (deleted at, timestamp)

## Tablas relacionales (many-to-many)

### persona_tema
- persona_id (UUID, FK personas)
- tema_id (UUID, FK temas)

### proyecto_tema
- proyecto_id (UUID, FK proyectos)
- tema_id (UUID, FK temas)

### historia_oral_tema
- entrevista_id (UUID, FK historias_orales)
- tema_id (UUID, FK temas)

### noticia_tema
- noticia_id (UUID, FK noticias)
- tema_id (UUID, FK temas)

### proyecto_autor
- proyecto_id (UUID, FK proyectos)
- persona_id (UUID, FK personas)

### proyecto_tutor
- proyecto_id (UUID, FK proyectos)
- persona_id (UUID, FK personas)

### proyecto_colaborador
- proyecto_id (UUID, FK proyectos)
- persona_id (UUID, FK personas)

### proyecto_organizacion_tutoria
- proyecto_id (UUID, FK proyectos)
- organizacion_id (UUID, FK organizaciones)

### proyecto_historia_oral
- proyecto_id (UUID, FK proyectos)
- entrevista_id (UUID, FK historias_orales)

### proyecto_archivo
- id (UUID, PK)
- proyecto_id (UUID, FK proyectos)
- nombre
- url
- tipo
- descripcion
- subidoEn (timestamp)

### proyecto_relaciones
- proyecto_origen_id (UUID, FK a proyectos)
- proyecto_referencia_id (UUID, FK a proyectos)
- tipo_relacion (tipo_relacion_proyecto_enum)
- descripcion (text)
- creado_en (timestamp)
---

## Enums definidos

### categoria_principal_persona_enum
- docente_cet
- estudiante_cet
- ex_alumno_cet
- productor_rural
- profesional_externo
- investigador
- comunidad_general
- otro
- ninguno_asignado
- tutor_invitado
- colaborador_invitado
- autor_invitado

### estado_situacion_laboral_enum
- buscando_empleo
- empleado
- emprendedor
- estudiante
- no_especificado
- jubilado
- otro

### visibilidad_perfil_enum
- publico
- solo_registrados_plataforma
- privado
- solo_admins_y_propio

### tema_categoria_enum
- agropecuario
- tecnologico
- social
- ambiental
- educativo
- produccion_animal
- sanidad
- energia
- recursos_naturales
- manejo_suelo
- gastronomia
- otro

### tipo_organizacion_enum
- empresa
- institucion_educativa
- ONG
- estancia_productiva
- organismo_gubernamental
- otro

### tipo_contenido_noticia_enum
- articulo_propio
- enlace_externo

### tipo_contenido_historia_oral_enum
- video_propio
- enlace_video_externo

### plataforma_video_enum
- firebase_storage
- youtube_propio
- youtube
- facebook
- vimeo
- otro

### estado_proyecto_enum
- idea
- en_desarrollo
- finalizado
- presentado
- archivado
- cancelado

### nivel_curso_enum
- basico
- intermedio
- avanzado

### tipo_relacion_proyecto_enum
- referencia             -- "Toma como referencia a"
- continuacion           -- "Es una continuación de"
- mejora                 -- "Es una mejora de"
- inspirado_en           -- "Se inspiró en"
- utiliza_componentes_de -- "Utiliza componentes/tecnología de"
- antecedente_directo    -- "Es un antecedente directo de"
---


## Notes

- All tables include created/updated timestamps and logical deletion (`estaEliminada` or `esEliminado` where applicable).
- Storage is done using Supabase Storage (buckets), URLs are stored in tables.