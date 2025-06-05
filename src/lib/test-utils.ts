import { render } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'
import { PersonasService } from '@/lib/supabase/services/personasService'
import { ProyectosService } from '@/lib/supabase/services/proyectosService'
import { CursosService } from '@/lib/supabase/services/cursosService'
import { OrganizacionesService } from '@/lib/supabase/services/organizacionesService'
import { Persona } from '@/lib/types/persona'
import { Proyecto } from '@/lib/types/proyecto'
import { Curso } from '@/lib/types/curso'
import { Organizacion } from '@/lib/types/organizacion'
import { supabase } from '@/lib/supabase/supabaseClient'

const customRender = (ui: ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }

// Mock services
vi.mock('./supabase/services/personasService')
vi.mock('./supabase/services/proyectosService')
vi.mock('./supabase/services/cursosService')
vi.mock('./supabase/services/organizacionesService')

// Mock data
export const mockPersona: Persona = {
  id: '1',
  email: 'test@example.com',
  nombre: 'Test',
  apellido: 'User',
  avatarUrl: 'https://example.com/avatar.jpg',
  estado: 'activo',
  categoriaPrincipal: 'estudiante',
  activo: true,
  esAdmin: false,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

export const mockProyecto: Proyecto = {
  id: '1',
  titulo: 'Test Project',
  descripcion: 'Test Description',
  archivoPrincipalUrl: 'https://example.com/project.pdf',
  estado: 'activo',
  activo: true,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

export const mockCurso: Curso = {
  id: '1',
  titulo: 'Test Course',
  descripcion: 'Test Description',
  nivel: 'beginner',
  duracion: 60,
  estado: 'activo',
  activo: true,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

export const mockOrganizacion: Organizacion = {
  id: '1',
  nombre: 'Test Organization',
  descripcion: 'Test Description',
  logoUrl: 'https://example.com/logo.png',
  sitioWeb: 'https://example.com',
  estado: 'activo',
  activo: true,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

// Mock service instances
export const mockPersonasService = new PersonasService(supabase)
export const mockProyectosService = new ProyectosService(supabase)
export const mockCursosService = new CursosService(supabase)
export const mockOrganizacionesService = new OrganizacionesService(supabase)

// Mock service methods
export const mockServiceMethods = {
  personas: {
    getById: vi.fn().mockResolvedValue({ success: true, data: mockPersona, error: null }),
    create: vi.fn().mockResolvedValue({ success: true, data: mockPersona, error: null }),
    update: vi.fn().mockResolvedValue({ success: true, data: mockPersona, error: null }),
    delete: vi.fn().mockResolvedValue({ success: true, data: null, error: null }),
  },
  proyectos: {
    getById: vi.fn().mockResolvedValue({ success: true, data: mockProyecto, error: null }),
    create: vi.fn().mockResolvedValue({ success: true, data: mockProyecto, error: null }),
    update: vi.fn().mockResolvedValue({ success: true, data: mockProyecto, error: null }),
    delete: vi.fn().mockResolvedValue({ success: true, data: null, error: null }),
  },
  cursos: {
    getById: vi.fn().mockResolvedValue({ success: true, data: mockCurso, error: null }),
    create: vi.fn().mockResolvedValue({ success: true, data: mockCurso, error: null }),
    update: vi.fn().mockResolvedValue({ success: true, data: mockCurso, error: null }),
    delete: vi.fn().mockResolvedValue({ success: true, data: null, error: null }),
  },
  organizaciones: {
    getById: vi.fn().mockResolvedValue({ success: true, data: mockOrganizacion, error: null }),
    create: vi.fn().mockResolvedValue({ success: true, data: mockOrganizacion, error: null }),
    update: vi.fn().mockResolvedValue({ success: true, data: mockOrganizacion, error: null }),
    delete: vi.fn().mockResolvedValue({ success: true, data: null, error: null }),
  },
}

// Apply mocks
Object.assign(mockPersonasService, mockServiceMethods.personas)
Object.assign(mockProyectosService, mockServiceMethods.proyectos)
Object.assign(mockCursosService, mockServiceMethods.cursos)
Object.assign(mockOrganizacionesService, mockServiceMethods.organizaciones) 