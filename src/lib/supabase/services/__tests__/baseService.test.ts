import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from '../baseService'
import { Database } from '../../types/database.types'
import { ValidationError } from '../../errors/types'
import { ServiceResult } from '../../types/serviceResult'
import { QueryOptions } from '../../types/service'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
} as unknown as SupabaseClient<Database>

// Test entity type
type TestEntity = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Test service class
class TestService extends BaseService<TestEntity, 'personas'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'personas', {
      entityType: 'persona',
      ttl: 3600,
      prefix: 'test:'
    })
  }

  protected validateCreateInput(data: Partial<TestEntity>): ValidationError | null {
    if (!data.name) {
      return {
        field: 'name',
        message: 'Name is required',
        value: data.name,
        name: 'ValidationError'
      }
    }
    return null
  }

  protected validateUpdateInput(data: Partial<TestEntity>): ValidationError | null {
    if (data.name === '') {
      return {
        field: 'name',
        message: 'Name cannot be empty',
        value: data.name,
        name: 'ValidationError'
      }
    }
    return null
  }

  // Expose protected method for testing
  public testGetAllWithPagination(options: QueryOptions) {
    return this.getAllWithPagination(options)
  }
}

describe('BaseService', () => {
  let service: TestService
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
    }

    ;(mockSupabase.from as jest.Mock).mockReturnValue(mockQuery)
    service = new TestService(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all records', async () => {
      const mockData = [
        { id: '1', name: 'Test 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'Test 2', created_at: '2024-01-01', updated_at: '2024-01-01' },
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

    it('should handle errors', async () => {
      const mockError = new Error('Database error')
      mockQuery.select.mockResolvedValue({ data: null, error: mockError })

      const result = await service.getAll()

      expect(result).toEqual({
        data: null,
        error: mockError,
      })
    })
  })

  describe('getById', () => {
    it('should fetch a record by id', async () => {
      const mockData = { id: '1', name: 'Test 1', created_at: '2024-01-01', updated_at: '2024-01-01' }
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

    it('should handle not found', async () => {
      mockQuery.select.mockResolvedValue({ data: null, error: null })

      const result = await service.getById('1')

      expect(result).toEqual({
        data: null,
        error: null,
      })
    })
  })

  describe('create', () => {
    it('should create a record', async () => {
      const mockData = { 
        name: 'Test 1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
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

    it('should validate input', async () => {
      const mockData = { 
        name: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
      const result = await service.create(mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'name',
          message: 'Name is required',
          value: '',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.insert).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update a record', async () => {
      const mockData = { 
        name: 'Updated Test',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
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

    it('should validate input', async () => {
      const mockData = { 
        name: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
      const result = await service.update('1', mockData)

      expect(result).toEqual({
        data: null,
        error: {
          field: 'name',
          message: 'Name cannot be empty',
          value: '',
          name: 'ValidationError'
        },
      })
      expect(mockQuery.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete a record', async () => {
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

    it('should handle errors', async () => {
      const mockError = new Error('Database error')
      mockQuery.delete.mockResolvedValue({ data: null, error: mockError })

      const result = await service.delete('1')

      expect(result).toEqual({
        data: null,
        error: mockError,
      })
    })
  })

  describe('getAllWithPagination', () => {
    it('should fetch paginated records', async () => {
      const mockData = [
        { id: '1', name: 'Test 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'Test 2', created_at: '2024-01-01', updated_at: '2024-01-01' },
      ]
      const options: QueryOptions = {
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      }
      mockQuery.select.mockResolvedValue({ data: mockData, error: null })

      const result = await service.testGetAllWithPagination(options)

      expect(mockSupabase.from).toHaveBeenCalledWith('personas')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true })
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockQuery.offset).toHaveBeenCalledWith(0)
      expect(result).toEqual({
        data: mockData,
        error: null,
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 2,
        },
      })
    })
  })
}) 