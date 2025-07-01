# 🗄️ Esquemas de Base de Datos - La Técnica no se Olvida

## 📋 Tablas Principales

### personas
```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  fecha_nacimiento DATE,
  
  -- Categorización y roles
  categoria_principal categoria_principal_persona_enum DEFAULT 'ninguno_asignado',
  es_admin BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  
  -- Información profesional/académica
  situacion_laboral estado_situacion_laboral_enum DEFAULT 'no_especificado',
  descripcion_personal TEXT,
  areas_de_interes_o_expertise TEXT[], -- Array de strings
  
  -- Información de contacto y ubicación
  ubicacion_residencial JSONB, -- Estructura definida abajo
  links_profesionales JSONB,   -- LinkedIn, GitHub, portfolio, etc.
  
  -- Configuración de perfil
  visibilidad_perfil visibilidad_perfil_enum DEFAULT 'publico',
  foto_perfil_url TEXT,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### proyectos
```sql
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion_general TEXT,
  resumen_ejecutivo TEXT,
  
  -- Información temporal
  ano_proyecto INTEGER,
  estado_actual estado_proyecto_enum DEFAULT 'idea',
  fecha_inicio TIMESTAMPTZ,
  fecha_finalizacion_estimada TIMESTAMPTZ,
  fecha_finalizacion_real TIMESTAMPTZ,
  fecha_presentacion TIMESTAMPTZ,
  
  -- Archivos y documentación
  archivo_principal_url TEXT,
  nombre_archivo_principal TEXT,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### temas
```sql
CREATE TABLE temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_tema tema_categoria_enum,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### organizaciones
```sql
CREATE TABLE organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_oficial TEXT NOT NULL,
  nombre_fantasia TEXT,
  tipo tipo_organizacion_enum,
  descripcion TEXT,
  
  -- Información de contacto
  logo_url TEXT,
  sitio_web TEXT,
  email_contacto TEXT,
  telefono_contacto TEXT,
  ubicacion JSONB, -- Similar estructura a personas
  
  -- Áreas de trabajo y colaboración
  areas_de_interes TEXT[],
  abierta_a_colaboraciones BOOLEAN DEFAULT true,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### noticias
```sql
CREATE TABLE noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tipo_noticia NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  contenido TEXT,
  
  -- Para noticias externas
  url_externa TEXT,
  fuente_externa TEXT,
  resumen_o_contexto_interno TEXT,
  
  -- Información de publicación
  fecha_publicacion TIMESTAMPTZ,
  autor_noticia TEXT,
  imagen_url TEXT,
  es_destacada BOOLEAN DEFAULT false,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### historias_orales
```sql
CREATE TABLE historias_orales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Contenido de la historia
  tipo_contenido tipo_contenido_entrevista_enum,
  contenido_principal_url TEXT,
  transcripcion_completa TEXT,
  
  -- Información del entrevistado
  persona_entrevistada_id UUID REFERENCES personas(id),
  fecha_entrevista TIMESTAMPTZ,
  lugar_entrevista TEXT,
  entrevistador TEXT,
  
  -- Clasificación del conocimiento
  palabras_clave_saber TEXT[],
  categoria_principal_saber tema_categoria_enum,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

## 🔗 Tablas de Relación

### persona_tema (Many-to-Many)
```sql
CREATE TABLE persona_tema (
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
  nivel_expertise nivel_expertise_enum DEFAULT 'basico',
  descripcion_expertise TEXT,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false,
  PRIMARY KEY (persona_id, tema_id)
);
```

### proyecto_tema (Many-to-Many)
```sql
CREATE TABLE proyecto_tema (
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
  relevancia_en_proyecto relevancia_enum DEFAULT 'media',
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false,
  PRIMARY KEY (proyecto_id, tema_id)
);
```

### proyecto_persona_rol (Roles específicos por proyecto)
```sql
CREATE TABLE proyecto_persona_rol (
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  rol rol_proyecto_enum NOT NULL, -- autor, tutor, colaborador, revisor
  descripcion_rol TEXT,
  fecha_inicio_participacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin_participacion TIMESTAMPTZ,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false,
  PRIMARY KEY (proyecto_id, persona_id, rol)
);
```

## 🏷️ Tablas de Roles Globales

