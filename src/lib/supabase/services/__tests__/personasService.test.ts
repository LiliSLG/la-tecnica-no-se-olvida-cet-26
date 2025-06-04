import { SupabaseClient } from '@supabase/supabase-js'
import { PersonasService } from '../personasService'
import { Database } from '../../types/database.types'
import { ValidationError } from '../../errors/types'
import { ServiceResult } from '../../types/serviceResult'
import { QueryOptions } from '../../types/service'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
} as unknown as SupabaseClient<Database>

// Test service class
class TestPersonasService extends PersonasService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  // Expose protected method for testing
  public testGetAllWithPagination(options: QueryOptions) {
    return this.getAllWithPagination(options)
  }
}

describe('PersonasService', () => {
  let service: TestPersonasService
  let mockQuery: any

  beforeEach(() => {
    mockQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      single: jest.fn(),
      throwOnError: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    }

    ;(mockSupabase.from as jest.Mock).mockReturnValue(mockQuery)
    service = new TestPersonasService(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all personas', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'John',
          email: 'john@example.com',
          foto_url: null,
          biografia: 'Test biography',
          categoria_principal: null,
          capacidades_plataforma: null,
          fecha_nacimiento: '1990-01-01',
          fecha_fallecimiento: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
        },
      ]
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.getAll()

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(result).toEqual({
        data: mockData,
        error: null,
      })
    })
  })

  describe('getById', () => {
    it('should fetch a persona by id', async () => {
      const mockData = {
        id: '1',
        nombre: 'John',
        email: 'john@example.com',
        foto_url: null,
        biografia: 'Test biography',
        categoria_principal: null,
        capacidades_plataforma: null,
        fecha_nacimiento: '1990-01-01',
        fecha_fallecimiento: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
      }
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.getById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual({
        data: mockData,
        error: null,
      })
    })
  })

  describe('create', () => {
    it('should create a persona', async () => {
      const mockData = {
        nombre: 'John',
        email: 'john@example.com',
        foto_url: null,
        biografia: 'Test biography',
        categoria_principal: null,
        capacidades_plataforma: null,
        fecha_nacimiento: '1990-01-01',
        fecha_fallecimiento: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        es_admin: false,
        esta_eliminada: false,
        eliminado_por_uid: null
      }
      const mockResponse = { id: '1', ...mockData }
      mockQuery.insert.mockResolvedValue({ data: [mockResponse], error: null })

      const result = await service.create(mockData)

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.insert).toHaveBeenCalledWith(mockData)
      expect(result).toEqual({
        data: mockResponse,
        error: null,
      })
    })

    it('should validate required fields', async () => {
      const mockData = {
        nombre: '',
        email: 'john@example.com',
        foto_url: null,
        biografia: 'Test biography',
        categoria_principal: null,
        capacidades_plataforma: null,
        fecha_nacimiento: '1990-01-01',
        fecha_fallecimiento: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        es_admin: false,
        esta_eliminada: false,
        eliminado_por_uid: null
      }

      const result = await service.create(mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'nombre',
          message: 'Name is required',
          value: '',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.insert).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update a persona', async () => {
      const mockData = {
        nombre: 'John Updated',
        email: 'john@example.com',
        foto_url: null,
        biografia: 'Updated biography',
        categoria_principal: null,
        capacidades_plataforma: null,
        fecha_nacimiento: '1990-01-01',
        fecha_fallecimiento: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
      }
      const mockResponse = { id: '1', ...mockData }
      mockQuery.update.mockResolvedValue({ data: [mockResponse], error: null })

      const result = await service.update('1', mockData)

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.update).toHaveBeenCalledWith(mockData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({
        data: mockResponse,
        error: null,
      })
    })

    it('should validate empty name', async () => {
      const mockData = {
        nombre: '',
        email: 'john@example.com',
        foto_url: null,
        biografia: 'Test biography',
        categoria_principal: null,
        capacidades_plataforma: null,
        fecha_nacimiento: '1990-01-01',
        fecha_fallecimiento: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
      }

      const result = await service.update('1', mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'nombre',
          message: 'Name cannot be empty',
          value: '',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete a persona', async () => {
      mockQuery.delete.mockResolvedValue({ data: null, error: null })

      const result = await service.delete('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({
        data: null,
        error: null,
      })
    })
  })

  describe('search', () => {
    it('should search personas by name or lastname', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'John',
          email: 'john@example.com',
          foto_url: null,
          biografia: 'Test biography',
          categoria_principal: null,
          capacidades_plataforma: null,
          fecha_nacimiento: '1990-01-01',
          fecha_fallecimiento: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
        },
      ]
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.search('John')

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.or).toHaveBeenCalledWith(
        'nombre.ilike.%John%,apellido.ilike.%John%'
      )
      expect(result).toEqual({
        data: mockData,
        error: null,
      })
    })
  })

  describe('getAllWithPagination', () => {
    it('should fetch paginated personas', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'John',
          email: 'john@example.com',
          foto_url: null,
          biografia: 'Test biography',
          categoria_principal: null,
          capacidades_plataforma: null,
          fecha_nacimiento: '1990-01-01',
          fecha_fallecimiento: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
          es_admin: false,
          esta_eliminada: false,
          eliminado_por_uid: null
        },
      ]
      const options: QueryOptions = {
        page: 1,
        pageSize: 10,
        sortBy: 'nombre',
        sortOrder: 'asc',
      }
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.testGetAllWithPagination(options)

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('nombre', { ascending: true })
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockQuery.offset).toHaveBeenCalledWith(0)
      expect(result).toEqual({
        data: mockData,
        error: null,
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
        },
      })
    })
  })
}) 