// Mock Redis client
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest
      .fn()
      .mockResolvedValue(JSON.stringify({ data: null, error: null })),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
    info: jest
      .fn()
      .mockResolvedValue("redis_version:6.0.0\nconnected_clients:1"),
  }));
});

jest.mock("../../../redis/client", () => ({
  redisClient: {
    getClient: jest.fn(() => ({
      on: jest.fn(),
      connect: jest.fn(),
      quit: jest.fn(),
      get: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ data: null, error: null })),
      set: jest.fn().mockResolvedValue("OK"),
      del: jest.fn().mockResolvedValue(1),
      info: jest
        .fn()
        .mockResolvedValue("redis_version:6.0.0\nconnected_clients:1"),
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

import { PersonasService } from "../personasService";
import { QueryOptions } from "../../types/service";

// Mock data
const mockCreateData = {
  nombre: "John",
  email: "john@example.com",
  foto_url: null,
  biografia: "Test biography",
  categoria_principal: null,
  capacidades_plataforma: null,
  fecha_nacimiento: "1990-01-01",
  fecha_fallecimiento: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  eliminado_en: null,
  es_admin: false,
  esta_eliminada: false,
  eliminado_por_uid: null,
};

// Factory para mockQuery dinámico
const createMockQuery = (overrideData = null) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  throwOnError: jest.fn().mockReturnThis(),

  single: jest.fn().mockResolvedValue({
    data: { id: "1", ...mockCreateData },
    error: null,
  }),

  then: jest.fn().mockImplementation((callback) =>
    Promise.resolve(
      callback({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
      })
    )
  ),

  // Si se pasa overrideData, usamos ese
  async: {
    data: overrideData ?? [{ id: "1", ...mockCreateData }],
    error: null,
  },
});

// Mock supabase client
let mockSupabase: { from: jest.Mock };

beforeEach(() => {
  mockSupabase = {
    from: jest.fn(() => createMockQuery()),
  };
});

// Test class
class TestPersonasService extends PersonasService {
  constructor(supabase: any) {
    super(supabase);
  }

  public testGetAllWithPagination(options: QueryOptions) {
    return this.getAllWithPagination(options);
  }
}

describe("PersonasService", () => {
  let service: TestPersonasService;

  beforeEach(() => {
    service = new TestPersonasService(mockSupabase);
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch all personas", async () => {
      const result = await service.getAll();
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        success: true,
      });
    });
  });

  describe("getById", () => {
    it("should fetch a persona by id", async () => {
      const result = await service.getById("1");
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: { id: "1", ...mockCreateData },
        error: null,
        success: true,
      });
    });
  });

  describe("create", () => {
    it("should create a persona", async () => {
      const result = await service.create(mockCreateData);
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: { id: "1", ...mockCreateData },
        error: null,
        success: true,
      });
    });

    it("should validate required fields", async () => {
      const invalidData = {
        ...mockCreateData,
        nombre: "",
      };

      const result = await service.create(invalidData);

      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: null,
        error: {
          field: "nombre",
          message: "Name is required",
          value: "",
          name: "ValidationError",
        },
        success: false,
      });
    });
  });

  describe("update", () => {
    it("should update a persona", async () => {
      const updatedData = {
        ...mockCreateData,
        nombre: "John Updated",
      };

      const result = await service.update("1", updatedData);
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: { id: "1", ...updatedData },
        error: null,
        success: true,
      });
    });

    it("should validate empty name", async () => {
      const invalidData = {
        ...mockCreateData,
        nombre: "",
      };

      const result = await service.update("1", invalidData);

      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: null,
        error: {
          field: "nombre",
          message: "Name cannot be empty",
          value: "",
          name: "ValidationError",
        },
        success: false,
      });
    });
  });

  describe("delete", () => {
    it("should delete a persona", async () => {
      const result = await service.delete("1");
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: true,
        error: null,
        success: true,
      });
    });
  });

  describe("search", () => {
    it("should search personas", async () => {
      const result = await service.search("John");
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        success: true,
      });
    });
  });

  describe("getAllWithPagination", () => {
    it("should fetch paginated personas", async () => {
      const options: QueryOptions = {
        page: 1,
        pageSize: 10,
        sortBy: "nombre",
        sortOrder: "asc",
      };

      const result = await service.testGetAllWithPagination(options);
      expect(mockSupabase.from).toHaveBeenCalledWith("personas");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
        },
        success: true,
      });
    });
  });
});
