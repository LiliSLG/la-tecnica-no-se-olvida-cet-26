-- Initial migration for La Técnica No Se Olvida database
-- This migration creates the initial schema, sets up RLS policies, and creates indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE news_type AS ENUM ('article', 'link');

-- Create tables
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE,
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
    status project_status DEFAULT 'draft',
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
    imagen_url TEXT,
    tipo news_type DEFAULT 'article',
    url_externa TEXT,
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

-- Enable Row Level Security on all tables
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrevista_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticia_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_persona_rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_organizacion_rol ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Personas policies
CREATE POLICY "Personas are viewable by everyone"
    ON personas FOR SELECT
    USING (NOT esta_eliminada);

CREATE POLICY "Personas are insertable by authenticated users"
    ON personas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Personas are updatable by admins or self"
    ON personas FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = eliminado_por_uid) OR
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Personas are deletable by admins"
    ON personas FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create similar policies for other tables...

-- Create indexes
-- Personas indexes
CREATE INDEX IF NOT EXISTS idx_personas_nombre ON personas(nombre);
CREATE INDEX IF NOT EXISTS idx_personas_email ON personas(email);
CREATE INDEX IF NOT EXISTS idx_personas_categoria_principal ON personas(categoria_principal);
CREATE INDEX IF NOT EXISTS idx_personas_es_admin ON personas(es_admin);
CREATE INDEX IF NOT EXISTS idx_personas_esta_eliminada ON personas(esta_eliminada);

-- Create similar indexes for other tables...

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_personas_search ON personas USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(biografia, '')));
CREATE INDEX IF NOT EXISTS idx_proyectos_search ON proyectos USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));
CREATE INDEX IF NOT EXISTS idx_noticias_search ON noticias USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(contenido, ''))); 