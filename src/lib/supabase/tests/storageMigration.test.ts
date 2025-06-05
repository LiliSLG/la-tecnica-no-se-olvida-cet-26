import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageMigration } from '../scripts/migrations/storageMigration';
import { ProyectosService } from '../services/proyectosService';
import { CursosService } from '../services/cursosService';
import { OrganizacionesService } from '../services/organizacionesService';
import { ServiceError } from '../services/baseService';

// Mock services
vi.mock('../services/proyectosService');
vi.mock('../services/cursosService');
vi.mock('../services/organizacionesService');

describe('StorageMigration', () => {
  let proyectosService: ProyectosService;
  let cursosService: CursosService;
  let organizacionesService: OrganizacionesService;
  let migration: StorageMigration;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Initialize services
    proyectosService = new ProyectosService();
    cursosService = new CursosService();
    organizacionesService = new OrganizacionesService();

    // Initialize migration
    migration = new StorageMigration();
  });

  describe('getSourceData', () => {
    it('should return empty array when no data exists', async () => {
      const result = await migration.getSourceData();
      expect(result).toEqual([]);
    });

    it('should return array of storage items', async () => {
      const mockData = [
        { name: 'proyectos/1/main.pdf', size: 1000 },
        { name: 'cursos/1/material.pdf', size: 2000 },
        { name: 'organizaciones/1/logo.png', size: 500 },
      ];

      // Mock storage list
      vi.spyOn(migration['supabase'].storage, 'from').mockReturnValue({
        list: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      } as any);

      const result = await migration.getSourceData();
      expect(result).toEqual(mockData);
    });

    it('should handle storage errors', async () => {
      // Mock storage error
      vi.spyOn(migration['supabase'].storage, 'from').mockReturnValue({
        list: vi.fn().mockResolvedValue({ data: null, error: new Error('Storage error') }),
      } as any);

      await expect(migration.getSourceData()).rejects.toThrow('Storage error');
    });
  });

  describe('transformData', () => {
    it('should transform proyecto file data', async () => {
      const fileData = {
        name: 'proyectos/1/main.pdf',
        size: 1000,
      };

      const result = await migration.transformData(fileData);
      expect(result).toEqual({
        id: '1',
        tipo: 'proyecto',
        archivoUrl: 'proyectos/1/main.pdf',
        tamanio: 1000,
      });
    });

    it('should transform curso file data', async () => {
      const fileData = {
        name: 'cursos/1/material.pdf',
        size: 2000,
      };

      const result = await migration.transformData(fileData);
      expect(result).toEqual({
        id: '1',
        tipo: 'curso',
        archivoUrl: 'cursos/1/material.pdf',
        tamanio: 2000,
      });
    });

    it('should transform organizacion file data', async () => {
      const fileData = {
        name: 'organizaciones/1/logo.png',
        size: 500,
      };

      const result = await migration.transformData(fileData);
      expect(result).toEqual({
        id: '1',
        tipo: 'organizacion',
        archivoUrl: 'organizaciones/1/logo.png',
        tamanio: 500,
      });
    });
  });

  describe('validateData', () => {
    it('should validate proyecto file data', () => {
      const fileData = {
        name: 'proyectos/1/main.pdf',
        size: 1000,
      };

      expect(migration.validateData(fileData)).toBe(true);
    });

    it('should validate curso file data', () => {
      const fileData = {
        name: 'cursos/1/material.pdf',
        size: 2000,
      };

      expect(migration.validateData(fileData)).toBe(true);
    });

    it('should validate organizacion file data', () => {
      const fileData = {
        name: 'organizaciones/1/logo.png',
        size: 500,
      };

      expect(migration.validateData(fileData)).toBe(true);
    });

    it('should reject invalid file data', () => {
      const fileData = {
        name: 'invalid/path/file.pdf',
        size: 1000,
      };

      expect(migration.validateData(fileData)).toBe(false);
    });
  });

  describe('saveData', () => {
    it('should save proyecto file data', async () => {
      const fileData = {
        id: '1',
        tipo: 'proyecto',
        archivoUrl: 'proyectos/1/main.pdf',
        tamanio: 1000,
      };

      // Mock service update
      vi.spyOn(proyectosService, 'update').mockResolvedValue({
        success: true,
        data: { id: '1', archivoPrincipalUrl: 'proyectos/1/main.pdf' },
        error: null,
      });

      await migration.saveData(fileData);
      expect(proyectosService.update).toHaveBeenCalledWith('1', {
        archivoPrincipalUrl: 'proyectos/1/main.pdf',
      });
    });

    it('should save curso file data', async () => {
      const fileData = {
        id: '1',
        tipo: 'curso',
        archivoUrl: 'cursos/1/material.pdf',
        tamanio: 2000,
      };

      // Mock service update
      vi.spyOn(cursosService, 'update').mockResolvedValue({
        success: true,
        data: { id: '1', archivoPrincipalUrl: 'cursos/1/material.pdf' },
        error: null,
      });

      await migration.saveData(fileData);
      expect(cursosService.update).toHaveBeenCalledWith('1', {
        archivoPrincipalUrl: 'cursos/1/material.pdf',
      });
    });

    it('should save organizacion file data', async () => {
      const fileData = {
        id: '1',
        tipo: 'organizacion',
        archivoUrl: 'organizaciones/1/logo.png',
        tamanio: 500,
      };

      // Mock service update
      vi.spyOn(organizacionesService, 'update').mockResolvedValue({
        success: true,
        data: { id: '1', logoUrl: 'organizaciones/1/logo.png' },
        error: null,
      });

      await migration.saveData(fileData);
      expect(organizacionesService.update).toHaveBeenCalledWith('1', {
        logoUrl: 'organizaciones/1/logo.png',
      });
    });

    it('should handle service errors', async () => {
      const fileData = {
        id: '1',
        tipo: 'proyecto',
        archivoUrl: 'proyectos/1/main.pdf',
        tamanio: 1000,
      };

      // Mock service error
      vi.spyOn(proyectosService, 'update').mockResolvedValue({
        success: false,
        data: null,
        error: new ServiceError('Update failed'),
      });

      await expect(migration.saveData(fileData)).rejects.toThrow('Update failed');
    });
  });
}); 