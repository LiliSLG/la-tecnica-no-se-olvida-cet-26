-- Add noticia_organizacion_rol table
CREATE TABLE IF NOT EXISTS noticia_organizacion_rol (
    noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    rol TEXT NOT NULL,
    PRIMARY KEY (noticia_id, organizacion_id)
);

-- Enable RLS
ALTER TABLE noticia_organizacion_rol ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Noticia organizacion roles are viewable by everyone"
    ON noticia_organizacion_rol FOR SELECT
    USING (true);

CREATE POLICY "Noticia organizacion roles are insertable by admins"
    ON noticia_organizacion_rol FOR INSERT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Noticia organizacion roles are updatable by admins"
    ON noticia_organizacion_rol FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Noticia organizacion roles are deletable by admins"
    ON noticia_organizacion_rol FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_noticia_organizacion_rol_noticia_id ON noticia_organizacion_rol(noticia_id);
CREATE INDEX IF NOT EXISTS idx_noticia_organizacion_rol_organizacion_id ON noticia_organizacion_rol(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_noticia_organizacion_rol_rol ON noticia_organizacion_rol(rol); 