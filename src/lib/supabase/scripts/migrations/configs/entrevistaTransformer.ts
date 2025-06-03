import { TransformationOptions } from '../dataTransformer';

export const entrevistaTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'titulo', targetField: 'titulo' },
    { sourceField: 'descripcion', targetField: 'descripcion' },
    { sourceField: 'resumen', targetField: 'resumen' },
    { sourceField: 'notas', targetField: 'notas' },
    
    // Status fields
    { sourceField: 'estado', targetField: 'estado' },
    { sourceField: 'fechaEntrevista', targetField: 'fecha_entrevista' },
    { sourceField: 'fechaPublicacion', targetField: 'fecha_publicacion' },
    { sourceField: 'duracion', targetField: 'duracion' },
    
    // Media fields
    { sourceField: 'videoURL', targetField: 'video_url' },
    { sourceField: 'transcripcionURL', targetField: 'transcripcion_url' },
    { sourceField: 'imagenURL', targetField: 'imagen_url' },
    { sourceField: 'archivosAdicionales', targetField: 'archivos_adicionales' },
    
    // Timestamps
    { sourceField: 'createdAt', targetField: 'created_at' },
    { sourceField: 'updatedAt', targetField: 'updated_at' },
    { sourceField: 'eliminadoEn', targetField: 'eliminado_en' },
    
    // Soft delete fields
    { sourceField: 'estaEliminada', targetField: 'esta_eliminada' },
    { sourceField: 'eliminadoPorUid', targetField: 'eliminado_por_uid' }
  ],
  
  timestampFields: [
    'created_at',
    'updated_at',
    'eliminado_en',
    'fecha_entrevista',
    'fecha_publicacion'
  ],
  
  relationshipFields: [
    'temas',
    'personas',
    'organizaciones'
  ],
  
  requiredFields: [
    'titulo',
    'descripcion',
    'estado'
  ],
  
  defaultValues: {
    esta_eliminada: false,
    estado: 'borrador',
    archivos_adicionales: [],
    fecha_publicacion: null,
    duracion: 0
  }
}; 