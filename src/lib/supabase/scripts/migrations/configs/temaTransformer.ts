import { TransformationOptions } from '../dataTransformer';

export const temaTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'nombre', targetField: 'nombre' },
    { sourceField: 'descripcion', targetField: 'descripcion' },
    { sourceField: 'slug', targetField: 'slug' },
    
    // Category fields
    { sourceField: 'categoria', targetField: 'categoria' },
    { sourceField: 'subcategoria', targetField: 'subcategoria' },
    { sourceField: 'tags', targetField: 'tags' },
    
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
    'eliminado_en'
  ],
  
  relationshipFields: [
    'personas',
    'organizaciones',
    'proyectos',
    'entrevistas',
    'noticias'
  ],
  
  requiredFields: [
    'nombre',
    'slug'
  ],
  
  defaultValues: {
    esta_eliminado: false,
    tags: [],
    categoria: 'general',
    subcategoria: null
  }
}; 