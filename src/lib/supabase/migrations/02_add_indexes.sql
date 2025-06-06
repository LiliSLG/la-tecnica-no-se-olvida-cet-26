-- Add indexes for soft delete columns
CREATE INDEX IF NOT EXISTS idx_personas_esta_eliminada ON personas(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_organizaciones_esta_eliminada ON organizaciones(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_temas_esta_eliminado ON temas(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_proyectos_esta_eliminado ON proyectos(esta_eliminado);
CREATE INDEX IF NOT EXISTS idx_noticias_esta_eliminada ON noticias(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_historias_orales_esta_eliminada ON historias_orales(esta_eliminada);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_esta_eliminada ON ofertas_laborales(esta_eliminada);

-- Add indexes for status/state columns
CREATE INDEX IF NOT EXISTS idx_proyectos_status ON proyectos(status);
CREATE INDEX IF NOT EXISTS idx_noticias_tipo ON noticias(tipo);
CREATE INDEX IF NOT EXISTS idx_historias_orales_estado ON historias_orales(estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_estado ON ofertas_laborales(estado);

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_personas_eliminado_por_uid ON personas(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_organizaciones_eliminado_por_uid ON organizaciones(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_temas_eliminado_por_uid ON temas(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_proyectos_eliminado_por_uid ON proyectos(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_noticias_eliminado_por_uid ON noticias(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_historias_orales_eliminado_por_uid ON historias_orales(eliminado_por_uid);
CREATE INDEX IF NOT EXISTS idx_ofertas_laborales_eliminado_por_uid ON ofertas_laborales(eliminado_por_uid);

-- Add indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_persona_tema_persona_id ON persona_tema(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tema_tema_id ON persona_tema(tema_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_proyecto_id ON proyecto_organizacion_rol(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_organizacion_rol_organizacion_id ON proyecto_organizacion_rol(organizacion_id); 