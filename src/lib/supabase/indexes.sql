-- Indexes for personas table
CREATE INDEX IF NOT EXISTS idx_personas_nombre ON personas(nombre);
CREATE INDEX IF NOT EXISTS idx_personas_email ON personas(email);
CREATE INDEX IF NOT EXISTS idx_personas_categoria_principal ON personas(categoria_principal);
CREATE INDEX IF NOT EXISTS idx_personas_es_admin ON personas(es_admin);
CREATE INDEX IF NOT EXISTS idx_personas_esta_eliminada ON personas(esta_eliminada);

-- Indexes for organizaciones table
CREATE INDEX IF NOT EXISTS idx_organizaciones_nombre ON organizaciones(nombre);
CREATE INDEX IF NOT EXISTS idx_organizaciones_esta_eliminada ON organizaciones(esta_eliminada);

-- Indexes for temas table
CREATE INDEX IF NOT EXISTS idx_temas_nombre ON temas(nombre);
CREATE INDEX IF NOT EXISTS idx_temas_esta_eliminado ON temas(esta_eliminado);

-- Indexes for proyectos table
CREATE INDEX IF NOT EXISTS idx_proyectos_titulo ON proyectos(titulo);
CREATE INDEX IF NOT EXISTS idx_proyectos_status ON proyectos(status);
CREATE INDEX IF NOT EXISTS idx_proyectos_esta_eliminado ON proyectos(esta_eliminado);

-- Indexes for entrevistas table
CREATE INDEX IF NOT EXISTS idx_entrevistas_titulo ON entrevistas(titulo);
CREATE INDEX IF NOT EXISTS idx_entrevistas_status ON entrevistas(status);
CREATE INDEX IF NOT EXISTS idx_entrevistas_fecha_entrevista ON entrevistas(fecha_entrevista);
CREATE INDEX IF NOT EXISTS idx_entrevistas_esta_eliminada ON entrevistas(esta_eliminada);

-- Indexes for noticias table
CREATE INDEX IF NOT EXISTS idx_noticias_titulo ON noticias(titulo);
CREATE INDEX IF NOT EXISTS idx_noticias_tipo ON noticias(tipo);
CREATE INDEX IF NOT EXISTS idx_noticias_esta_eliminada ON noticias(esta_eliminada);

-- Indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_persona_tema_persona_id ON persona_tema(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tema_tema_id ON persona_tema(tema_id);

CREATE INDEX IF NOT EXISTS idx_proyecto_tema_proyecto_id ON proyecto_tema(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_tema_tema_id ON proyecto_tema(tema_id);

CREATE INDEX IF NOT EXISTS idx_entrevista_tema_entrevista_id ON entrevista_tema(entrevista_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_tema_tema_id ON entrevista_tema(tema_id);

CREATE INDEX IF NOT EXISTS idx_noticia_tema_noticia_id ON noticia_tema(noticia_id);
CREATE INDEX IF NOT EXISTS idx_noticia_tema_tema_id ON noticia_tema(tema_id);

CREATE INDEX IF NOT EXISTS idx_proyecto_persona_rol_proyecto_id ON proyecto_persona_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_persona_rol_persona_id ON proyecto_persona_rol(persona_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_persona_rol_rol ON proyecto_persona_rol(rol);

CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_proyecto_id ON proyecto_organizacion_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_organizacion_id ON proyecto_organizacion_rol(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_rol ON proyecto_organizacion_rol(rol);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_personas_search ON personas USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(biografia, '')));
CREATE INDEX IF NOT EXISTS idx_proyectos_search ON proyectos USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));
CREATE INDEX IF NOT EXISTS idx_noticias_search ON noticias USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(contenido, ''))); 