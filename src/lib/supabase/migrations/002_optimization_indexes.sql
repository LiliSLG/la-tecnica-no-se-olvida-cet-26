-- Migration for index optimizations
-- This migration adds and optimizes indexes for better query performance

-- Timestamp indexes for sorting operations
CREATE INDEX IF NOT EXISTS idx_personas_created_at ON personas(created_at);
CREATE INDEX IF NOT EXISTS idx_personas_updated_at ON personas(updated_at);
CREATE INDEX IF NOT EXISTS idx_proyectos_created_at ON proyectos(created_at);
CREATE INDEX IF NOT EXISTS idx_proyectos_updated_at ON proyectos(updated_at);
CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at);
CREATE INDEX IF NOT EXISTS idx_noticias_updated_at ON noticias(updated_at);
CREATE INDEX IF NOT EXISTS idx_entrevistas_created_at ON entrevistas(created_at);
CREATE INDEX IF NOT EXISTS idx_entrevistas_updated_at ON entrevistas(updated_at);
CREATE INDEX IF NOT EXISTS idx_temas_created_at ON temas(created_at);
CREATE INDEX IF NOT EXISTS idx_temas_updated_at ON temas(updated_at);
CREATE INDEX IF NOT EXISTS idx_organizaciones_created_at ON organizaciones(created_at);
CREATE INDEX IF NOT EXISTS idx_organizaciones_updated_at ON organizaciones(updated_at);

-- Soft delete indexes
CREATE INDEX IF NOT EXISTS idx_proyectos_esta_eliminado ON proyectos(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_noticias_esta_eliminada ON noticias(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_entrevistas_esta_eliminada ON entrevistas(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_temas_esta_eliminado ON temas(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_organizaciones_esta_eliminada ON organizaciones(esta_eliminada);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_persona_tema_persona_id ON persona_tema(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tema_tema_id ON persona_tema(tema_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_tema_proyecto_id ON proyecto_tema(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_tema_tema_id ON proyecto_tema(tema_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_tema_entrevista_id ON entrevista_tema(entrevista_id);
CREATE INDEX IF NOT EXISTS idx_entrevista_tema_tema_id ON entrevista_tema(tema_id);
CREATE INDEX IF NOT EXISTS idx_noticia_tema_noticia_id ON noticia_tema(noticia_id);
CREATE INDEX IF NOT EXISTS idx_noticia_tema_tema_id ON noticia_tema(tema_id);

-- Role-based relationship table indexes
CREATE INDEX IF NOT EXISTS idx_proyecto_persona_rol_proyecto_id ON proyecto_persona_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_persona_rol_persona_id ON proyecto_persona_rol(persona_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_proyecto_id ON proyecto_organizacion_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_organizacion_id ON proyecto_organizacion_rol(organizacion_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_personas_categoria_created ON personas(categoria_principal, created_at);
CREATE INDEX IF NOT EXISTS idx_proyectos_status_created ON proyectos(status, created_at);
CREATE INDEX IF NOT EXISTS idx_noticias_tipo_created ON noticias(tipo, created_at);
CREATE INDEX IF NOT EXISTS idx_entrevistas_status_created ON entrevistas(status, created_at);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_personas_active_nombre ON personas(nombre) WHERE NOT esta_eliminada;
CREATE INDEX IF NOT EXISTS idx_proyectos_active_titulo ON proyectos(titulo) WHERE NOT esta_eliminado;
CREATE INDEX IF NOT EXISTS idx_noticias_active_titulo ON noticias(titulo) WHERE NOT esta_eliminada;
CREATE INDEX IF NOT EXISTS idx_entrevistas_active_titulo ON entrevistas(titulo) WHERE NOT esta_eliminada;
CREATE INDEX IF NOT EXISTS idx_temas_active_nombre ON temas(nombre) WHERE NOT esta_eliminado;
CREATE INDEX IF NOT EXISTS idx_organizaciones_active_nombre ON organizaciones(nombre) WHERE NOT esta_eliminada;

-- Optimize full-text search indexes
DROP INDEX IF EXISTS idx_personas_search;
CREATE INDEX idx_personas_search ON personas USING gin(to_tsvector('spanish', 
  nombre || ' ' || 
  COALESCE(biografia, '') || ' ' || 
  COALESCE(categoria_principal, '')
));

DROP INDEX IF EXISTS idx_proyectos_search;
CREATE INDEX idx_proyectos_search ON proyectos USING gin(to_tsvector('spanish', 
  titulo || ' ' || 
  COALESCE(descripcion, '') || ' ' || 
  COALESCE(status::text, '')
));

DROP INDEX IF EXISTS idx_noticias_search;
CREATE INDEX idx_noticias_search ON noticias USING gin(to_tsvector('spanish', 
  titulo || ' ' || 
  COALESCE(contenido, '') || ' ' || 
  COALESCE(tipo::text, '')
)); 