### roles
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE, -- 'admin', 'moderator', 'editor'
  descripcion TEXT,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false
);
```

### persona_roles (Roles globales asignados)
```sql
CREATE TABLE persona_roles (
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  asignado_en TIMESTAMPTZ DEFAULT NOW(),
  asignado_por_uid UUID,
  
  -- Metadatos estándar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID,
  is_deleted BOOLEAN DEFAULT false,
  PRIMARY KEY (persona_id, rol_id)
);
```

## 📊 Enums Definidos

### categoria_principal_persona_enum
```sql
CREATE TYPE categoria_principal_persona_enum AS ENUM (
  -- Comunidad CET N°26
  'docente_cet',              -- Profesores y staff del CET
  'estudiante_cet',           -- Estudiantes actuales del CET
  'ex_alumno_cet',            -- Graduados del CET
  
  -- Roles de mentores y apoyo
  'tutor_invitado',           -- Mentores externos e internos
  'colaborador_invitado',     -- Apoyo especializado en proyectos
  'autor_invitado',           -- Creadores de contenido externo
  
  -- Comunidad rural y externa
  'productor_rural',          -- Productores agropecuarios locales
  'profesional_externo',      -- Profesionales de diversas áreas
  'investigador',             -- Investigadores académicos o independientes
  'comunidad_general',        -- Miembros de la comunidad local
  
  -- Estados administrativos
  'otro',                     -- Casos especiales
  'ninguno_asignado'          -- Estado temporal hasta verificación
);
```

### estado_situacion_laboral_enum
```sql
CREATE TYPE estado_situacion_laboral_enum AS ENUM (
  'buscando_empleo',
  'empleado',
  'emprendedor',
  'estudiante',
  'jubilado',
  'no_especificado',
  'otro'
);
```

### visibilidad_perfil_enum
```sql
CREATE TYPE visibilidad_perfil_enum AS ENUM (
  'publico',                    -- Visible para todos
  'solo_registrados_plataforma', -- Solo usuarios registrados
  'privado',                    -- Solo el propio usuario
  'solo_admins_y_propio'        -- Solo admins y el propio usuario
);
```

### tema_categoria_enum
```sql
CREATE TYPE tema_categoria_enum AS ENUM (
  'agropecuario',
  'tecnologico',
  'social',
  'ambiental',
  'educativo',
  'produccion_animal',
  'sanidad',
  'energia',
  'recursos_naturales',
  'manejo_suelo',
  'gastronomia',
  'otro'
);
```

### estado_proyecto_enum
```sql
CREATE TYPE estado_proyecto_enum AS ENUM (
  'idea',              -- Proyecto en fase de conceptualización
  'en_desarrollo',     -- Proyecto actualmente en desarrollo
  'finalizado',        -- Proyecto completado
  'presentado',        -- Proyecto presentado/defendido
  'archivado',         -- Proyecto archivado sin completar
  'cancelado'          -- Proyecto cancelado
);
```

### tipo_organizacion_enum
```sql
CREATE TYPE tipo_organizacion_enum AS ENUM (
  'empresa',
  'institucion_educativa',
  'ONG',
  'establecimiento_ganadero',
  'organismo_gubernamental',
  'otro'
);
```

### tipo_noticia
```sql
CREATE TYPE tipo_noticia AS ENUM (
  'articulo_propio',    -- Contenido creado internamente
  'enlace_externo'      -- Link a contenido externo
);
```

### rol_proyecto_enum
```sql
CREATE TYPE rol_proyecto_enum AS ENUM (
  'autor',        -- Creador/dueño del proyecto (estudiante/ex-alumno)
  'tutor',        -- Mentor del proyecto (docente/profesional)
  'colaborador',  -- Apoyo en desarrollo del proyecto
  'revisor'       -- Revisor/evaluador del proyecto
);
```

### nivel_expertise_enum
```sql
CREATE TYPE nivel_expertise_enum AS ENUM (
  'basico',
  'intermedio',
  'avanzado',
  'experto'
);
```

### relevancia_enum
```sql
CREATE TYPE relevancia_enum AS ENUM (
  'baja',
  'media',
  'alta',
  'critica'
);
```

### tipo_contenido_entrevista_enum
```sql
CREATE TYPE tipo_contenido_entrevista_enum AS ENUM (
  'video_propio',           -- Video subido a la plataforma
  'enlace_video_externo',   -- Link a YouTube, Vimeo, etc.
  'audio_propio',           -- Audio subido a la plataforma
  'enlace_audio_externo',   -- Link a SoundCloud, Spotify, etc.
  'solo_transcripcion'      -- Solo texto de la transcripción
);
```

## 🗂️ Campos JSONB Estructurados

### ubicacion_residencial / ubicacion
```json
{
  "direccion": "Calle Ejemplo 123",
  "provincia": "Río Negro",
  "localidad": "Ingeniero Jacobacci", 
  "codigo_postal": "8532",
  "lat": -41.2345,  // opcional para geocoding
  "lng": -69.5678   // opcional para geocoding
}
```

### links_profesionales
```json
{
  "linkedin": "https://linkedin.com/in/usuario",
  "github": "https://github.com/usuario", 
  "portfolio": "https://portfolio.ejemplo.com",
  "orcid": "https://orcid.org/0000-0000-0000-0000",
  "researchgate": "https://researchgate.net/profile/usuario",
  "otro": "https://sitio.personal.com"
}
```

## ⚡ Índices para Performance

### Índices básicos
```sql
-- Personas
CREATE INDEX idx_personas_email ON personas (email);
CREATE INDEX idx_personas_categoria ON personas (categoria_principal);
CREATE INDEX idx_personas_activo ON personas (activo);
CREATE INDEX idx_personas_is_deleted ON personas (is_deleted);
CREATE INDEX idx_personas_es_admin ON personas (es_admin);

