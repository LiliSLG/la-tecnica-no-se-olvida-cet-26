import { SupabaseClient } from '@supabase/supabase-js';
import { ProyectosService } from '../proyectosService';
import { Database } from '../../types/database.types';
import { ValidationError } from '../../errors/types';
import { QueryOptions } from '../../types/service';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    quit: jest.fn(),
  }));
});
jest.mock('../../../redis/client', () => ({
  redisClient: {
    getClient: jest.fn(() => ({
      on: jest.fn(),
      connect: jest.fn(),
      quit: jest.fn(),
    })),
    getSubscriber: jest.fn(() => ({
      on: jest.fn(),
      connect: jest.fn(),
      quit: jest.fn(),
    })),
    connect: jest.fn(),
    disconnect: jest.fn(),
    isReady: jest.fn(() => true),
  },
}));

// Mock data
const mockData = [
  {
    id: '1',
    titulo: 'Proyecto Test',
    descripcion: 'Desc',
    archivo_principal_url: 'https://test.com/file.pdf',
    status: 'published' as const,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    eliminado_en: null,
    eliminado_por_uid: null,
    esta_eliminado: false,
  },
];

// Define the mock query type
type MockQuery = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  offset: jest.Mock;
  single: jest.Mock;
  textSearch: jest.Mock;
  filter: jest.Mock;
  is: jest.Mock;
  not: jest.Mock;
  or: jest.Mock;
  and: jest.Mock;
  in: jest.Mock;
  contains: jest.Mock;
  range: jest.Mock;
  match: jest.Mock;
  like: jest.Mock;
  ilike: jest.Mock;
  then: jest.Mock;
};

// Mock Supabase client
const createMockQuery = (): MockQuery => {
  const mock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
  } as MockQuery;

  // Add then method that returns a Promise
  mock.then = jest.fn().mockImplementation((callback: (result: { data: any; error: any }) => void) => {
    return Promise.resolve(callback({ data: mockData, error: null }));
  });

  return mock;
};

const mockQuery = createMockQuery();
const mockSupabase = {
  from: jest.fn().mockReturnValue(mockQuery),
} as unknown as SupabaseClient<Database>;

// Test service class to expose protected methods
class TestProyectosService extends ProyectosService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase);
  }
  public getAllWithPagination(options: QueryOptions) {
    return super.getAllWithPagination(options);
  }
}

describe('ProyectosService', () => {
  let service: TestProyectosService;

  beforeEach(() => {
    service = new TestProyectosService(mockSupabase);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all proyectos', async () => {
      const result = await service.getAll();
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.select).toHaveBeenCalled();
      expect(result).toEqual({ data: mockData, error: null, success: true });
    });
  });

  describe('getById', () => {
    it('should fetch a proyecto by id', async () => {
      const result = await service.getById('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result).toEqual({ data: mockData[0], error: null, success: true });
    });
  });

  describe('create', () => {
    it('should create a proyecto', async () => {
      const mockData = {
        titulo: 'Proyecto Test',
        descripcion: 'Desc',
        archivo_principal_url: 'https://test.com/file.pdf',
        status: 'published' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        eliminado_por_uid: null,
        esta_eliminado: false,
      };
      const mockResponse = {
        id: '1',
        ...mockData,
      };

      // Override then implementation for this test
      mockQuery.then.mockImplementationOnce((callback: (result: { data: any; error: any }) => void) => {
        return Promise.resolve(callback({ data: mockResponse, error: null }));
      });

      const result = await service.create(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({ data: mockResponse, error: null, success: true });
    });

    it('should validate required fields', async () => {
      const mockData = {
        descripcion: 'Desc',
        archivo_principal_url: 'https://test.com/file.pdf',
        status: 'published' as const,
      };
      const result = await service.create(mockData as any);
      expect(result).toEqual({
        data: null,
        error: { field: 'titulo', message: 'El título es requerido' },
        success: false
      });
      expect(mockQuery.insert).not.toHaveBeenCalled();
    });

    it('should validate file URL format', async () => {
      const mockData = {
        titulo: 'Proyecto Test',
        descripcion: 'Desc',
        archivo_principal_url: 'invalid-url',
        status: 'published' as const,
      };
      const result = await service.create(mockData);
      expect(result).toEqual({
        data: null,
        error: { field: 'archivo_principal_url', message: 'URL de archivo inválida' },
        success: false
      });
      expect(mockQuery.insert).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a proyecto', async () => {
      const mockData = {
        titulo: 'Updated Title',
        descripcion: 'Updated Desc',
      };
      const mockResponse = {
        id: '1',
        ...mockData,
        archivo_principal_url: 'https://test.com/file.pdf',
        status: 'published' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        eliminado_por_uid: null,
        esta_eliminado: false,
      };

      // Override then implementation for this test
      mockQuery.then.mockImplementationOnce((callback: (result: { data: any; error: any }) => void) => {
        return Promise.resolve(callback({ data: mockResponse, error: null }));
      });

      const result = await service.update('1', mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.update).toHaveBeenCalledWith(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual({ data: mockResponse, error: null, success: true });
    });

    it('should validate empty title', async () => {
      const mockData = {
        titulo: '',
        descripcion: 'Updated Desc',
      };
      const result = await service.update('1', mockData);
      expect(result).toEqual({
        data: null,
        error: { field: 'titulo', message: 'El título no puede estar vacío' },
        success: false
      });
      expect(mockQuery.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a proyecto', async () => {
      // Override then implementation for this test
      mockQuery.then.mockImplementationOnce((callback: (result: { data: any; error: any }) => void) => {
        return Promise.resolve(callback({ data: null, error: null }));
      });

      const result = await service.delete('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual({ data: null, error: null, success: true });
    });
  });

  describe('search', () => {
    it('should search proyectos by query', async () => {
      // Override then implementation for this test
      mockQuery.then.mockImplementationOnce((callback: (result: { data: any; error: any }) => void) => {
        return Promise.resolve(callback({ data: mockData, error: null }));
      });

      const result = await service.search('Test');
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'Test');
      expect(result).toEqual({ data: mockData, error: null, success: true });
    });
  });

  describe('getAllWithPagination', () => {
    it('should fetch paginated proyectos', async () => {
      // Override then implementation for this test
      mockQuery.then.mockImplementationOnce((callback: (result: { data: any; error: any }) => void) => {
        return Promise.resolve(callback({ data: mockData, error: null }));
      });

      const result = await service.getAllWithPagination({ page: 1, limit: 10, sortBy: 'titulo', sortOrder: 'asc' });
      expect(mockSupabase.from).toHaveBeenCalledWith('proyectos');
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.order).toHaveBeenCalledWith('titulo', { ascending: true });
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual({ data: mockData, error: null, success: true });
    });
  });

  // Relationship methods (add/remove/get temas, personas, organizaciones)
  // ... Add similar tests for addTema, removeTema, getTemas, addPersona, removePersona, getPersonas, addOrganizacion, removeOrganizacion, getOrganizaciones
}); 