# 🗺️ ROADMAP COMPLETO - Módulo Personas
## 📋 Proyecto: "La Técnica no se Olvida" - CET N°26

### 🎯 **OBJETIVO PRINCIPAL**
Implementar módulo **Personas** completo siguiendo los **patrones perfeccionados de Noticias + Organizaciones**, incluyendo tanto la parte **admin** como la **pública**, con sistema de invitaciones, formularios con tabs y geolocalización.

---

## 🏗️ **FASE 1: FUNDACIÓN Y BD**

### ✅ **PASO 1A: Actualizaciones Base de Datos**

**🔧 Campos de verificación/invitación (siguiendo patrón Organizaciones):**
```sql
-- 1. Agregar campos de estado y invitación a personas
ALTER TABLE personas ADD COLUMN estado_verificacion VARCHAR DEFAULT 'sin_invitacion';
-- Estados: 'sin_invitacion', 'pendiente_aprobacion', 'invitacion_enviada', 'verificada', 'rechazada'

ALTER TABLE personas ADD COLUMN token_reclamacion VARCHAR UNIQUE;
ALTER TABLE personas ADD COLUMN fecha_aprobacion_admin TIMESTAMPTZ;
ALTER TABLE personas ADD COLUMN aprobada_por_admin_uid UUID REFERENCES personas(id);
ALTER TABLE personas ADD COLUMN fecha_ultima_invitacion TIMESTAMPTZ;

-- 2. Actualizar categorías simplificadas
ALTER TYPE categoria_principal_persona_enum RENAME TO categoria_principal_persona_enum_old;

CREATE TYPE categoria_principal_persona_enum AS ENUM (
  'docente_cet',              -- Staff/profesores del CET
  'estudiante_cet',           -- Estudiantes actuales  
  'ex_alumno_cet',            -- Graduados del CET
  'comunidad_activa',         -- Participan en proyectos
  'comunidad_general'         -- Registrados sin proyectos
);

-- Migrar datos existentes
ALTER TABLE personas ALTER COLUMN categoria_principal TYPE categoria_principal_persona_enum 
USING (
  CASE categoria_principal::text
    WHEN 'tutor_invitado' THEN 'comunidad_activa'::categoria_principal_persona_enum
    WHEN 'colaborador_invitado' THEN 'comunidad_activa'::categoria_principal_persona_enum
    WHEN 'autor_invitado' THEN 'comunidad_activa'::categoria_principal_persona_enum
    WHEN 'admin_plataforma' THEN 'comunidad_general'::categoria_principal_persona_enum
    ELSE categoria_principal::text::categoria_principal_persona_enum
  END
);

DROP TYPE categoria_principal_persona_enum_old;

-- 3. Índices para performance
CREATE INDEX idx_personas_categoria ON personas(categoria_principal);
CREATE INDEX idx_personas_estado_verificacion ON personas(estado_verificacion);
CREATE INDEX idx_personas_token ON personas(token_reclamacion);
CREATE INDEX idx_personas_areas_interes ON personas USING GIN(areas_de_interes_o_expertise);
CREATE INDEX idx_personas_email ON personas(email);
CREATE INDEX idx_personas_activo ON personas(activo);
```

### ✅ **PASO 1B: Schemas y Service Actualizados**
- [x] **Actualizar `/src/lib/schemas/personaSchema.ts`** con nuevos campos
- [ ] **Crear `/src/lib/supabase/services/personasService.ts`** siguiendo patrón Standalone
- [ ] **Implementar métodos específicos:** 
  - `getByCategoria()`, `getByCategoriaActiva()`, `getDisponiblesParaColaboracion()`
  - `aprobarParaInvitacion()`, `enviarInvitacion()`, `reclamarConToken()`
  - `promoverAComunidadActiva()` → para cuando acepta proyecto
- [ ] **Actualizar tipos** en constants con nuevas categorías

---

## 🔐 **FASE 2: SEGURIDAD Y PERMISOS**

### ✅ **PASO 2A: Implementar RLS Específico para Personas**
```sql
-- Personas: Visibilidad configurable por persona
CREATE POLICY "personas_select_visible" ON "public"."personas"
FOR SELECT TO public USING (
  is_admin() OR 
  auth.uid()::uuid = id OR  -- La propia persona
  (
    visibilidad_perfil = 'publico' AND is_deleted = false AND activo = true
  ) OR (
    visibilidad_perfil = 'solo_registrados_plataforma' 
    AND auth.role() = 'authenticated' 
    AND is_deleted = false AND activo = true
  )
);

-- INSERT: Solo admin o registro público
CREATE POLICY "personas_insert" ON "public"."personas"
FOR INSERT TO public WITH CHECK (
  is_admin() OR 
  (auth.role() = 'authenticated' AND categoria_principal = 'comunidad_general')
);

-- UPDATE: Admin + propia persona
CREATE POLICY "personas_update" ON "public"."personas"
FOR UPDATE TO public USING (
  is_admin() OR auth.uid()::uuid = id
);

-- DELETE: Solo admin (soft delete)
CREATE POLICY "personas_delete" ON "public"."personas"
FOR UPDATE TO public USING (is_admin());
```

