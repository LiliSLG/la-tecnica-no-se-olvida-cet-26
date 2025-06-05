import { ServiceResult, ServiceError } from '../../types/service';
import { Persona } from '@/types/persona';
import { Proyecto } from '@/types/proyecto';
import { Curso } from '@/types/curso';
import { Organizacion } from '@/types/organizacion';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
}

export interface TransformationOptions {
  fieldMappings?: FieldMapping[];
  timestampFields?: string[];
  relationshipFields?: string[];
  requiredFields?: string[];
  defaultValues?: Record<string, any>;
}

export interface TransformationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: any;
  }>;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string | null;
  };
}

export interface OldUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface OldProject {
  id: string;
  title: string;
  description: string | null;
  main_file_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_by_uid: string | null;
  deleted_at: string | null;
}

export interface OldCourse {
  id: string;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_by_uid: string | null;
  deleted_at: string | null;
}

export interface OldOrganization {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_by_uid: string | null;
  deleted_at: string | null;
}

export class DataTransformer {
  private progress: TransformationProgress;
  private options: Required<TransformationOptions>;

  constructor(options: TransformationOptions = {}) {
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    this.options = {
      fieldMappings: options.fieldMappings || [],
      timestampFields: options.timestampFields || [],
      relationshipFields: options.relationshipFields || [],
      requiredFields: options.requiredFields || [],
      defaultValues: options.defaultValues || {}
    };
  }

  private logProgress(message: string): void {
    console.log(`[DataTransformer] ${message}`);
  }

  private logError(id: string, error: any): void {
    console.error(`[DataTransformer] Error transforming ${id}:`, error);
    this.progress.errors.push({ id, error });
  }

  private validateRequiredFields(data: any, id: string): void {
    for (const field of this.options.requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Required field '${field}' is missing in document ${id}`);
      }
    }
  }

  private transformTimestamp(value: any): string | null {
    if (!value) return null;
    
    // Handle Firestore Timestamp
    if (value.toDate) {
      return value.toDate().toISOString();
    }
    
    // Handle ISO string
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return value;
    }
    
    // Handle Unix timestamp
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    
    return null;
  }

  private transformField(value: any, field: string): any {
    // Handle timestamps
    if (this.options.timestampFields.includes(field)) {
      return this.transformTimestamp(value);
    }

    // Handle relationships
    if (this.options.relationshipFields.includes(field)) {
      return value?.id || value;
    }

    return value;
  }

  private applyFieldMappings(data: any): any {
    const result: any = {};

    // Apply field mappings
    for (const mapping of this.options.fieldMappings) {
      const value = data[mapping.sourceField];
      if (value !== undefined) {
        result[mapping.targetField] = mapping.transform 
          ? mapping.transform(value)
          : this.transformField(value, mapping.sourceField);
      }
    }

    // Copy unmapped fields
    for (const key in data) {
      if (!this.options.fieldMappings.some(m => m.sourceField === key)) {
        result[key] = this.transformField(data[key], key);
      }
    }

    return result;
  }

  private applyDefaultValues(data: any): any {
    const result = { ...data };
    for (const [field, value] of Object.entries(this.options.defaultValues)) {
      if (result[field] === undefined || result[field] === null) {
        result[field] = value;
      }
    }
    return result;
  }

  public transform(data: any[], idField: string = 'id'): ServiceResult<any[]> {
    try {
      this.logProgress(`Starting transformation of ${data.length} items`);
      this.progress.total = data.length;
      
      const transformedData = data.map(item => {
        try {
          // Validate required fields
          this.validateRequiredFields(item, item[idField]);

          // Apply transformations
          let transformed = this.applyFieldMappings(item);
          transformed = this.applyDefaultValues(transformed);

          this.progress.successful++;
          return transformed;
        } catch (error) {
          this.logError(item[idField], error);
          this.progress.failed++;
          throw error;
        } finally {
          this.progress.processed++;
        }
      });

      this.logProgress(`Successfully transformed ${this.progress.successful} items`);
      return {
        data: transformedData,
        error: null
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'TRANSFORMATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during transformation',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public getProgress(): TransformationProgress {
    return { ...this.progress };
  }

  public resetProgress(): void {
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  static transformFirebaseUser(user: FirebaseUser): Partial<Persona> {
    return {
      id: user.uid,
      email: user.email || '',
      nombre: user.displayName?.split(' ')[0] || '',
      apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
      avatarUrl: user.photoURL,
      estado: 'activo',
      categoriaPrincipal: 'estudiante',
      activo: !user.disabled,
      esAdmin: false,
      creadoEn: user.metadata.creationTime,
      actualizadoEn: user.metadata.lastSignInTime || user.metadata.creationTime,
    };
  }

  static transformOldUser(user: OldUser): Partial<Persona> {
    return {
      id: user.id,
      email: user.email,
      nombre: user.first_name || '',
      apellido: user.last_name || '',
      avatarUrl: user.avatar_url,
      estado: 'activo',
      categoriaPrincipal: 'estudiante',
      activo: true,
      esAdmin: user.is_admin,
      creadoEn: user.created_at,
      actualizadoEn: user.updated_at,
    };
  }

  static transformOldProject(project: OldProject): Partial<Proyecto> {
    return {
      id: project.id,
      titulo: project.title,
      descripcion: project.description,
      archivoPrincipalUrl: project.main_file_url,
      estado: project.status === 'published' ? 'activo' : 'inactivo',
      activo: !project.is_deleted,
      creadoEn: project.created_at,
      actualizadoEn: project.updated_at,
      eliminadoPorUid: project.deleted_by_uid,
      eliminadoEn: project.deleted_at,
    };
  }

  static transformOldCourse(course: OldCourse): Partial<Curso> {
    return {
      id: course.id,
      titulo: course.title,
      descripcion: course.description,
      nivel: course.level,
      duracion: course.duration,
      estado: course.status === 'published' ? 'activo' : 'inactivo',
      activo: !course.is_deleted,
      creadoEn: course.created_at,
      actualizadoEn: course.updated_at,
      eliminadoPorUid: course.deleted_by_uid,
      eliminadoEn: course.deleted_at,
    };
  }

  static transformOldOrganization(org: OldOrganization): Partial<Organizacion> {
    return {
      id: org.id,
      nombre: org.name,
      descripcion: org.description,
      logoUrl: org.logo_url,
      sitioWeb: org.website,
      estado: org.status === 'active' ? 'activo' : 'inactivo',
      activo: !org.is_deleted,
      creadoEn: org.created_at,
      actualizadoEn: org.updated_at,
      eliminadoPorUid: org.deleted_by_uid,
      eliminadoEn: org.deleted_at,
    };
  }
} 