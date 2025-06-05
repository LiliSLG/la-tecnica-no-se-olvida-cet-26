import { ServiceResult } from '../types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';

// Mock data for development
const MOCK_CURSOS = [
  {
    id: '1',
    titulo: 'Introducción a la Programación',
    descripcion: 'Curso básico de programación para principiantes',
    nivel: 'principiante',
    duracion: 40,
    estado: 'activo',
    esta_eliminado: false,
    eliminado_por_uid: null,
    eliminado_en: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    titulo: 'Desarrollo Web Avanzado',
    descripcion: 'Curso avanzado de desarrollo web con React y Node.js',
    nivel: 'avanzado',
    duracion: 60,
    estado: 'activo',
    esta_eliminado: false,
    eliminado_por_uid: null,
    eliminado_en: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

interface Curso {
  id: string;
  titulo: string;
  descripcion: string | null;
  nivel: string;
  duracion: number;
  estado: string;
  esta_eliminado: boolean;
  eliminado_por_uid: string | null;
  eliminado_en: string | null;
  created_at: string;
  updated_at: string;
}

interface MappedCurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  nivel: string;
  duracion: number;
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class CursosService {
  private cursos: Curso[];

  constructor() {
    this.cursos = MOCK_CURSOS;
  }

  private mapCursoToDomain(curso: Curso): MappedCurso {
    return {
      id: curso.id,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      nivel: curso.nivel,
      duracion: curso.duracion,
      estado: curso.estado,
      activo: !curso.esta_eliminado,
      eliminadoPorUid: curso.eliminado_por_uid,
      eliminadoEn: curso.eliminado_en,
      creadoEn: curso.created_at,
      actualizadoEn: curso.updated_at
    };
  }

  private mapCursosToDomain(cursos: Curso[]): MappedCurso[] {
    return cursos.map(curso => this.mapCursoToDomain(curso));
  }

  async getById(id: string): Promise<ServiceResult<MappedCurso | null>> {
    try {
      const curso = this.cursos.find(c => c.id === id);
      if (!curso) {
        return createSuccessResult(null);
      }
      return createSuccessResult(this.mapCursoToDomain(curso));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener el curso',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedCurso[]>> {
    try {
      if (!ids.length) {
        return createSuccessResult([]);
      }

      const cursos = this.cursos.filter(c => ids.includes(c.id));
      return createSuccessResult(this.mapCursosToDomain(cursos));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener los cursos',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<MappedCurso[]>> {
    try {
      const cursos = this.cursos.filter(c => !c.esta_eliminado);
      return createSuccessResult(this.mapCursosToDomain(cursos));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener los cursos públicos',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async search(term: string): Promise<ServiceResult<MappedCurso[]>> {
    try {
      if (!term.trim()) {
        return createSuccessResult([]);
      }

      const searchTerm = term.toLowerCase().trim();
      const cursos = this.cursos.filter(c => 
        !c.esta_eliminado && (
          c.titulo.toLowerCase().includes(searchTerm) ||
          (c.descripcion?.toLowerCase().includes(searchTerm) ?? false)
        )
      );

      return createSuccessResult(this.mapCursosToDomain(cursos));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al buscar cursos',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 