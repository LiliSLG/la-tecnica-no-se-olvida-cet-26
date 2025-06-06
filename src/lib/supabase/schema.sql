-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE news_type AS ENUM ('article', 'link');

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

-- Create tables
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT,
    foto_url TEXT,
    biografia TEXT,
    categoria_principal TEXT,
    capacidades_plataforma TEXT[],
    es_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS organizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    logo_url TEXT,
    sitio_web TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS temas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminado BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    archivo_principal_url TEXT,
    status estado_proyecto DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminado BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS entrevistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    video_url TEXT,
    status interview_status DEFAULT 'scheduled',
    fecha_entrevista TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    contenido TEXT,
    tipo tipo_noticia NOT NULL DEFAULT 'article',
    imagen_url TEXT,
    url_externa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS historias_orales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo_contenido tipo_contenido_entrevista NOT NULL,
    plataforma_video TEXT,
    archivo_principal_url TEXT,
    estado estado_entrevista DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ofertas_laborales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    empresa TEXT,
    ubicacion TEXT,
    estado TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    esta_eliminada BOOLEAN DEFAULT false,
    eliminado_por_uid UUID,
    eliminado_en TIMESTAMP WITH TIME ZONE
);

-- Junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS persona_tema (
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    PRIMARY KEY (persona_id, tema_id)
);

CREATE TABLE IF NOT EXISTS proyecto_tema (
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    PRIMARY KEY (proyecto_id, tema_id)
);

CREATE TABLE IF NOT EXISTS entrevista_tema (
    entrevista_id UUID REFERENCES entrevistas(id) ON DELETE CASCADE,
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    PRIMARY KEY (entrevista_id, tema_id)
);

CREATE TABLE IF NOT EXISTS noticia_tema (
    noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    PRIMARY KEY (noticia_id, tema_id)
);

CREATE TABLE IF NOT EXISTS proyecto_persona_rol (
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    rol TEXT NOT NULL,
    PRIMARY KEY (proyecto_id, persona_id)
);

CREATE TABLE IF NOT EXISTS proyecto_organizacion_rol (
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    rol TEXT NOT NULL,
    PRIMARY KEY (proyecto_id, organizacion_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizaciones_updated_at
    BEFORE UPDATE ON organizaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_temas_updated_at
    BEFORE UPDATE ON temas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrevistas_updated_at
    BEFORE UPDATE ON entrevistas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noticias_updated_at
    BEFORE UPDATE ON noticias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historias_orales_updated_at
    BEFORE UPDATE ON historias_orales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ofertas_laborales_updated_at
    BEFORE UPDATE ON ofertas_laborales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_personas_esta_eliminada ON personas(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_organizaciones_esta_eliminada ON organizaciones(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_temas_esta_eliminado ON temas(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_proyectos_esta_eliminado ON proyectos(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_noticias_esta_eliminada ON noticias(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_historias_orales_esta_eliminada ON historias_orales(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_esta_eliminada ON ofertas_laborales(esta_eliminada);

CREATE INDEX IF NOT EXISTS idx_proyectos_status ON proyectos(status);
CREATE INDEX IF NOT EXISTS idx_noticias_tipo ON noticias(tipo);
CREATE INDEX IF NOT EXISTS idx_historias_orales_estado ON historias_orales(estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_estado ON ofertas_laborales(estado);

CREATE INDEX IF NOT EXISTS idx_personas_eliminado_por_uid ON personas(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_organizaciones_eliminado_por_uid ON organizaciones(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_temas_eliminado_por_uid ON temas(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_proyectos_eliminado_por_uid ON proyectos(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_noticias_eliminado_por_uid ON noticias(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_historias_orales_eliminado_por_uid ON historias_orales(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_eliminado_por_uid ON ofertas_laborales(eliminado_por_uid);

CREATE INDEX IF NOT EXISTS idx_persona_tema_persona_id ON persona_tema(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tema_tema_id ON persona_tema(tema_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_proyecto_id ON proyecto_organizacion_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_organizacion_id ON proyecto_organizacion_rol(organizacion_id); 