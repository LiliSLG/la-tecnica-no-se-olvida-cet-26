# 📜 Reglas del Proyecto y Guía de Desarrollo

## 🎯 Workflow y Checklist de Desarrollo

Para asegurar consistencia, sigue este checklist antes de crear o modificar features:

1. **Revisar Blueprint Arquitectónico:** ¿Esta feature requiere un nuevo patrón arquitectónico o carpeta? Si es así, documéntalo ahí primero.
2. **Revisar Esquemas de Base de Datos:** ¿Cuál es la estructura exacta de datos con la que voy a trabajar?
3. **Ubicar la Carpeta Correcta:** Basado en la estructura definida en blueprint, ¿dónde debe vivir mi nuevo componente/servicio/página?
4. **Seguir el Patrón Correcto:** ¿Estoy creando un servicio? Debe seguir el "Standalone Service Pattern". ¿Una página admin? Debe usar `DataTable` y `useDataTableState`.
5. **Actualizar Documentación:** Si cambio algo significativo, actualizar los artifacts correspondientes.

## 💻 Reglas de Código y Calidad

### Type Safety
- **No `any` Types**: Uso de `any` está prohibido. Usar tipos TypeScript apropiados o `unknown`.
- **Strict Null Checks**: `strictNullChecks` debe estar habilitado en `tsconfig.json`.
- **Zod Schemas**: Usar Zod para validación runtime, especialmente para inputs de API y datos de formularios.

### Organización de Código & Patrones
- **Estructura de Archivos**: Seguir estrictamente la estructura definida en `blueprint.md`.
- **Patrón de Servicios**: Seguir estrictamente el "Standalone Service Pattern".
- **Hooks**: Hooks personalizados deben estar en `/src/hooks` y nombrarse `use[Name]`.

### Manejo de Errores
- Usar bloques `try-catch` para todas las operaciones async.
- Proveer mensajes de error claros y amigables (ej. via toasts).
- Logear errores en consola para debugging.

### Accesibilidad
- Usar HTML semántico.
- Asegurar que todos los elementos interactivos sean accesibles por teclado.
- Mantener contraste de color suficiente.

### Seguridad
- Validar todas las entradas de usuario.
- Usar Supabase Auth para autenticación.
- Implementar verificaciones de autorización para todas las rutas protegidas.
- Usar variables de entorno para todos los secretos.

## 🏗️ Patrones Arquitectónicos

### "Standalone" Service Pattern
Después de refactoring completo, el proyecto usa un patrón de servicios explícito, sin herencia:

```typescript
// ✅ Correcto - Standalone Service
export class EntidadService {
  private supabase = supabaseClient;

  // Tipos locales al inicio del archivo
  type Row = Database['public']['Tables']['entidad']['Row'];
  type Insert = Database['public']['Tables']['entidad']['Insert'];
  type Update = Database['public']['Tables']['entidad']['Update'];

  async getAll(): Promise<ServiceResult<Row[]>> {
    try {
      const { data, error } = await this.supabase
        .from('entidad')
        .select('*')
        .eq('is_deleted', false);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async create(data: Insert): Promise<ServiceResult<Row>> {
    try {
      const { data: result, error } = await this.supabase
        .from('entidad')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async update(id: string, data: Update): Promise<ServiceResult<Row>> {
    try {
      const { data: result, error } = await this.supabase
        .from('entidad')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async softDelete(id: string, deletedByUid: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('entidad')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by_uid: deletedByUid
        })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// Export singleton
export const entidadService = new EntidadService();
```

### Patrón Server Components + API Routes
- **Server Components**: Carga inicial de datos usando API routes
- **API Routes**: Manejan autenticación y lógica RLS
- **Ejemplo**: `app/admin/temas/page.tsx` → `app/api/admin/temas/route.ts` → `temasService`

### Patrones de Formularios

Patrón de Componentes Server vs Client

#### Regla de Oro: Server First
**Default a Server Components** para todas las páginas admin nuevas, excepto cuando se necesite interactividad específica del cliente.

#### Páginas ADMIN: Client Components (Patrón Establecido)
- ✅ **Páginas admin** (`/admin/entidades/page.tsx`) → Client Components con useEffect
- ✅ **Formularios complejos** → Client Components dedicados
- ✅ **Gestión estados** → useState + useEffect pattern
- **Razón**: Funcionamiento y UX fluida > SEO en área administrativa