-- Proyectos
CREATE INDEX idx_proyectos_estado ON proyectos (estado_actual);
CREATE INDEX idx_proyectos_ano ON proyectos (ano_proyecto);
CREATE INDEX idx_proyectos_is_deleted ON proyectos (is_deleted);

-- Temas
CREATE INDEX idx_temas_categoria ON temas (categoria_tema);
CREATE INDEX idx_temas_is_deleted ON temas (is_deleted);

-- Noticias
CREATE INDEX idx_noticias_tipo ON noticias (tipo);
CREATE INDEX idx_noticias_fecha_publicacion ON noticias (fecha_publicacion);
CREATE INDEX idx_noticias_es_destacada ON noticias (es_destacada);
CREATE INDEX idx_noticias_is_deleted ON noticias (is_deleted);
```

### Índices para arrays y JSONB
```sql
-- Arrays (usando GIN)
CREATE INDEX idx_personas_areas_interes ON personas USING GIN (areas_de_interes_o_expertise);
CREATE INDEX idx_organizaciones_areas_interes ON organizaciones USING GIN (areas_de_interes);
CREATE INDEX idx_historias_palabras_clave ON historias_orales USING GIN (palabras_clave_saber);

-- JSONB (usando GIN)
CREATE INDEX idx_personas_ubicacion ON personas USING GIN (ubicacion_residencial);
CREATE INDEX idx_personas_links ON personas USING GIN (links_profesionales);
CREATE INDEX idx_organizaciones_ubicacion ON organizaciones USING GIN (ubicacion);
```

## 🔒 Configuración RLS Base

### Habilitar RLS en todas las tablas
```sql
-- Tablas principales
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historias_orales ENABLE ROW LEVEL SECURITY;

-- Tablas de relación
ALTER TABLE persona_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_persona_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_roles ENABLE ROW LEVEL SECURITY;

-- Tabla de roles (solo admins)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
```

## 📝 Patrones de Soft Delete

Todas las tablas principales implementan soft delete con:
- **is_deleted**: Boolean flag para marcar como eliminado
- **deleted_at**: Timestamp del momento de eliminación
- **deleted_by_uid**: UUID del usuario que realizó la eliminación

### Consultas con Soft Delete
```sql
-- Consulta normal (solo registros activos)
SELECT * FROM personas WHERE is_deleted = false;

-- Consulta admin (incluir eliminados)
SELECT * FROM personas; -- RLS manejará los permisos

-- Restaurar registro
UPDATE personas 
SET is_deleted = false, deleted_at = NULL, deleted_by_uid = NULL 
WHERE id = $1;
```

## 🎯 Consideraciones Importantes

### Integridad Referencial
- Las relaciones usan `ON DELETE CASCADE` para mantener consistencia
- Las foreign keys están indexadas para performance
- Los soft deletes se manejan a nivel de aplicación, no a nivel de BD

### Escalabilidad
- Índices GIN para búsquedas en arrays y JSONB
- Particionado futuro por año para tablas históricas
- Campos JSONB para flexibilidad sin romper normalización

### Seguridad
- RLS habilitado en todas las tablas
- Función `is_admin()` para verificación de permisos
- Auditoría completa con created_by/updated_by/deleted_by

---

*Esquemas diseñados para crecer con el proyecto manteniendo performance y seguridad.*