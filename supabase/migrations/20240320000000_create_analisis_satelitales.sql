-- Create analisis_satelitales table
CREATE TABLE IF NOT EXISTS analisis_satelitales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo_analisis TEXT NOT NULL,
    resumen TEXT,
    parametros_gee JSONB,
    imagen_grafico_url TEXT,
    datos_tabla JSONB,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    creado_por_uid UUID REFERENCES auth.users(id),
    CONSTRAINT valid_tipo_analisis CHECK (tipo_analisis IN ('NDVI', 'NDWI', 'NDMI', 'EVI', 'SAVI', 'MSAVI', 'NDSI', 'NDBI'))
);

-- Create index on proyecto_id for faster lookups
CREATE INDEX idx_analisis_satelitales_proyecto_id ON analisis_satelitales(proyecto_id);

-- Create index on creado_por_uid for faster lookups
CREATE INDEX idx_analisis_satelitales_creado_por_uid ON analisis_satelitales(creado_por_uid);

-- Add RLS policies
ALTER TABLE analisis_satelitales ENABLE ROW LEVEL SECURITY;

-- Policy for viewing (anyone can view)
CREATE POLICY "Allow public read access" ON analisis_satelitales
    FOR SELECT USING (true);

-- Policy for inserting (authenticated users only)
CREATE POLICY "Allow authenticated users to insert" ON analisis_satelitales
    FOR INSERT WITH CHECK (auth.uid() = creado_por_uid);

-- Policy for updating (only creator or admin)
CREATE POLICY "Allow creator or admin to update" ON analisis_satelitales
    FOR UPDATE USING (
        auth.uid() = creado_por_uid OR 
        auth.uid() IN (SELECT user_id FROM admin_users)
    );

-- Policy for deleting (only creator or admin)
CREATE POLICY "Allow creator or admin to delete" ON analisis_satelitales
    FOR DELETE USING (
        auth.uid() = creado_por_uid OR 
        auth.uid() IN (SELECT user_id FROM admin_users)
    ); 