### ✅ **PASO 2B: FK e Índices**
```sql
-- Foreign Keys auditoría
ALTER TABLE personas ADD CONSTRAINT fk_personas_created_by 
FOREIGN KEY (created_by_uid) REFERENCES personas(id);

-- Índices JSONB para ubicación y links
CREATE INDEX idx_personas_ubicacion ON personas USING GIN(ubicacion_residencial);
CREATE INDEX idx_personas_links ON personas USING GIN(links_profesionales);
```

---

## 💻 **FASE 3: IMPLEMENTACIÓN ADMIN (Client Components)**

### ✅ **PASO 3A: Páginas Admin**
- [ ] **`/src/app/admin/comunidad/page.tsx`** - Lista con DataTable (Client Component)
- [ ] **`/src/app/admin/comunidad/new/page.tsx`** - Crear persona (formulario con tabs)
- [ ] **`/src/app/admin/comunidad/[id]/edit/page.tsx`** - Editar persona
- [ ] **`/src/app/admin/comunidad/[id]/page.tsx`** - Vista detalle admin
- [ ] **`/src/app/admin/comunidad/pendientes/page.tsx`** - 🆕 Gestión de aprobaciones

### ✅ **PASO 3B: Componentes Admin**
- [ ] **`PersonasListPage.tsx`** - Lista reutilizable con filtros por categoría
- [ ] **`PersonaForm.tsx`** - **FORMULARIO CON TABS**:
  ```
  1. 🏷️ Básico → nombre, apellido, email, categoría, foto
  2. 📍 Ubicación → dirección, provincia, localidad (mock para mapa)
  3. 📞 Contacto → teléfono, links profesionales
  4. 🏢 Organizaciones → selector múltiple donde trabaja
  5. 🎓 CET → (solo para estudiante_cet/ex_alumno_cet)
  6. 💼 Profesional → (para el resto de categorías)
  ```
- [ ] **`PersonaDetailPage.tsx`** - Vista detalle con estado verificación
- [ ] **`AprobacionPersonaCard.tsx`** - 🆕 Card para aprobar/rechazar
- [ ] **Agregar rutas al AdminSidebar**

### ✅ **PASO 3C: Testing Admin Completo**
- [ ] **CRUD básico funcional**
- [ ] **Sistema de categorías** funcionando
- [ ] **Workflow aprobación** operativo
- [ ] **Validaciones Zod** funcionando
- [ ] **Formulario con tabs** responsive

---

## 🌐 **FASE 4: IMPLEMENTACIÓN PÚBLICA (Server Components)**

### ✅ **PASO 4A: Páginas Públicas**
- [ ] **`/src/app/(public)/personas/page.tsx`** - Lista pública (Server Component)
- [ ] **`/src/app/(public)/personas/[id]/page.tsx`** - Perfil público (Server Component)

### ✅ **PASO 4B: Componentes Públicos**
- [ ] **`PersonasPublicGrid.tsx`** - Grid personas públicas
- [ ] **`PersonaCard.tsx`** - Card presentacional
- [ ] **`PersonaDetail.tsx`** - Perfil público detallado
- [ ] **Filtros por categoría** y búsqueda
- [ ] **Respeto a visibilidad_perfil** en todos los componentes

### ✅ **PASO 4C: SEO y Performance**
- [ ] **`generateMetadata` en páginas de detalle**
- [ ] **Tipos `PersonaPublica`** (sin campos sensibles)
- [ ] **Queries optimizadas** para cargas públicas

---

## 🚀 **FASE 5: SISTEMA DE INVITACIONES Y REGISTRO**

### 🎯 **PASO 5A: Registro Público Simplificado**
- [ ] **`/registro` página pública**
  - Nombre + Apellido + Email + Contraseña
  - "¿Tienes relación con CET N°26?" → Si/No
  - Si → requiere aprobación admin → `pendiente_aprobacion`
  - No → `comunidad_general` automático
- [ ] **Auth con Google** integrado
- [ ] **Validación de email** obligatoria

