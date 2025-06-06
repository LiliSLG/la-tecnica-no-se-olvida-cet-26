-- Enable Row Level Security
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historias_orales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas_laborales ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_tema ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_organizacion_rol ENABLE ROW LEVEL SECURITY;

-- Create policies for personas
CREATE POLICY "Personas are viewable by everyone" ON personas
    FOR SELECT USING (true);

CREATE POLICY "Personas are insertable by authenticated users" ON personas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Personas are updatable by admins" ON personas
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Personas are deletable by admins" ON personas
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for organizaciones
CREATE POLICY "Organizaciones are viewable by everyone" ON organizaciones
    FOR SELECT USING (true);

CREATE POLICY "Organizaciones are insertable by authenticated users" ON organizaciones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizaciones are updatable by admins" ON organizaciones
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Organizaciones are deletable by admins" ON organizaciones
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for temas
CREATE POLICY "Temas are viewable by everyone" ON temas
    FOR SELECT USING (true);

CREATE POLICY "Temas are insertable by authenticated users" ON temas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Temas are updatable by admins" ON temas
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Temas are deletable by admins" ON temas
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for proyectos
CREATE POLICY "Proyectos are viewable by everyone" ON proyectos
    FOR SELECT USING (true);

CREATE POLICY "Proyectos are insertable by authenticated users" ON proyectos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Proyectos are updatable by admins" ON proyectos
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Proyectos are deletable by admins" ON proyectos
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for noticias
CREATE POLICY "Noticias are viewable by everyone" ON noticias
    FOR SELECT USING (true);

CREATE POLICY "Noticias are insertable by authenticated users" ON noticias
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Noticias are updatable by admins" ON noticias
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Noticias are deletable by admins" ON noticias
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for historias_orales
CREATE POLICY "Historias orales are viewable by everyone" ON historias_orales
    FOR SELECT USING (true);

CREATE POLICY "Historias orales are insertable by authenticated users" ON historias_orales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Historias orales are updatable by admins" ON historias_orales
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Historias orales are deletable by admins" ON historias_orales
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for ofertas_laborales
CREATE POLICY "Ofertas laborales are viewable by everyone" ON ofertas_laborales
    FOR SELECT USING (true);

CREATE POLICY "Ofertas laborales are insertable by authenticated users" ON ofertas_laborales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Ofertas laborales are updatable by admins" ON ofertas_laborales
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Ofertas laborales are deletable by admins" ON ofertas_laborales
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

-- Create policies for junction tables
CREATE POLICY "Persona tema relations are viewable by everyone" ON persona_tema
    FOR SELECT USING (true);

CREATE POLICY "Persona tema relations are insertable by admins" ON persona_tema
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Persona tema relations are deletable by admins" ON persona_tema
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Proyecto organizacion rol relations are viewable by everyone" ON proyecto_organizacion_rol
    FOR SELECT USING (true);

CREATE POLICY "Proyecto organizacion rol relations are insertable by admins" ON proyecto_organizacion_rol
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true));

CREATE POLICY "Proyecto organizacion rol relations are deletable by admins" ON proyecto_organizacion_rol
    FOR DELETE USING (auth.uid() IN (SELECT id FROM personas WHERE es_admin = true)); 