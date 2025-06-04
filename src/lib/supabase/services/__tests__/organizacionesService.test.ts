import { SupabaseClient } from '@supabase/supabase-js'
import { OrganizacionesService } from '../organizacionesService'
import { Database } from '../../types/database.types'
import { ValidationError } from '../../errors/types'
import { ServiceResult } from '../../types/serviceResult'
import { QueryOptions } from '../../types/service'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
} as unknown as SupabaseClient<Database>

// Test service class
class TestOrganizacionesService extends OrganizacionesService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  // Expose protected method for testing
  public testGetAllWithPagination(options: QueryOptions) {
    return this.getAllWithPagination(options)
  }
}

describe('OrganizacionesService', () => {
  let service: TestOrganizacionesService
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
    service = new TestOrganizacionesService(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all organizaciones', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'Test Organization',
          descripcion: 'Test description',
          sitio_web: 'https://test.com',
          logo_url: 'https://test.com/logo.png',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
          esta_eliminada: false,
          eliminado_por_uid: null
        },
      ]
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.getAll()

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(result).toEqual({
        data: mockData,
        error: null,
      })
    })
  })

  describe('getById', () => {
    it('should fetch an organizacion by id', async () => {
      const mockData = {
        id: '1',
        nombre: 'Test Organization',
        descripcion: 'Test description',
        sitio_web: 'https://test.com',
        logo_url: 'https://test.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.getById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
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
    it('should create an organizacion', async () => {
      const mockData = {
        nombre: 'Test Organization',
        descripcion: 'Test description',
        sitio_web: 'https://test.com',
        logo_url: 'https://test.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }
      const mockResponse = { id: '1', ...mockData }
      mockQuery.insert.mockResolvedValue({ data: [mockResponse], error: null })

      const result = await service.create(mockData)

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
      expect(mockQuery.insert).toHaveBeenCalledWith(mockData)
      expect(result).toEqual({
        data: mockResponse,
        error: null,
      })
    })

    it('should validate required fields', async () => {
      const mockData = {
        descripcion: 'Test description',
        sitio_web: 'https://test.com',
        logo_url: 'https://test.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }

      const result = await service.create(mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'nombre',
          message: 'Name is required',
          value: undefined,
          name: 'ValidationError'
        },
      })
      expect(mockQuery.insert).not.toHaveBeenCalled()
    })

    it('should validate website URL format', async () => {
      const mockData = {
        nombre: 'Test Organization',
        descripcion: 'Test description',
        sitio_web: 'invalid-url',
        logo_url: 'https://test.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }

      const result = await service.create(mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'sitio_web',
          message: 'Invalid website URL format',
          value: 'invalid-url',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.insert).not.toHaveBeenCalled()
    })

    it('should validate logo URL format', async () => {
      const mockData = {
        nombre: 'Test Organization',
        descripcion: 'Test description',
        sitio_web: 'https://test.com',
        logo_url: 'invalid-url',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }

      const result = await service.create(mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'logo_url',
          message: 'Invalid logo URL format',
          value: 'invalid-url',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.insert).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update an organizacion', async () => {
      const mockData = {
        nombre: 'Updated Organization',
        descripcion: 'Updated description',
        sitio_web: 'https://updated.com',
        logo_url: 'https://updated.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
      }
      const mockResponse = { id: '1', ...mockData }
      mockQuery.update.mockResolvedValue({ data: [mockResponse], error: null })

      const result = await service.update('1', mockData)

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
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
        descripcion: 'Test description',
        sitio_web: 'https://test.com',
        logo_url: 'https://test.com/logo.png',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        eliminado_en: null,
        esta_eliminada: false,
        eliminado_por_uid: null
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
    it('should delete an organizacion', async () => {
      mockQuery.delete.mockResolvedValue({ data: null, error: null })

      const result = await service.delete('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual({
        data: null,
        error: null,
      })
    })
  })

  describe('search', () => {
    it('should search organizaciones by name', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'Test Organization',
          descripcion: 'Test description',
          sitio_web: 'https://test.com',
          logo_url: 'https://test.com/logo.png',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
          esta_eliminada: false,
          eliminado_por_uid: null
        },
      ]
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.search('Test')

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.ilike).toHaveBeenCalledWith('nombre', '%Test%')
      expect(result).toEqual({
        data: mockData,
        error: null,
      })
    })
  })

  describe('getAllWithPagination', () => {
    it('should fetch paginated organizaciones', async () => {
      const mockData = [
        {
          id: '1',
          nombre: 'Test Organization',
          descripcion: 'Test description',
          sitio_web: 'https://test.com',
          logo_url: 'https://test.com/logo.png',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          eliminado_en: null,
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

      expect(mockSupabase.from).toHaveBeenCalledWith('organizaciones')
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