### 🎯 **PASO 5B: Workflow de Invitaciones (Reutilizar de Organizaciones)**
- [ ] **Admin Dashboard - Sección "Personas Pendientes"**
  - Lista personas con `estado_verificacion = 'pendiente_aprobacion'`
  - Botón "Aprobar categoría" → cambia a `'invitacion_enviada'`
  - Botón "Rechazar" → cambia a `'rechazada'`
  - Botón "Reenviar invitación"

- [ ] **Sistema de emails automático:**
  - Reutilizar `emailService.ts` de organizaciones
  - Email con link: `https://app.com/completar-perfil?token=${token}`
  - Template con datos de la persona

### 🎯 **PASO 5C: Página de Completar Perfil**
- [ ] **`/completar-perfil` página pública**
  - Validar token (no expirado, persona existe)
  - Mostrar datos básicos ya cargados
  - Formulario completo con todos los tabs
  - Al confirmar: `estado_verificacion = 'verificada'`

### 🎯 **PASO 5D: Promoción Automática por Proyectos**
- [ ] **Trigger cuando acepta invitación a proyecto:**
  ```sql
  -- Función para promover automáticamente
  CREATE OR REPLACE FUNCTION promover_a_comunidad_activa()
  RETURNS trigger AS $$
  BEGIN
    UPDATE personas 
    SET categoria_principal = 'comunidad_activa'
    WHERE id = NEW.persona_id 
      AND categoria_principal = 'comunidad_general';
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trigger_promover_comunidad_activa
    AFTER INSERT ON proyecto_persona_rol
    FOR EACH ROW EXECUTE FUNCTION promover_a_comunidad_activa();
  ```

---

## 🗺️ **FASE 5E: GEOLOCALIZACIÓN (Implementación Evolutiva)**

### **Fase 5E.1: Dirección Simple (ACTUAL)**
- [ ] **Campo dirección de texto**
- [ ] **Selects para provincia/localidad**
- [ ] **Mock de mapa** (placeholder visual)

### **Fase 5E.2: Geocoding**
- [ ] **API para convertir dirección → lat/lng**
- [ ] **Guardar coordenadas en JSONB**
- [ ] **Validación de direcciones**

### **Fase 5E.3: Mapas Visuales**
- [ ] **Leaflet para mostrar ubicaciones**
- [ ] **Mapa en perfiles y formularios**
- [ ] **Marcadores por categoría**

### **Fase 5E.4: Filtros Geográficos NIVEL DIOS 🚀**
- [ ] **"Ver personas en radio de X km"**
- [ ] **Análisis de proximidad**
- [ ] **Heat maps de actividad por zona**

---

## 🔧 **FASE 6: SISTEMA DE PERMISOS AVANZADO**

### ✅ **PASO 6A: Hook usePermissions**
- [ ] **`/src/hooks/usePermissions.ts`**
  ```typescript
  export function usePermissions() {
    return {
      isAdmin: () => boolean,
      hasRole: (roleName: string) => boolean,
      canEditPersona: (personaId: string) => boolean,
      canViewPersona: (personaId: string) => boolean,
      hasProjectRole: (projectId: string, role: string) => boolean
    }
  }
  ```

### ✅ **PASO 6B: Interface Admin para Gestión Roles**
- [ ] **`/admin/roles/page.tsx`** - Gestión roles globales
- [ ] **`RolesManager.tsx`** - Asignar/revocar roles
- [ ] **Integration con persona_roles**

### ✅ **PASO 6C: RLS que Integre Roles**
- [ ] **Actualizar policies personas** para usar roles globales
- [ ] **Policies proyecto_persona_rol** con permisos granulares
- [ ] **Testing completo de permisos**

---

## 📈 **FASE 7: FUNCIONALIDADES PREMIUM**

### 📊 **PASO 7A: Analytics Dashboard**
- [ ] **Métricas de personas** por categoría
- [ ] **Personas más activas** (por proyectos)
- [ ] **Trending áreas** de expertise
- [ ] **Mapas de colaboración**

### 📈 **PASO 7B: Conectores con Otras Entidades**
- [ ] **Personas ↔ Proyectos** (roles y colaboraciones)
- [ ] **Personas ↔ Organizaciones** (empleados/miembros)
- [ ] **Personas ↔ Noticias** (autores/menciones)

---

## 🔄 **TAREAS PENDIENTES DE OTROS MÓDULOS**

