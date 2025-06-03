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

-- Create policies for personas
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

-- Create policies for organizaciones
CREATE POLICY "Organizaciones are viewable by everyone"
    ON organizaciones FOR SELECT
    USING (NOT esta_eliminada);

CREATE POLICY "Organizaciones are insertable by authenticated users"
    ON organizaciones FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Organizaciones are updatable by admins"
    ON organizaciones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Organizaciones are deletable by admins"
    ON organizaciones FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create policies for temas
CREATE POLICY "Temas are viewable by everyone"
    ON temas FOR SELECT
    USING (NOT esta_eliminado);

CREATE POLICY "Temas are insertable by authenticated users"
    ON temas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Temas are updatable by admins"
    ON temas FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Temas are deletable by admins"
    ON temas FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create policies for proyectos
CREATE POLICY "Proyectos are viewable by everyone"
    ON proyectos FOR SELECT
    USING (NOT esta_eliminado);

CREATE POLICY "Proyectos are insertable by authenticated users"
    ON proyectos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Proyectos are updatable by admins or project members"
    ON proyectos FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        ) OR
        EXISTS (
            SELECT 1 FROM proyecto_persona_rol
            WHERE proyecto_id = id AND persona_id = auth.uid()
        )
    );

CREATE POLICY "Proyectos are deletable by admins"
    ON proyectos FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create policies for entrevistas
CREATE POLICY "Entrevistas are viewable by everyone"
    ON entrevistas FOR SELECT
    USING (NOT esta_eliminada);

CREATE POLICY "Entrevistas are insertable by authenticated users"
    ON entrevistas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Entrevistas are updatable by admins"
    ON entrevistas FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Entrevistas are deletable by admins"
    ON entrevistas FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create policies for noticias
CREATE POLICY "Noticias are viewable by everyone"
    ON noticias FOR SELECT
    USING (NOT esta_eliminada);

CREATE POLICY "Noticias are insertable by authenticated users"
    ON noticias FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Noticias are updatable by admins"
    ON noticias FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Noticias are deletable by admins"
    ON noticias FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Create policies for junction tables
CREATE POLICY "Junction tables are viewable by everyone"
    ON persona_tema FOR SELECT
    USING (true);

CREATE POLICY "Junction tables are insertable by admins"
    ON persona_tema FOR INSERT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Junction tables are updatable by admins"
    ON persona_tema FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Junction tables are deletable by admins"
    ON persona_tema FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Apply the same policies to other junction tables
CREATE POLICY "Junction tables are viewable by everyone"
    ON proyecto_tema FOR SELECT
    USING (true);

CREATE POLICY "Junction tables are insertable by admins"
    ON proyecto_tema FOR INSERT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Junction tables are updatable by admins"
    ON proyecto_tema FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

CREATE POLICY "Junction tables are deletable by admins"
    ON proyecto_tema FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM personas
            WHERE id = auth.uid() AND es_admin = true
        )
    );

-- Repeat for other junction tables (entrevista_tema, noticia_tema, proyecto_persona_rol, proyecto_organizacion_rol)
-- with the same policies 