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