### 🏢 **MEJORAS ORGANIZACIONES (Post-Personas)**
- [ ] **Información Productiva (Establecimientos Rurales):**
  - Tipo producción → ganadería, agricultura, mixto
  - Superficie → hectáreas
  - Ubicación campos → coordenadas
  - Actividades → cría, invernada, cultivos específicos
- [ ] **Mapas organizaciones** (mismo sistema que personas)
- [ ] **Dashboard organizacional mejorado** con datos de personas

### 📁 **MEJORAS PROYECTOS (Cuando lleguemos)**
- [ ] **Auto-sugerencias inteligentes:**
  ```
  👤 Selecciona: "Juan Pérez"
  🤖 "Juan está en: Campo La Esperanza. ¿Incluir en el proyecto?"
  
  🏢 Selecciona: "INTA Bariloche"  
  🤖 "¿Agregar personas de INTA? Dr. Smith, Dra. García..."
  ```
- [ ] **Formulario inteligente** con auto-sugerencias
- [ ] **Permisos colaborativos:** Org puede agregar archivos, NO modificar título
- [ ] **Vista organizacional:** "Proyectos donde participamos"
- [ ] **Mapas de proyectos** por ubicación de participantes

---

## ✅ **CRITERIOS DE FINALIZACIÓN POR FASE**

### **Fase 1-3 Completa:** ✅ MVP Admin Funcional
- CRUD completo admin con formularios tabs
- RLS implementado y testeado
- Validaciones funcionando
- Sistema categorías operativo

### **Fase 4 Completa:** ✅ MVP Público Funcional
- Perfiles públicos con SEO
- Respeto a visibilidad_perfil
- Filtros y búsqueda funcionando

### **Fase 5 Completa:** ✅ Funcionalidades Core
- Registro público simplificado
- Sistema invitaciones operativo
- Promoción automática por proyectos
- Geolocalización básica implementada

### **Fase 6 Completa:** ✅ Permisos Avanzados
- Hook usePermissions funcional
- Gestión roles globales
- RLS integrado con roles

### **Fase 7 Completa:** ✅ Funcionalidades Premium
- Analytics dashboard
- Conectores entre entidades
- Mapas avanzados

---

## 🔄 **NOTAS PARA CONTINUIDAD EN NUEVO CHAT**

### **Patrón de Referencia:**
- **Templates perfectos:** Módulos **Noticias** (100% completo) + **Organizaciones** (100% completo)
- **Estructura BD:** Ver `esquemas-base-datos.md`
- **Patrones arquitectónicos:** Ver `blueprint-arquitectonico.md`
- **RLS reference:** Ver `politicas-rls.md`
- **Sistema invitaciones:** Reutilizar de `organizacionesService.ts`

### **Comandos de Estado:**
```bash
# Para revisar progreso actual
git log --oneline | grep "personas"

# Para ver archivos implementados
find src -name "*persona*" -type f

# Verificar BD
psql -c "SELECT categoria_principal, COUNT(*) FROM personas GROUP BY categoria_principal;"
```

### **Checklist de Verificación:**
```
¿Schema actualizado? → Fase 1B
¿RLS implementado? → Fase 2A
¿Páginas admin funcionando? → Fase 3
¿Páginas públicas con SEO? → Fase 4
¿Sistema invitaciones? → Fase 5A-C
¿Registro público? → Fase 5A
¿Geolocalización básica? → Fase 5E
¿Sistema permisos? → Fase 6
```

## 🎯 **INICIO RECOMENDADO EN NUEVO CHAT:**

```
"Hola! Necesito continuar con la implementación del módulo Personas. 

Por favor:
1. Busca en project knowledge el roadmap de personas
2. Revisa qué fase hemos completado según el checklist
3. Continúa con el siguiente paso pendiente

Templates de referencia: 
- Módulo Noticias (100% completo) - para formularios y CRUD
- Módulo Organizaciones (100% completo) - para sistema invitaciones

Stack: Next.js 15 + Supabase + TypeScript + shadcn/ui

IMPORTANTE: Seguir patrón Client Components para admin y Server Components para público. Formulario con tabs responsive. Reutilizar sistema de invitaciones de organizaciones.
**⚡ IMPORTANTE - Optimización de Tokens:**
- ✅ **Solo artifact completo** para archivos nuevos o grandes reestructuras
- ✅ **Para cambios pequeños:** Dame solo el fragmento + ubicación exacta donde agregarlo
- ✅ **Formato preferido:** `// 🔧 AGREGAR después de línea X en archivo.ts:`"
```

---

*Roadmap creado: 05/07/25 - Módulo Personas con sistema híbrido*
*Proyecto: La Técnica no se Olvida - CET N°26*