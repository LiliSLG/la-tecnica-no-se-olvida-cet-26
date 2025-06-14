import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";
import { PostgrestQueryBuilder } from "@supabase/postgrest-js";

// Mock data for testing
export const mockData = [
  {
    id: "1",
    titulo: "Proyecto Test",
    descripcion: "Desc",
    archivo_principal_url: "https://test.com/file.pdf",
    status: "published" as const,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deleted_at: null,
    deleted_by_uid: null,
    is_deleted: false,
  },
];

// Create a mock query builder
const createMockQueryBuilder = () => {
  const mock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
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
  };

  // Add async methods that return Promises
  Object.assign(mock, {
    single: jest.fn().mockResolvedValue({ data: mockData[0], error: null }),
    insert: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve({ data: { ...mockData[0], ...data }, error: null })
      ),
    update: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve({ data: { ...mockData[0], ...data }, error: null })
      ),
    delete: jest.fn().mockResolvedValue({ data: null, error: null }),
  });

  return mock as unknown as PostgrestQueryBuilder<any, any, any, any>;
};

// Create a mock Supabase client
export const createMockSupabase = () => {
  const mockQueryBuilder = createMockQueryBuilder();
  const mockFrom = jest.fn().mockReturnValue(mockQueryBuilder);

  return {
    from: mockFrom,
  } as unknown as SupabaseClient<Database>;
};

// Export a default mock instance
export const mockSupabase = createMockSupabase();

// Mock the Supabase client module
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue(mockSupabase),
  SupabaseClient: jest.fn().mockImplementation(() => mockSupabase),
}));
