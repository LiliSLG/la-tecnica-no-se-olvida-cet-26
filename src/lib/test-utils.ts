import { render } from '@testing-library/react'
import { ReactElement } from 'react'

const customRender = (ui: ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }

// Mock data generators
export const mockPersona = (overrides = {}) => ({
  id: '1',
  nombre: 'Test Person',
  apellido: 'Test Lastname',
  biografia: 'Test biography',
  fecha_nacimiento: '1990-01-01',
  fecha_fallecimiento: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockOrganizacion = (overrides = {}) => ({
  id: '1',
  nombre: 'Test Organization',
  descripcion: 'Test description',
  sitio_web: 'https://test.com',
  logo_url: 'https://test.com/logo.png',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockTema = (overrides = {}) => ({
  id: '1',
  nombre: 'Test Theme',
  descripcion: 'Test description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockProyecto = (overrides = {}) => ({
  id: '1',
  titulo: 'Test Project',
  descripcion: 'Test description',
  fecha_inicio: '2024-01-01',
  fecha_fin: null,
  estado: 'activo',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockNoticia = (overrides = {}) => ({
  id: '1',
  titulo: 'Test News',
  contenido: 'Test content',
  fecha_publicacion: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const mockEntrevista = (overrides = {}) => ({
  id: '1',
  titulo: 'Test Interview',
  descripcion: 'Test description',
  fecha_realizacion: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
}) 