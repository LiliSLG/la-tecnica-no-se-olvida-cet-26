import { TransformationOptions } from '../dataTransformer';

export const proyectoTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'nombre', targetField: 'nombre' },
    { sourceField: 'descripcion', targetField: 'descripcion' },
    { sourceField: 'objetivos', targetField: 'objetivos' },
    { sourceField: 'resultados', targetField: 'resultados' },
    
    // Status fields
    { sourceField: 'estado', targetField: 'estado' },
    { sourceField: 'fechaInicio', targetField: 'fecha_inicio' },
    { sourceField: 'fechaFin', targetField: 'fecha_fin' },
    { sourceField: 'fechaPublicacion', targetField: 'fecha_publicacion' },
    
    // Media fields
    { sourceField: 'imagenURL', targetField: 'imagen_url' },
    { sourceField: 'archivoPrincipalURL', targetField: 'archivo_principal_url' },
    { sourceField: 'archivosAdicionales', targetField: 'archivos_adicionales' },
    
    // Timestamps
    { sourceField: 'createdAt', targetField: 'created_at' },
    { sourceField: 'updatedAt', targetField: 'updated_at' },
    { sourceField: 'eliminadoEn', targetField: 'eliminado_en' },
    
    // Soft delete fields
    { sourceField: 'estaEliminado', targetField: 'esta_eliminado' },
    { sourceField: 'eliminadoPorUid', targetField: 'eliminado_por_uid' }
  ],
  
  timestampFields: [
    'created_at',
    'updated_at',
    'eliminado_en',
    'fecha_inicio',
    'fecha_fin',
    'fecha_publicacion'
  ],
  
  relationshipFields: [
    'temas',
    'personas',
    'organizaciones'
  ],
  
  requiredFields: [
    'nombre',
    'descripcion',
    'estado'
  ],
  
  defaultValues: {
    esta_eliminado: false,
    estado: 'borrador',
    archivos_adicionales: [],
    fecha_publicacion: null
  }
}; 