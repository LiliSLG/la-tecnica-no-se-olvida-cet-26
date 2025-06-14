# Supabase Database

## Main Tables

### personas
id (UUID, PK)
nombre (string)
apellido (string, optional)
email (string, optional, unique)
foto_url (string, optional)
categoria_principal (categoria_principal_persona_enum, optional)
areas_de_interes_o_expertise (text[], optional)
titulo_profesional (string, optional)
descripcion_personal_o_profesional (string, optional)
disponible_para_proyectos (boolean)
activo (boolean)
es_admin (boolean)
es_ex_alumno_cet (boolean)
ano_cursada_actual_cet (integer, optional)
ano_egreso_cet (integer, optional)
titulacion_obtenida_cet (string, optional)
proyecto_final_cet_id (UUID, FK proyectos, optional)
buscando_oportunidades (boolean)
estado_situacion_laboral (estado_situacion_laboral_enum, optional)
historia_de_exito_o_resumen_trayectoria (string, optional)
empresa_o_institucion_actual (string, optional)
cargo_actual (string, optional)
ofrece_colaboracion_como (text[], optional)
telefono_contacto (string, optional)
links_profesionales (jsonb, optional)
ubicacion_residencial (jsonb: direccion, provincia, localidad, codigo_postal, lat?, lng?, optional)
visibilidad_perfil (visibilidad_perfil_enum, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

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
id (UUID, PK)
titulo (string)
descripcion_general (string, optional)
resumen_ejecutivo (string, optional)
ano_proyecto (integer, optional)
estado_actual (estado_proyecto_enum, optional)
fecha_inicio (timestamp, optional)
fecha_finalizacion_estimada (timestamp, optional)
fecha_finalizacion_real (timestamp, optional)
fecha_presentacion (timestamp, optional)
archivo_principal_url (string, optional)
nombre_archivo_principal (string, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### historias_orales
id (UUID, PK)
tipo_contenido (tipo_contenido_entrevista_enum, optional)
titulo_saber (string)
descripcion_saber (string, optional)
video_propio_url (string, optional)
plataforma_video_propio (plataforma_video_enum, optional)
url_video_externo (string, optional)
plataforma_video_externo (plataforma_video_enum, optional)
fuente_video_externo (string, optional)
fecha_grabacion_o_recopilacion (timestamp, optional)
ambito_saber (string, optional)
palabras_clave_saber (text[], optional)
fuentes_informacion (text[], optional)
recopilado_por_uids (text[], optional)
transcripcion_texto_completo (string, optional)
transcripcion_file_url (string, optional)
imagen_miniatura_url (string, optional)
duracion_media_minutos (integer, optional)
esta_publicada (boolean, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### noticias
id (UUID, PK)
tipo (tipo_noticia)
titulo (string)
subtitulo (string, optional)
contenido (string, optional)
url_externa (string, optional)
fuente_externa (string, optional)
resumen_o_contexto_interno (string, optional)
fecha_publicacion (timestamp, optional)
autor_noticia (string, optional)
imagen_url (string, optional)
es_destacada (boolean, optional)
esta_publicada (boolean, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### organizaciones
id (UUID, PK)
nombre_oficial (string)
nombre_fantasia (string, optional)
tipo (tipo_organizacion_enum, optional)
descripcion (string, optional)
logo_url (string, optional)
sitio_web (string, optional)
email_contacto (string, optional)
telefono_contacto (string, optional)
areas_de_interes (text[], optional)
abierta_a_colaboraciones (boolean, optional)
ubicacion (jsonb, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### temas
id (UUID, PK)
nombre (string)
descripcion (string, optional)
categoria_tema (tema_categoria_enum, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

---

### ofertas_laborales
id (UUID, PK)
titulo (string)
descripcion (string, optional)
empresa (string, optional)
ubicacion (string, optional)
estado (string)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)



### cursos
id (UUID, PK)
titulo (title)
descripcion (description)
nivel (level, nivel_curso_enum)
duracion (duration, integer)
estado (status, text)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### analisis_satelitales
id (UUID, PK)
proyecto_id (UUID, FK proyectos)
titulo (string)
tipo_analisis (string)
resumen (string, optional)
parametros_gee (jsonb, optional)
imagen_grafico_url (string, optional)
datos_tabla (jsonb, optional)
created_at (timestamp, optional)
created_by_uid (UUID, optional)
updated_at (timestamp, optional)
updated_by_uid (UUID, optional)
deleted_at (timestamp, optional)
deleted_by_uid (UUID, optional)
is_deleted (boolean, optional)

### roles
- id (UUID, PK)
- nombre (string)
- descripcion (string, optional)
- created_at (timestamp, optional)
- created_by_uid (UUID, optional)
- updated_at (timestamp, optional)
- updated_by_uid (UUID, optional)
- deleted_at (timestamp, optional)
- deleted_by_uid (UUID, optional)
- is_deleted (boolean, optional)


## Tablas relacionales (many-to-many)

### persona_tema
- persona_id (UUID, FK personas)
- tema_id (UUID, FK temas)

### persona_roles
- persona_id (UUID, FK personas)
- rol_id (UUID, FK roles)
- asignado_en (timestamp, optional)
- asignado_por_uid (UUID, optional)
- created_at (timestamp, optional)
- created_by_uid (UUID, optional)
- updated_at (timestamp, optional)
- updated_by_uid (UUID, optional)
- deleted_at (timestamp, optional)
- deleted_by_uid (UUID, optional)
- is_deleted (boolean, optional)

### proyecto_tema
- proyecto_id (UUID, FK proyectos)
- tema_id (UUID, FK temas)

### proyecto_persona_rol
- proyecto_id (UUID, FK proyectos)
- persona_id (UUID, FK personas)
- rol (string)
- created_at (timestamp, optional)
- created_by_uid (UUID, optional)
- updated_at (timestamp, optional)
- updated_by_uid (UUID, optional)
- deleted_at (timestamp, optional)
- deleted_by_uid (UUID, optional)
- is_deleted (boolean, optional)

### proyecto_organizacion_rol
- proyecto_id (UUID, FK proyectos)
- organizacion_id (UUID, FK organizaciones)
- rol (string)
- created_at (timestamp, optional)
- created_by_uid (UUID, optional)
- updated_at (timestamp, optional)
- updated_by_uid (UUID, optional)
- deleted_at (timestamp, optional)
- deleted_by_uid (UUID, optional)
- is_deleted (boolean, optional)

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
- proyecto_origen_id (UUID, FK proyectos)
- proyecto_referencia_id (UUID, FK proyectos)
- tipo_relacion (tipo_relacion_proyecto_enum)
- descripcion (text, optional)
- created_at (timestamp, optional)
- updated_at (timestamp, optional)
- updated_by_uid (UUID, optional)
- deleted_at (timestamp, optional)
- deleted_by_uid (UUID, optional)
- is_deleted (boolean, optional)

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

- All tables include created/updated timestamps and logical deletion.
- Storage is done using Supabase Storage (buckets), URLs are stored in tables.