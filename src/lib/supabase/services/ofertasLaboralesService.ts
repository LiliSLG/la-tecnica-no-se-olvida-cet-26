import { ServiceResult } from '../types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';

// Mock data for development
const MOCK_OFERTAS = [
  {
    id: '1',
    titulo: 'Desarrollador Frontend Senior',
    descripcion: 'Buscamos un desarrollador frontend con experiencia en React y TypeScript',
    empresa: 'TechCorp',
    ubicacion: 'Remoto',
    tipo_contrato: 'tiempo_completo',
    salario_min: 50000,
    salario_max: 70000,
    requisitos: ['React', 'TypeScript', '5+ años de experiencia'],
    beneficios: ['Seguro médico', 'Gimnasio', 'Horario flexible'],
    estado: 'activo',
    esta_eliminado: false,
    eliminado_por_uid: null,
    eliminado_en: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    titulo: 'Desarrollador Backend',
    descripcion: 'Buscamos un desarrollador backend con experiencia en Node.js y PostgreSQL',
    empresa: 'DataSystems',
    ubicacion: 'Híbrido',
    tipo_contrato: 'tiempo_completo',
    salario_min: 45000,
    salario_max: 65000,
    requisitos: ['Node.js', 'PostgreSQL', '3+ años de experiencia'],
    beneficios: ['Seguro médico', 'Bonos anuales', 'Capacitación'],
    estado: 'activo',
    esta_eliminado: false,
    eliminado_por_uid: null,
    eliminado_en: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

interface OfertaLaboral {
  id: string;
  titulo: string;
  descripcion: string | null;
  empresa: string;
  ubicacion: string;
  tipo_contrato: string;
  salario_min: number;
  salario_max: number;
  requisitos: string[];
  beneficios: string[];
  estado: string;
  esta_eliminado: boolean;
  eliminado_por_uid: string | null;
  eliminado_en: string | null;
  created_at: string;
  updated_at: string;
}

interface MappedOfertaLaboral {
  id: string;
  titulo: string;
  descripcion: string | null;
  empresa: string;
  ubicacion: string;
  tipoContrato: string;
  salarioMin: number;
  salarioMax: number;
  requisitos: string[];
  beneficios: string[];
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class OfertasLaboralesService {
  private ofertas: OfertaLaboral[];

  constructor() {
    this.ofertas = MOCK_OFERTAS;
  }

  private mapOfertaToDomain(oferta: OfertaLaboral): MappedOfertaLaboral {
    return {
      id: oferta.id,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      empresa: oferta.empresa,
      ubicacion: oferta.ubicacion,
      tipoContrato: oferta.tipo_contrato,
      salarioMin: oferta.salario_min,
      salarioMax: oferta.salario_max,
      requisitos: oferta.requisitos,
      beneficios: oferta.beneficios,
      estado: oferta.estado,
      activo: !oferta.esta_eliminado,
      eliminadoPorUid: oferta.eliminado_por_uid,
      eliminadoEn: oferta.eliminado_en,
      creadoEn: oferta.created_at,
      actualizadoEn: oferta.updated_at
    };
  }

  private mapOfertasToDomain(ofertas: OfertaLaboral[]): MappedOfertaLaboral[] {
    return ofertas.map(oferta => this.mapOfertaToDomain(oferta));
  }

  async getById(id: string): Promise<ServiceResult<MappedOfertaLaboral | null>> {
    try {
      const oferta = this.ofertas.find(o => o.id === id);
      if (!oferta) {
        return createSuccessResult(null);
      }
      return createSuccessResult(this.mapOfertaToDomain(oferta));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener la oferta laboral',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      if (!ids.length) {
        return createSuccessResult([]);
      }

      const ofertas = this.ofertas.filter(o => ids.includes(o.id));
      return createSuccessResult(this.mapOfertasToDomain(ofertas));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las ofertas laborales',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      const ofertas = this.ofertas.filter(o => !o.esta_eliminado);
      return createSuccessResult(this.mapOfertasToDomain(ofertas));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las ofertas laborales públicas',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async search(term: string): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      if (!term.trim()) {
        return createSuccessResult([]);
      }

      const searchTerm = term.toLowerCase().trim();
      const ofertas = this.ofertas.filter(o => 
        !o.esta_eliminado && (
          o.titulo.toLowerCase().includes(searchTerm) ||
          (o.descripcion?.toLowerCase().includes(searchTerm) ?? false) ||
          o.empresa.toLowerCase().includes(searchTerm) ||
          o.ubicacion.toLowerCase().includes(searchTerm)
        )
      );

      return createSuccessResult(this.mapOfertasToDomain(ofertas));
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al buscar ofertas laborales',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 