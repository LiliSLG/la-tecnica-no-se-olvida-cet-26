import { TransformationOptions } from '../dataTransformer';

export const organizacionTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'nombre', targetField: 'nombre' },
    { sourceField: 'descripcion', targetField: 'descripcion' },
    { sourceField: 'tipo', targetField: 'tipo' },
    
    // Contact fields
    { sourceField: 'email', targetField: 'email' },
    { sourceField: 'telefono', targetField: 'telefono' },
    { sourceField: 'direccion', targetField: 'direccion' },
    { sourceField: 'ciudad', targetField: 'ciudad' },
    { sourceField: 'provincia', targetField: 'provincia' },
    { sourceField: 'pais', targetField: 'pais' },
    
    // Media fields
    { sourceField: 'logoURL', targetField: 'logo_url' },
    { sourceField: 'sitioWeb', targetField: 'sitio_web' },
    { sourceField: 'redesSociales', targetField: 'redes_sociales' },
    
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
    'eliminado_en'
  ],
  
  relationshipFields: [
    'temas',
    'proyectos',
    'entrevistas'
  ],
  
  requiredFields: [
    'nombre',
    'tipo'
  ],
  
  defaultValues: {
    esta_eliminada: false,
    redes_sociales: {},
    tipo: 'otro'
  }
}; 