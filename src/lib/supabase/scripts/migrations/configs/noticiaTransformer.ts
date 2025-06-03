import { TransformationOptions } from '../dataTransformer';

export const noticiaTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'titulo', targetField: 'titulo' },
    { sourceField: 'descripcion', targetField: 'descripcion' },
    { sourceField: 'contenido', targetField: 'contenido' },
    { sourceField: 'resumen', targetField: 'resumen' },
    
    // Type fields
    { sourceField: 'tipo', targetField: 'tipo' },
    { sourceField: 'fuente', targetField: 'fuente' },
    { sourceField: 'autor', targetField: 'autor' },
    { sourceField: 'fechaPublicacion', targetField: 'fecha_publicacion' },
    { sourceField: 'fechaNoticia', targetField: 'fecha_noticia' },
    
    // Media fields
    { sourceField: 'imagenURL', targetField: 'imagen_url' },
    { sourceField: 'archivoURL', targetField: 'archivo_url' },
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
    'fecha_publicacion',
    'fecha_noticia'
  ],
  
  relationshipFields: [
    'temas'
  ],
  
  requiredFields: [
    'titulo',
    'descripcion',
    'tipo'
  ],
  
  defaultValues: {
    esta_eliminada: false,
    tipo: 'articulo',
    archivos_adicionales: [],
    fecha_publicacion: null,
    fecha_noticia: null
  }
}; 