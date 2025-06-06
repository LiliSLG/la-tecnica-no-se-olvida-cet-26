-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE tipo_noticia AS ENUM ('article', 'link');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_contenido_entrevista AS ENUM ('video', 'audio', 'texto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_proyecto AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_entrevista AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update personas table
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS capacidades_plataforma text[],
ADD COLUMN IF NOT EXISTS es_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS esta_eliminada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update organizaciones table
ALTER TABLE organizaciones
ADD COLUMN IF NOT EXISTS sitio_web text,
ADD COLUMN IF NOT EXISTS esta_eliminada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update temas table
ALTER TABLE temas
ADD COLUMN IF NOT EXISTS esta_eliminado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update proyectos table
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS status estado_proyecto DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS esta_eliminado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update noticias table
ALTER TABLE noticias
ADD COLUMN IF NOT EXISTS tipo tipo_noticia NOT NULL DEFAULT 'article',
ADD COLUMN IF NOT EXISTS esta_eliminada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update historias_orales table
ALTER TABLE historias_orales
ADD COLUMN IF NOT EXISTS tipo_contenido tipo_contenido_entrevista NOT NULL,
ADD COLUMN IF NOT EXISTS plataforma_video text,
ADD COLUMN IF NOT EXISTS estado estado_entrevista DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS esta_eliminada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Update ofertas_laborales table
ALTER TABLE ofertas_laborales
ADD COLUMN IF NOT EXISTS empresa text,
ADD COLUMN IF NOT EXISTS ubicacion text,
ADD COLUMN IF NOT EXISTS estado text NOT NULL,
ADD COLUMN IF NOT EXISTS esta_eliminada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS eliminado_por_uid text,
ADD COLUMN IF NOT EXISTS eliminado_en timestamp with time zone;

-- Create junction tables if they don't exist
CREATE TABLE IF NOT EXISTS persona_tema (
    persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
    tema_id uuid REFERENCES temas(id) ON DELETE CASCADE,
    PRIMARY KEY (persona_id, tema_id)
);

CREATE TABLE IF NOT EXISTS proyecto_organizacion_rol (
    proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
    organizacion_id uuid REFERENCES organizaciones(id) ON DELETE CASCADE,
    rol text NOT NULL,
    PRIMARY KEY (proyecto_id, organizacion_id)
); 