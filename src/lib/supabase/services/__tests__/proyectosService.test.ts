const createMockQuery = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),

  single: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: { id: "1", ...mockCreateData },
      error: null,
    })
  ),

  then: jest.fn().mockImplementation((callback) =>
    Promise.resolve(
      callback({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
      })
    )
  ),
});

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
      get: jest.fn().mockResolvedValue(null), // 🔥 ESTA LÍNEA
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


import { ProyectosService } from "../proyectosService";
import { QueryOptions } from "../../types/service";

// Mock data
const mockCreateData = {
  titulo: "Test Project",
  descripcion: "Test Description",
  archivo_principal_url: "https://test.com/file.pdf",
  status: "published" as const,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  eliminado_en: null,
  eliminado_por_uid: null,
  esta_eliminado: false,
};

// Mock query
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),

  // Caso para single() → para getById, create, update
  single: jest.fn().mockReturnValue(
    Promise.resolve({
      data: { id: "1", ...mockCreateData },
      error: null,
    })
  ),

  // Caso general para then() → para getAll, search, getByStatus
  then: jest.fn().mockImplementation((callback) =>
    Promise.resolve(
      callback({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
      })
    )
  ),

  // Para await directamente
  async: {
    data: [{ id: "1", ...mockCreateData }],
    error: null,
  },

  [Symbol.asyncIterator]: jest.fn(),
  [Symbol.toStringTag]: "Promise",
  catch: jest.fn(() =>
    Promise.resolve({
      data: [{ id: "1", ...mockCreateData }],
      error: null,
    })
  ),
  finally: jest.fn(),
};

const mockSupabase = {
  from: jest.fn().mockReturnValue(mockQuery),
};

// Mock data array to use in tests
const mockData = [
  {
    id: "1",
    ...mockCreateData,
  },
];

// Test class
class TestProyectosService extends ProyectosService {
  constructor(supabase: any) {
    super(supabase);
  }

  public getAllWithPagination(options: QueryOptions) {
    return super.getAllWithPagination(options);
  }
}

// Test suite
describe("ProyectosService", () => {
  let service: TestProyectosService;
  let mockSupabase: { from: jest.Mock };

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => createMockQuery()), // ✅ cada test recibe un mockQuery FRESCO
    };
    service = new TestProyectosService(mockSupabase);
    jest.clearAllMocks();
  });
  

  describe("getAll", () => {
    it("should return all projects", async () => {
      const result = await service.getAll();
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        success: true,
      });
    });
  });

  describe("getById", () => {
    it("should return a project by id", async () => {
      const result = await service.getById("1");
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: { id: "1", ...mockCreateData },
        error: null,
        success: true,
      });
    });
  });

  describe("create", () => {
    it("should create a new project", async () => {
      const result = await service.create(mockCreateData);
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: { id: "1", ...mockCreateData },
        error: null,
        success: true,
      });
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      const result = await service.update("1", mockCreateData);
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: { id: "1", ...mockCreateData },
        error: null,
        success: true,
      });
    });
  });

  describe("delete", () => {
    it("should delete a project", async () => {
      const result = await service.delete("1");
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: true,
        error: null,
        success: true,
      });
    });
  });

  describe("search", () => {
    it("should search projects", async () => {
      const result = await service.search("test");
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        success: true,
      });
    });
  });

  describe("getByStatus", () => {
    it("should return projects by status", async () => {
      const result = await service.getByStatus("published");
      expect(mockSupabase.from).toHaveBeenCalledWith("proyectos");
      expect(result).toEqual({
        data: [{ id: "1", ...mockCreateData }],
        error: null,
        success: true,
      });
    });
  });
});