#### Páginas PÚBLICAS: Server Components (SEO Prioritario)  
- ✅ **Listados públicos** (`/(public)/entidades/page.tsx`) → Server Components
- ✅ **Páginas de detalle públicas** → Server Components con metadata
- ✅ **SEO optimizado** → generateMetadata + renderizado server-side
- **Razón**: SEO y performance > interactividad inicial

#### Componentes que DEBEN ser Client Components
- ✅ **Formularios interactivos** (`EntidadForm.tsx`)
- ✅ **Modales y dialogs** (con `useState`)
- ✅ **Componentes con event handlers** (onClick, onChange)
- ✅ **Componentes que usan hooks** (useRouter, useAuth, useToast)
#### Debugging Server vs Client
- **Server logs:** Aparecen en terminal/console del servidor
- **Client logs:** Aparecen en DevTools del navegador
- **Prefijo recomendado:** `🔍 Server:` para logs del servidor, `🔍 Client:` para cliente

#### Formularios Modal (Entidades Simples)
- **Uso**: Entidades simples como Temas
- **Patrón**: Dialog modal con formulario dentro de la página de lista
- **Componentes**: `TemaForm.tsx` + `Dialog` de shadcn/ui

#### Formularios Página Dedicada (Entidades Complejas)
- **Uso**: Entidades complejas como Proyectos, Noticias
- **Patrón**: Páginas separadas para crear/editar
- **Rutas**: `/new` para crear, `/[id]/edit` para actualizar

## 🔐 Sistema de Seguridad

### Roles Globales (tabla persona_roles)
- **admin**: Acceso completo al sistema
- **moderator**: Capacidades de moderación de contenido
- **editor**: Creación y edición de contenido

### Roles por Proyecto (tabla proyecto_persona_rol)
- **autor**: Creador/dueño del proyecto
- **tutor**: Mentor del proyecto (puede ser de varios proyectos)
- **colaborador**: Acceso limitado de edición a proyectos específicos
- **revisor**: Permisos de revisión y feedback

### Función RPC is_admin()
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM persona_roles pr
    JOIN roles r ON pr.rol_id = r.id
    WHERE pr.persona_id = auth.uid()::uuid
    AND r.nombre = 'admin'
    AND pr.is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📋 Gestión de Documentación

### Archivos Críticos que Siempre Deben Actualizarse
- **Esquemas de Base de Datos**: La estructura de base de datos no debe alterarse sin actualizar este archivo primero.
- **Blueprint Arquitectónico**: Todos los cambios de arquitectura deben actualizarse aquí.
- **Políticas RLS**: Mantener status actualizado de cada tabla.
- **Plan de Implementación**: Roadmap y estado de desarrollo.

### Sistema de Commits y Changelog
- Usar commits descriptivos siguiendo conventional commits
- Mantener changelog actualizado con cada feature completada
- Para obtener texto de commit y changelog automático, escribir: **"✅ Done"**

## 🚀 Tipos de Usuario y Permisos Específicos

### Categorías de Persona (categoria_principal_persona_enum)

#### Docentes y Staff CET
- **docente_cet**: Profesores del CET, acceso completo a gestión académica
- **Permisos**: Crear/editar todos los proyectos de estudiantes, gestionar usuarios

#### Estudiantes y Ex-alumnos
- **estudiante_cet**: Estudiantes actuales del CET
- **ex_alumno_cet**: Graduados del CET
- **Permisos**: Crear/editar sus propios proyectos, colaborar en proyectos asignados

#### Roles de Mentores y Colaboradores
- **tutor_invitado**: Mentores externos o internos de proyectos
- **colaborador_invitado**: Personas que apoyan en desarrollo de proyectos
- **Permisos**: Acceso a proyectos específicos según asignación

#### Comunidad y Externos
- **productor_rural**: Productores agropecuarios locales
- **profesional_externo**: Profesionales de diversas áreas
- **investigador**: Investigadores académicos o independientes
- **comunidad_general**: Miembros de la comunidad local
- **Permisos**: Acceso de lectura, posible colaboración en proyectos específicos

### Flujo de Asignación de Roles
1. **Registro**: Usuario se registra con categoria_principal básica
2. **Verificación**: Admin verifica y asigna categoria_principal correcta
3. **Roles Globales**: Admin asigna roles globales si es necesario (tabla persona_roles)
4. **Roles por Proyecto**: Autores/tutores asignan colaboradores a proyectos específicos (tabla proyecto_persona_rol)

---

*Mantener estas reglas actualizadas asegura la consistencia y calidad del proyecto.*