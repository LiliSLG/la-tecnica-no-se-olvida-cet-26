import { TransformationOptions } from '../dataTransformer';

export const personaTransformationConfig: TransformationOptions = {
  fieldMappings: [
    // Basic fields
    { sourceField: 'nombre', targetField: 'nombre' },
    { sourceField: 'apellido', targetField: 'apellido' },
    { sourceField: 'email', targetField: 'email' },
    { sourceField: 'telefono', targetField: 'telefono' },
    { sourceField: 'biografia', targetField: 'biografia' },
    { sourceField: 'fotoURL', targetField: 'foto_url' },
    
    // Admin fields
    { sourceField: 'esAdmin', targetField: 'es_admin' },
    { sourceField: 'esAdminSistema', targetField: 'es_admin_sistema' },
    
    // Category fields
    { sourceField: 'categoriaPrincipal', targetField: 'categoria_principal' },
    { sourceField: 'capacidadesPlataforma', targetField: 'capacidades_plataforma' },
    
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
    'apellido',
    'email'
  ],
  
  defaultValues: {
    es_admin: false,
    es_admin_sistema: false,
    esta_eliminada: false,
    categoria_principal: 'otro',
    capacidades_plataforma: []
  }
}; 