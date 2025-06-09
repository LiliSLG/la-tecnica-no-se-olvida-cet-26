# Base de datos Supabase

## Tablas principales

### personas
- id (UUID, PK)
- nombre
- apellido
- email (unique)
- fotoURL
- categoriaPrincipal (categoria_principal_persona_enum)
- capacidadesPlataforma (array text[])
- activo (boolean)
- esAdmin (boolean)
- tituloProfesional
- descripcionPersonalOProfesional
- areasDeInteresOExpertise (array text[])
- disponibleParaProyectos (boolean)
- esExAlumnoCET (boolean)
- anoCursadaActualCET (integer)
- anoEgresoCET (integer)
- titulacionObtenidaCET
- proyectoFinalCETId (UUID, FK opcional a proyectos)
- buscandoOportunidades (boolean)
- estadoSituacionLaboral (estado_situacion_laboral_enum)
- historiaDeExitoOResumenTrayectoria
- empresaOInstitucionActual
- cargoActual
- ofreceColaboracionComo (array text[])
- telefonoContacto
- linksProfesionales (jsonb)
- ubicacionResidencial (jsonb) ver abajo
- visibilidadPerfil (visibilidad_perfil_enum)
- ingresadoPor
- creadoEn (timestamp)
- modificadoPor
- actualizadoEn (timestamp)
- estaEliminada (boolean)
- eliminadoEn (timestamp)
- eliminadoPorUid


---


El campo `ubicacionResidencial` representa la dirección residencial de una persona. Se guarda como un objeto estructurado en formato JSONB con los siguientes campos:

- `direccion`: calle y número (string)
- `provincia`: provincia (string)
- `localidad`: ciudad o localidad (string)
- `codigo_postal`: código postal (string)
- `lat` (opcional): latitud geográfica (number)
- `lng` (opcional): longitud geográfica (number)

Este campo es interpretado por los formularios como un objeto anidado. Se recomienda validar al menos los campos de texto como obligatorios y mantener `lat` y `lng` como opcionales para futuras visualizaciones en mapas.
📌 Nota:
Se planea en el futuro vincular estos campos a un selector de ubicación con mapa interactivo, permitiendo que el usuario elija su posición directamente desde una interfaz visual. Mientras tanto, estos valores pueden ingresarse manualmente o dejarse en blanco.


### proyectos
- id (UUID, PK)
- titulo
- descripcionGeneral
- resumenEjecutivo
- anoProyecto (integer)
- estadoActual (estado_proyecto_enum)
- fechaInicio (timestamp)
- fechaFinalizacionEstimada (timestamp)
- fechaFinalizacionReal (timestamp)
- fechaPresentacion (timestamp)
- archivoPrincipalURL
- nombreArchivoPrincipal
- esEliminado (boolean)
- creadoPorUid
- creadoEn (timestamp)
- actualizadoPorUid
- actualizadoEn (timestamp)
- eliminadoEn (timestamp)
- eliminadoPorUid

### entrevistas
- id (UUID, PK)
- tipoContenido (tipo_contenido_entrevista_enum)
- tituloSaber
- descripcionSaber
- videoPropioURL
- plataformaVideoPropio (plataforma_video_enum)
- urlVideoExterno
- plataformaVideoExterno (plataforma_video_enum)
- fuenteVideoExterno
- fechaGrabacionORecopilacion (timestamp)
- ambitoSaber
- palabrasClaveSaber (array text[])
- fuentesInformacion (array text[])
- recopiladoPorUids (array text[])
- transcripcionTextoCompleto
- transcripcionFileURL
- imagenMiniaturaURL
- duracionMediaMinutos (integer)
- estaPublicada (boolean)
- creadoPorUid
- creadoEn (timestamp)
- modificadoPorUid
- actualizadoEn (timestamp)
- estaEliminada (boolean)
- eliminadoEn (timestamp)
- eliminadoPorUid

### noticias
- id (UUID, PK)
- tipoContenido (tipo_contenido_noticia_enum)
- titulo
- subtitulo
- contenido
- urlExterna
- fuenteExterna
- resumenOContextoInterno
- fechaPublicacion (timestamp)
- autorNoticia
- imagenPrincipalURL
- esDestacada (boolean)
- estaPublicada (boolean)
- creadoPorUid
- actualizadoEn (timestamp)
- modificadoPorUid
- estaEliminada (boolean)
- eliminadoEn (timestamp)
- eliminadoPorUid

### organizaciones
- id (UUID, PK)
- nombreOficial
- nombreFantasia
- tipo (tipo_organizacion_enum)
- descripcion
- logoURL
- sitioWeb
- emailContacto
- telefonoContacto
- areasDeInteres (array text[])
- abiertaAColaboraciones (boolean)
- ubicacion (jsonb)
- ingresadoPorUid
- creadoEn (timestamp)
- actualizadoEn (timestamp)
- modificadoPorUid
- estaEliminada (boolean)
- eliminadaEn (timestamp)
- eliminadaPorUid

### temas
- id (UUID, PK)
- nombre
- descripcion
- categoriaTema (tema_categoria_enum)
- ingresadoPorUid
- creadoEn (timestamp)
- actualizadoEn (timestamp)
- modificadoPorUid
- estaEliminada (boolean)
- eliminadoEn (timestamp)
- eliminadoPorUid

---

### ofertas_laborales
- id (UUID, PK)
- titulo
- descripcion
- empresa
- ubicacion
- estado (text)
- estaEliminada (boolean)
- eliminadoPorUid
- eliminadoEn (timestamp)
- creadoEn (timestamp)
- actualizadoEn (timestamp)

### historias_orales
- id (UUID, PK)
- titulo
- descripcion
- archivoPrincipalURL
- estado (text)
- estaEliminada (boolean)
- eliminadoPorUid
- eliminadoEn (timestamp)
- creadoEn (timestamp)
- actualizadoEn (timestamp)

### cursos
- id (UUID, PK)
- titulo
- descripcion
- nivel (nivel_curso_enum)
- duracion (integer)
- estado (text)
- estaEliminada (boolean)
- eliminadoPorUid
- eliminadoEn (timestamp)
- creadoEn (timestamp)
- actualizadoEn (timestamp)

## Tablas relacionales (many-to-many)

### persona_tema
- persona_id (UUID, FK personas)
- tema_id (UUID, FK temas)

### proyecto_tema
- proyecto_id (UUID, FK proyectos)
- tema_id (UUID, FK temas)

### entrevista_tema
- entrevista_id (UUID, FK entrevistas)
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

### proyecto_entrevista
- proyecto_id (UUID, FK proyectos)
- entrevista_id (UUID, FK entrevistas)

### proyecto_archivo
- id (UUID, PK)
- proyecto_id (UUID, FK proyectos)
- nombre
- url
- tipo
- descripcion
- subidoEn (timestamp)

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

### tipo_contenido_entrevista_enum
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

---

## Notes

- All tables include created/updated timestamps and logical deletion (`estaEliminada` or `esEliminado` where applicable).
- Storage is done using Supabase Storage (buckets), URLs are stored in tables.