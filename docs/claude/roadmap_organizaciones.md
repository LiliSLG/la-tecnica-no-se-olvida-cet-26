# 🗺️ ROADMAP COMPLETO - Módulo Organizaciones
## 📋 Proyecto: "La Técnica no se Olvida" - CET N°26

### 🎯 **OBJETIVO PRINCIPAL**
Implementar módulo **Organizaciones** completo siguiendo exactamente el **patrón perfecto de Noticias** que ya funciona 100%, incluyendo tanto la parte **admin** como la **pública**.

---

## 🏗️ **FASE 1: FUNDACIÓN Y BD (ACTUAL)**

### ✅ **PASO 1A: Actualizaciones Base de Datos** 

**🔧 Campos de verificación/reclamación:**
```sql
-- 1. Agregar campos de estado y reclamación
ALTER TABLE organizaciones ADD COLUMN estado_verificacion VARCHAR DEFAULT 'sin_invitacion';
-- Estados: 'sin_invitacion', 'pendiente_aprobacion', 'invitacion_enviada', 'verificada', 'rechazada'

ALTER TABLE organizaciones ADD COLUMN reclamada_por_uid UUID REFERENCES personas(id);
ALTER TABLE organizaciones ADD COLUMN fecha_reclamacion TIMESTAMPTZ;
ALTER TABLE organizaciones ADD COLUMN token_reclamacion VARCHAR UNIQUE;
ALTER TABLE organizaciones ADD COLUMN fecha_aprobacion_admin TIMESTAMPTZ;
ALTER TABLE organizaciones ADD COLUMN aprobada_por_admin_uid UUID REFERENCES personas(id);
ALTER TABLE organizaciones ADD COLUMN fecha_ultima_invitacion TIMESTAMPTZ;

-- 2. Crear tabla persona_organizacion (relación empleados/miembros)
CREATE TABLE persona_organizacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
  cargo TEXT, -- "Investigador Senior", "Director", "Productor"
  fecha_inicio DATE,
  fecha_fin DATE, -- NULL si aún trabaja ahí
  es_contacto_principal BOOLEAN DEFAULT false,
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_uid UUID REFERENCES personas(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_uid UUID REFERENCES personas(id),
  deleted_at TIMESTAMPTZ,
  deleted_by_uid UUID REFERENCES personas(id),
  is_deleted BOOLEAN DEFAULT false,
  UNIQUE(persona_id, organizacion_id, fecha_inicio) -- Una persona puede estar múltiples veces pero en fechas diferentes
);

-- 3. Actualizar campos obligatorios (solo si no están ya requeridos)
-- ALTER TABLE organizaciones ALTER COLUMN descripcion SET NOT NULL;
-- ALTER TABLE organizaciones ALTER COLUMN areas_de_interes SET NOT NULL;

-- 4. Agregar validaciones si no existen
ALTER TABLE organizaciones 
ADD CONSTRAINT organizaciones_email_format 
CHECK (email_contacto ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}

### ✅ **PASO 1B: Schemas y Tipos Actualizados**
- [x] **Crear `/src/lib/schemas/organizacionSchema.ts`** - Validación Zod ✅ COMPLETO
- [ ] **Actualizar schemas** con nuevos campos de verificación  
- [ ] **Regenerar `database.types.ts`** desde BD actualizada  
- [ ] **Crear tipos específicos** (OrganizacionConEstado, OrganizacionParaReclamar, etc.)

### ✅ **PASO 1C: Completar Service Actualizado**
- [x] **Estructura base de service** ✅ COMPLETO  
- [ ] **Remover `OrganizacionWithAuthor`** ❌ No aplica en modelo reclamación
- [ ] **Agregar métodos de verificación:**
  - `aprobarParaInvitacion(id, adminUid)` 
  - `enviarInvitacion(id)` 
  - `reclamarConToken(token, personaUid)`
  - `getOrganizacionesPendientesAprobacion()`
  - `getOrganizacionesDePersona(personaUid)`
- [ ] **Agregar PersonaOrganizacionService** para relaciones empleado/organización

---

## 🔐 **FASE 2: SEGURIDAD Y PERMISOS - MODELO RECLAMACIÓN**

### ✅ **PASO 2A: Implementar RLS (Nuevo modelo de ownership)**
```sql
-- 🚨 IMPORTANTE: Borrar políticas anteriores primero
ALTER TABLE organizaciones DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "organizaciones_select_visible" ON organizaciones;
DROP POLICY IF EXISTS "organizaciones_insert" ON organizaciones; 
DROP POLICY IF EXISTS "organizaciones_update" ON organizaciones;
DROP POLICY IF EXISTS "organizaciones_delete" ON organizaciones;

-- NUEVAS POLÍTICAS con modelo de reclamación

-- SELECT: Admin ve todo + Org reclamada ve la suya + Público ve verificadas
CREATE POLICY "organizaciones_select_new" ON "public"."organizaciones"
FOR SELECT TO public USING (
  is_admin() OR 
  auth.uid() = reclamada_por_uid OR
  (estado_verificacion = 'verificada' AND is_deleted = false)
);

-- INSERT: Solo admin puede crear organizaciones inicialmente  
CREATE POLICY "organizaciones_insert_admin" ON "public"."organizaciones"
FOR INSERT TO public WITH CHECK (is_admin());

-- UPDATE: Admin siempre + Organización que la reclamó (solo sus datos, no estado)
CREATE POLICY "organizaciones_update_owner" ON "public"."organizaciones"
FOR UPDATE TO public USING (
  is_admin() OR 
  (auth.uid() = reclamada_por_uid AND estado_verificacion = 'verificada')
);

-- DELETE: Solo admin
CREATE POLICY "organizaciones_delete_admin" ON "public"."organizaciones"  
FOR UPDATE TO public USING (is_admin());

-- Reactivar RLS
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
```

### ✅ **PASO 2B: RLS para persona_organizacion**
```sql
-- Políticas para tabla de relaciones persona-organización
ALTER TABLE persona_organizacion ENABLE ROW LEVEL SECURITY;

-- SELECT: Admin + personas relacionadas + organizaciones que reclaman
CREATE POLICY "persona_org_select" ON "public"."persona_organizacion"
FOR SELECT TO public USING (
  is_admin() OR 
  auth.uid() = persona_id OR
  EXISTS (
    SELECT 1 FROM organizaciones o 
    WHERE o.id = organizacion_id 
    AND o.reclamada_por_uid = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE: Solo admin por ahora
CREATE POLICY "persona_org_admin_only" ON "public"."persona_organizacion"
FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());
```

---

## 💻 **FASE 3: IMPLEMENTACIÓN ADMIN** 

### ✅ **PASO 3A: Páginas Admin Actualizadas**
- [x ] **`/src/app/admin/organizaciones/page.tsx`** - Lista con DataTable (Client Component)
- [x ] **`/src/app/admin/organizaciones/new/page.tsx`** - Crear org con explicación email
- [ ] **`/src/app/admin/organizaciones/[id]/edit/page.tsx`** - Editar + aprobar invitaciones
- [x ] **`/src/app/admin/organizaciones/[id]/page.tsx`** - Vista detalle con estado verificación
- [ ] **`/src/app/admin/organizaciones/pendientes/page.tsx`** - 🆕 Gestión de aprobaciones

### ✅ **PASO 3B: Componentes Admin Específicos**
- [ ] **`OrganizacionesListPage.tsx`** - Lista sin concepto de "autor" 
- [ ] **`OrganizacionForm.tsx`** - Formulario con explicación de invitaciones:
  ```tsx
  {emailContacto && (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Invitación automática</AlertTitle>
      <AlertDescription>
        Si cargas un email, enviaremos una invitación a esta organización 
        para que puedan crear su usuario y sumar información adicional 
        (archivos, fotos, documentos) a los proyectos donde participan.
      </AlertDescription>
    </Alert>
  )}
  ```
- [ ] **`OrganizacionDetailPage.tsx`** - Vista detalle con estados
- [ ] **`OrganizacionesPendientesPage.tsx`** - 🆕 Gestión aprobaciones
- [ ] **`AprobacionInvitacionCard.tsx`** - 🆕 Card para aprobar/rechazar

### ✅ **PASO 3C: Testing Admin Completo**
- [ ] **CRUD básico funcional**
- [ ] **Estados de verificación** funcionando
- [ ] **Workflow aprobación** operativo
- [ ] **Validaciones Zod** funcionando
- [ ] **No hay concepto de "autor"** de la organización

---

## 🌐 **FASE 4: IMPLEMENTACIÓN PÚBLICA (Server Components)**✅ SIGUIENTE

### ✅ **PASO 4A: Páginas Públicas**
- [ ] **`/src/app/(public)/organizaciones/page.tsx`** - Lista pública (Server Component)
- [ ] **`/src/app/(public)/organizaciones/[id]/page.tsx`** - Detalle público (Server Component)

### ✅ **PASO 4B: Componentes Públicos**
- [ ] **`/src/components/public/organizaciones/OrganizacionesPublicGrid.tsx`** - Grid públicas
- [ ] **`/src/components/public/organizaciones/OrganizacionCard.tsx`** - Card presentacional
- [ ] **`/src/components/public/organizaciones/OrganizacionDetail.tsx`** - Detalle público
- [ ] **Agregar filtros por tipo** y búsqueda

### ✅ **PASO 4C: SEO y Performance**
- [ ] **`generateMetadata` en páginas de detalle**
- [ ] **Tipos `OrganizacionPublica`** (sin campos admin)
- [ ] **Queries optimizadas** para cargas públicas

---

## 🚀 **FASE 5: SISTEMA DE INVITACIONES Y RECLAMACIÓN**

### 🎯 **PASO 5A: Workflow de Invitaciones**
- [ ] **Admin Dashboard - Sección "Organizaciones Pendientes"**
  - Lista organizaciones con `estado_verificacion = 'pendiente_aprobacion'`
  - Botón "Aprobar invitación" → cambia a `'invitacion_enviada'`
  - Botón "Rechazar" → cambia a `'rechazada'`
  - Botón "Reenviar invitación" (si hace >7 días de `fecha_ultima_invitacion`)

- [ ] **Generación de tokens seguros:**
  ```typescript
  // UUID + timestamp para expiración
  const token = `${uuidv4()}-${Date.now()}`;
  // Expira en 30 días
  ```

- [ ] **Sistema de emails automático:**
  - Servicio `emailService.ts` con templates
  - Email con link: `https://app.com/reclamar/organizacion?token=${token}`
  - Template profesional con info de la organización

### 🎯 **PASO 5B: Página de Reclamación**
- [ ] **`/reclamar/organizacion` página pública**
  - Validar token (no expirado, organización existe)
  - Mostrar datos de la organización a reclamar
  - Login/registro si no está autenticado
  - Formulario para completar datos faltantes
  - Al confirmar: `estado_verificacion = 'verificada'`

### 🎯 **PASO 5C: Dashboard Organización Verificada**
- [ ] **Rutas protegidas para organizaciones:**
  - `/organizacion/dashboard` - Vista general
  - `/organizacion/proyectos` - Proyectos donde participan
  - `/organizacion/perfil` - Editar datos de la organización
  - `/organizacion/miembros` - Gestionar empleados/miembros

- [ ] **Permisos de proyectos:**
  - Org verificada puede VER todos "sus" proyectos
  - Puede AGREGAR información y fotos 
  - NO puede modificar título/descripción/estado del proyecto

### 🎯 **PASO 5B: Geolocalización Básica (Fase 1)**
- [ ] **Estructura JSONB `ubicacion`:**
  ```json
  {
    "direccion_completa": "Ruta 40 Km 2140, Ingeniero Jacobacci",
    "coordenadas": { "lat": -41.123, "lng": -69.456 },
    "provincia": "Rio Negro", 
    "localidad": "Ingeniero Jacobacci",
    "codigo_postal": "8536"
  }
  ```
- [ ] **Validaciones formato** en schema Zod
- [ ] **Input estructura** para direcciones en formulario
- [ ] **Display organizado** en vistas públicas

### 🎯 **PASO 5C: Búsqueda y Filtros Avanzados**
- [ ] **Índices GIN** para full-text search en nombre y descripción
- [ ] **Filtro por provincia/localidad**
- [ ] **Filtro por áreas de interés**  
- [ ] **Búsqueda geográfica** por proximidad
- [ ] **API endpoints** para búsquedas AJAX

---

## 🗺️ **FASE 6: GEOLOCALIZACIÓN AVANZADA (Futuro)**

### 🌍 **PASO 6A: Selector de Mapa**
- [ ] **Integrar Leaflet.js** o Mapbox
- [ ] **Componente MapSelector** para formularios
- [ ] **Geocoding automático** de direcciones argentinas
- [ ] **Validación coordenadas** Argentina

### 🌍 **PASO 6B: Vistas de Mapa**
- [ ] **Mapa público** con todas las organizaciones
- [ ] **Clusters por región** 
- [ ] **Popups informativos** en marcadores
- [ ] **Filtros geográficos** interactivos

---

## 📊 **FASE 7: ANÁLISIS Y REPORTES (Futuro)**

### 📈 **PASO 7A: Dashboard Analytics**  
- [ ] **Estadísticas por tipo** de organización
- [ ] **Mapa de densidad** organizacional por región
- [ ] **Organizaciones más activas** (por colaboraciones)
- [ ] **Trending áreas** de interés

### 📈 **PASO 7B: Conectores con Otras Entidades**
- [ ] **Organizaciones ↔ Proyectos** (colaboraciones)
- [ ] **Organizaciones ↔ Personas** (empleados/miembros)
- [ ] **Organizaciones ↔ Noticias** (menciones/fuentes)

---

## ✅ **CRITERIOS DE FINALIZACIÓN POR FASE**

### **Fase 1-3 Completa:** ✅ MVP Admin Funcional
- CRUD completo admin
- RLS implementado y testeado
- Validaciones funcionando
- Soft delete operativo

### **Fase 4 Completa:** ✅ MVP Público Funcional  
- Listado público responsive
- Detalle público con SEO
- Filtros básicos funcionando

### **Fase 5 Completa:** ✅ Funcionalidades Core
- Sistema invitaciones operativo
- Geolocalización básica implementada
- Búsqueda avanzada funcional

### **Fase 6-7 Completa:** ✅ Funcionalidades Premium
- Mapas interactivos
- Analytics dashboard
- Conectores entre entidades

---

## 🔄 **NOTAS PARA CONTINUIDAD EN NUEVO CHAT**

### **Patrón de Referencia:**
- **Template perfecto:** Módulo **Noticias** (100% completo)
- **Estructura BD:** Ver `esquemas-base-datos.md`
- **Patrones arquitectónicos:** Ver `blueprint-arquitectonico.md` 
- **RLS reference:** Ver `politicas-rls.md`

### **Comandos de Estado:**
```bash
# Para revisar progreso actual
git log --oneline | grep "organizaciones"

# Para ver archivos implementados  
find src -name "*organizacion*" -type f
```

### **Checklist de Verificación:**
```
¿Existe organizacionSchema.ts? → Fase 1B
¿RLS implementado? → Fase 2A  
¿Páginas admin funcionando? → Fase 3
¿Páginas públicas con SEO? → Fase 4
¿Sistema invitaciones? → Fase 5A
¿Geolocalización básica? → Fase 5B
```

---

## 🎯 **INICIO RECOMENDADO EN NUEVO CHAT:**
-------------------------------------------------------------------------------------------
# BUG: ID mismatch en verificarConCuentaPersonal

Problema: El método crea usuarios con IDs diferentes al de auth.users
Causa: Lógica de signUp/signIn no maneja correctamente usuarios existentes
Solución pendiente: Revisar y corregir el método para usar consistentemente el mismo UUID
----------------------------------------------------------------------------------------
### 🔐 **MEJORA: Sistema de Roles para Acceso Dashboard**
**⏱️ Tiempo estimado: 45-60 min**

🎯 **Implementar verificación de roles específicos:**
- **Ubicación:** `/src/app/admin/ClientOnlyAdminContent.tsx` líneas 39-42
- **Lógica actual:** Todos los usuarios autenticados → dashboard
- **Lógica objetivo:** Solo usuarios con roles específicos → dashboard

```typescript
// Verificar roles específicos para dashboard
const tieneAccesoDashboard = user.roles?.some(rol => 
  ['tutor', 'autor', 'colaborador', 'estudiante_cet', 'docente_cet'].includes(rol)
);

if (tieneAccesoDashboard) {
  router.replace("/dashboard");
} else {
  router.replace("/"); // Usuarios sin roles → homepage público
}
-------------------------------------------------------------------------------------------
```
"Hola! Necesito continuar con la implementación del módulo Organizaciones.

Por favor: 
1. Busca en project knowledge el archivo roadmap_organizaciones.md
2. Estamos en la **XX** 
3. Revisa en el código que tenemos hecho y que está pendiente de Fase XX
4. Continúa con el siguiente paso pendiente

**⚡ IMPORTANTE - Optimización de Tokens:**
- ✅ **Solo artifact completo** para archivos nuevos o grandes reestructuras
- ✅ **Para cambios pequeños:** Dame solo el fragmento + ubicación exacta donde agregarlo
- ✅ **Formato preferido:** `// 🔧 AGREGAR después de línea X en archivo.ts:`

Template de referencia: Módulo Noticias (100% completo)
Stack: Next.js 15 + Supabase + TypeScript + shadcn/ui"
```

---

## 🧑‍💼 **ROADMAP PERSONAS - Consideraciones UX Híbrida**

### **🎯 Consideraciones Clave del Modelo Híbrido:**
- **Persona puede ser empleada de múltiples organizaciones**
- **Organizaciones pueden tener múltiples empleados**  
- **Auto-sugerencias** basadas en relaciones existentes
- **Dashboard dual** (perfil personal + organizaciones gestionadas)

### **📋 MVP Personas (Fase 1):**
- [ ] **CRUD básico personas** siguiendo patrón Client Components
- [ ] **Tabla `persona_organizacion`** funcionando 
- [ ] **Campo "Organizaciones relacionadas"** en formulario persona
- [ ] **RLS con visibilidad configurable**

### **📋 UX Híbrida Personas (Fase 2):**
- [ ] **Auto-completar organizaciones** al agregar persona a proyecto
- [ ] **Sugerir personas** al agregar organización a proyecto
- [ ] **Dashboard dual**: Toggle "Actuar como: [👤 Personal] [🏢 Organización X]"
- [ ] **Gestión empleados**: Persona puede agregar/editar miembros de sus organizaciones
- [ ] **Permisos contextuales**: Diferentes permisos según actúe como persona u organización

---

## 📁 **ROADMAP PROYECTOS - Integración Híbrida**

### **🎯 Consideraciones Clave del Modelo Híbrido:**
- **Formulario inteligente** con auto-sugerencias
- **Participantes duales**: Personas + Organizaciones  
- **Permisos granulares** para edición colaborativa
- **Vista organizacional** de "sus" proyectos

### **📋 MVP Proyectos (Fase 1):**
- [ ] **CRUD básico proyectos** siguiendo patrón Client Components
- [ ] **Sección "Organizaciones Participantes"** con selector + invitación
- [ ] **Sección "Personas Participantes"** con roles definidos
- [ ] **Integración básica** con `proyecto_organizacion_rol` y `proyecto_persona_rol`

### **📋 UX Híbrida Proyectos (Fase 2):**
- [ ] **Auto-sugerencias inteligentes:**
  ```
  👤 Selecciona: "Juan Pérez"
  🤖 "Juan está en: Campo La Esperanza. ¿Incluir en el proyecto?"
  
  🏢 Selecciona: "INTA Bariloche"  
  🤖 "¿Agregar personas de INTA? Dr. Smith, Dra. García..."
  ```
- [ ] **Permisos colaborativos**: 
  - Organización puede agregar archivos/fotos a "sus" proyectos
  - NO puede modificar título/descripción/estado  
- [ ] **Dashboard organizacional**: "Proyectos donde participamos"
- [ ] **Notificaciones**: Alertar organizaciones cuando son agregadas a proyectos

### **📋 Funcionalidades Avanzadas (Fase 3):**
- [ ] **Mapa de colaboraciones**: Visualizar red de personas ↔ organizaciones ↔ proyectos
- [ ] **Recomendaciones**: "Proyectos similares donde podrían participar"
- [ ] **Templates de colaboración**: Roles predefinidos por tipo de organización

--- OR email_contacto IS NULL);

ALTER TABLE organizaciones 
ADD CONSTRAINT organizaciones_url_format 
CHECK (sitio_web ~* '^https?://.*' OR sitio_web IS NULL);

ALTER TABLE organizaciones 
ADD CONSTRAINT organizaciones_telefono_argentina 
CHECK (telefono_contacto ~* '^\+?54[0-9\s\-()]{8,15}

### ✅ **PASO 1B: Schemas y Tipos**
- [ ] **Crear `/src/lib/schemas/organizacionSchema.ts`** (Zod validation)
- [ ] **Regenerar `database.types.ts`** desde BD actualizada  
- [ ] **Crear tipos específicos** (OrganizacionWithAuthor, CreateOrganizacion, etc.)

### ✅ **PASO 1C: Completar Service**
- [ ] **Completar `/src/lib/supabase/services/organizacionesService.ts`**
- [ ] **Implementar métodos faltantes** siguiendo patrón de noticiasService
- [ ] **Agregar métodos específicos:** `getByTipo()`, `getAbiertas()`, `getByUbicacion()`

---

## 🔐 **FASE 2: SEGURIDAD Y PERMISOS**

### ✅ **PASO 2A: Implementar RLS (4 políticas como Noticias)**
```sql
-- SELECT: Admin ve todo + Usuario ve abiertas + Anónimo ve abiertas  
CREATE POLICY "organizaciones_select_visible" ON "public"."organizaciones"
FOR SELECT TO public USING (
  is_admin() OR 
  auth.uid()::uuid = created_by_uid OR
  (is_deleted = false AND abierta_a_colaboraciones = true)
);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "organizaciones_insert" ON "public"."organizaciones"
FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Admin + autor
CREATE POLICY "organizaciones_update" ON "public"."organizaciones"
FOR UPDATE TO public USING (
  is_admin() OR auth.uid()::uuid = created_by_uid
);

-- DELETE: Solo admin
CREATE POLICY "organizaciones_delete" ON "public"."organizaciones"  
FOR UPDATE TO public USING (is_admin());
```

### ✅ **PASO 2B: Agregar FK e Índices**
```sql
-- Foreign Keys auditoría
ALTER TABLE organizaciones ADD CONSTRAINT fk_organizaciones_created_by 
FOREIGN KEY (created_by_uid) REFERENCES personas(id);

-- Índices básicos
CREATE INDEX idx_organizaciones_tipo ON organizaciones(tipo);
CREATE INDEX idx_organizaciones_abierta ON organizaciones(abierta_a_colaboraciones);
CREATE INDEX idx_organizaciones_areas ON organizaciones USING GIN(areas_de_interes);

-- Índices compuestos para queries públicas  
CREATE INDEX idx_organizaciones_publicas ON organizaciones(is_deleted, abierta_a_colaboraciones) 
WHERE is_deleted = false AND abierta_a_colaboraciones = true;
```

---

## 💻 **FASE 3: IMPLEMENTACIÓN ADMIN (Client Components)**

### ✅ **PASO 3A: Páginas Admin**
- [ ] **`/src/app/admin/organizaciones/page.tsx`** - Lista con DataTable (Client Component)
- [ ] **`/src/app/admin/organizaciones/new/page.tsx`** - Crear organización (formulario dedicado)
- [ ] **`/src/app/admin/organizaciones/[id]/edit/page.tsx`** - Editar organización  
- [ ] **`/src/app/admin/organizaciones/[id]/page.tsx`** - Vista detalle admin

### ✅ **PASO 3B: Componentes Admin**
- [ ] **`/src/components/admin/organizaciones/OrganizacionesListPage.tsx`** - Lista reutilizable
- [ ] **`/src/components/admin/organizaciones/OrganizacionForm.tsx`** - Formulario dedicado
- [ ] **`/src/components/admin/organizaciones/OrganizacionDetailPage.tsx`** - Vista detalle
- [ ] **Agregar rutas al AdminSidebar**

### ✅ **PASO 3C: Testing Admin**
- [ ] **CRUD completo funcional**
- [ ] **Validaciones Zod funcionando** 
- [ ] **Toggle `abierta_a_colaboraciones` con confirmación**
- [ ] **Soft delete funcional**

---

## 🌐 **FASE 4: IMPLEMENTACIÓN PÚBLICA (Server Components)**

### ✅ **PASO 4A: Páginas Públicas**
- [ ] **`/src/app/(public)/organizaciones/page.tsx`** - Lista pública (Server Component)
- [ ] **`/src/app/(public)/organizaciones/[id]/page.tsx`** - Detalle público (Server Component)

### ✅ **PASO 4B: Componentes Públicos**
- [ ] **`/src/components/public/organizaciones/OrganizacionesPublicGrid.tsx`** - Grid públicas
- [ ] **`/src/components/public/organizaciones/OrganizacionCard.tsx`** - Card presentacional
- [ ] **`/src/components/public/organizaciones/OrganizacionDetail.tsx`** - Detalle público
- [ ] **Agregar filtros por tipo** y búsqueda

### ✅ **PASO 4C: SEO y Performance**
- [ ] **`generateMetadata` en páginas de detalle**
- [ ] **Tipos `OrganizacionPublica`** (sin campos admin)
- [ ] **Queries optimizadas** para cargas públicas

---

## 🚀 **FASE 5: FUNCIONALIDADES AVANZADAS**

### 🎯 **PASO 5A: Sistema de Invitaciones (Opción A - Simple)**
- [ ] **Campo `estado_verificacion`** enum: `verificada`, `pendiente_confirmacion`, `rechazada`
- [ ] **Admin dashboard** para aprobar organizaciones pendientes
- [ ] **Email service** para enviar invitaciones  
- [ ] **Token de reclamación** para que organizaciones puedan editar su perfil
- [ ] **Badge de verificación** en UI pública

### 🎯 **PASO 5B: Geolocalización Básica (Fase 1)**
- [ ] **Estructura JSONB `ubicacion`:**
  ```json
  {
    "direccion_completa": "Ruta 40 Km 2140, Ingeniero Jacobacci",
    "coordenadas": { "lat": -41.123, "lng": -69.456 },
    "provincia": "Rio Negro", 
    "localidad": "Ingeniero Jacobacci",
    "codigo_postal": "8536"
  }
  ```
- [ ] **Validaciones formato** en schema Zod
- [ ] **Input estructura** para direcciones en formulario
- [ ] **Display organizado** en vistas públicas

### 🎯 **PASO 5C: Búsqueda y Filtros Avanzados**
- [ ] **Índices GIN** para full-text search en nombre y descripción
- [ ] **Filtro por provincia/localidad**
- [ ] **Filtro por áreas de interés**  
- [ ] **Búsqueda geográfica** por proximidad
- [ ] **API endpoints** para búsquedas AJAX

---

## 🗺️ **FASE 6: GEOLOCALIZACIÓN AVANZADA (Futuro)**

### 🌍 **PASO 6A: Selector de Mapa**
- [ ] **Integrar Leaflet.js** o Mapbox
- [ ] **Componente MapSelector** para formularios
- [ ] **Geocoding automático** de direcciones argentinas
- [ ] **Validación coordenadas** Argentina

### 🌍 **PASO 6B: Vistas de Mapa**
- [ ] **Mapa público** con todas las organizaciones
- [ ] **Clusters por región** 
- [ ] **Popups informativos** en marcadores
- [ ] **Filtros geográficos** interactivos

---

## 📊 **FASE 7: ANÁLISIS Y REPORTES (Futuro)**

### 📈 **PASO 7A: Dashboard Analytics**  
- [ ] **Estadísticas por tipo** de organización
- [ ] **Mapa de densidad** organizacional por región
- [ ] **Organizaciones más activas** (por colaboraciones)
- [ ] **Trending áreas** de interés

### 📈 **PASO 7B: Conectores con Otras Entidades**
- [ ] **Organizaciones ↔ Proyectos** (colaboraciones)
- [ ] **Organizaciones ↔ Personas** (empleados/miembros)
- [ ] **Organizaciones ↔ Noticias** (menciones/fuentes)

---

## ✅ **CRITERIOS DE FINALIZACIÓN POR FASE**

### **Fase 1-3 Completa:** ✅ MVP Admin Funcional
- CRUD completo admin
- RLS implementado y testeado
- Validaciones funcionando
- Soft delete operativo

### **Fase 4 Completa:** ✅ MVP Público Funcional  
- Listado público responsive
- Detalle público con SEO
- Filtros básicos funcionando

### **Fase 5 Completa:** ✅ Funcionalidades Core
- Sistema invitaciones operativo
- Geolocalización básica implementada
- Búsqueda avanzada funcional

### **Fase 6-7 Completa:** ✅ Funcionalidades Premium
- Mapas interactivos
- Analytics dashboard
- Conectores entre entidades

---



*Roadmap creado: 30/06/2025 - Módulo Organizaciones completo*
*Proyecto: La Técnica no se Olvida - CET N°26* OR telefono_contacto IS NULL);

-- 5. Índices para performance
CREATE INDEX idx_organizaciones_estado_verificacion ON organizaciones(estado_verificacion);
CREATE INDEX idx_organizaciones_reclamada_por ON organizaciones(reclamada_por_uid);
CREATE INDEX idx_organizaciones_token ON organizaciones(token_reclamacion);
CREATE INDEX idx_persona_org_persona_id ON persona_organizacion(persona_id);
CREATE INDEX idx_persona_org_organizacion_id ON persona_organizacion(organizacion_id);
```

**📝 NOTAS IMPORTANTES:**
- ✅ `proyecto_organizacion_rol` ya existe - NO crear
- ✅ `proyecto_persona_rol` ya existe - NO crear  
- ✅ `cooperativa` ya está en el enum - NO agregar
- 🆕 `persona_organizacion` es nueva - SÍ crear

### ✅ **PASO 1B: Schemas y Tipos**
- [ ] **Crear `/src/lib/schemas/organizacionSchema.ts`** (Zod validation)
- [ ] **Regenerar `database.types.ts`** desde BD actualizada  
- [ ] **Crear tipos específicos** (OrganizacionWithAuthor, CreateOrganizacion, etc.)

### ✅ **PASO 1C: Completar Service**
- [ ] **Completar `/src/lib/supabase/services/organizacionesService.ts`**
- [ ] **Implementar métodos faltantes** siguiendo patrón de noticiasService
- [ ] **Agregar métodos específicos:** `getByTipo()`, `getAbiertas()`, `getByUbicacion()`

---

## 🔐 **FASE 2: SEGURIDAD Y PERMISOS**

### ✅ **PASO 2A: Implementar RLS (4 políticas como Noticias)**
```sql
-- SELECT: Admin ve todo + Usuario ve abiertas + Anónimo ve abiertas  
CREATE POLICY "organizaciones_select_visible" ON "public"."organizaciones"
FOR SELECT TO public USING (
  is_admin() OR 
  auth.uid()::uuid = created_by_uid OR
  (is_deleted = false AND abierta_a_colaboraciones = true)
);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "organizaciones_insert" ON "public"."organizaciones"
FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Admin + autor
CREATE POLICY "organizaciones_update" ON "public"."organizaciones"
FOR UPDATE TO public USING (
  is_admin() OR auth.uid()::uuid = created_by_uid
);

-- DELETE: Solo admin
CREATE POLICY "organizaciones_delete" ON "public"."organizaciones"  
FOR UPDATE TO public USING (is_admin());
```

### ✅ **PASO 2B: Agregar FK e Índices**
```sql
-- Foreign Keys auditoría
ALTER TABLE organizaciones ADD CONSTRAINT fk_organizaciones_created_by 
FOREIGN KEY (created_by_uid) REFERENCES personas(id);

-- Índices básicos
CREATE INDEX idx_organizaciones_tipo ON organizaciones(tipo);
CREATE INDEX idx_organizaciones_abierta ON organizaciones(abierta_a_colaboraciones);
CREATE INDEX idx_organizaciones_areas ON organizaciones USING GIN(areas_de_interes);

-- Índices compuestos para queries públicas  
CREATE INDEX idx_organizaciones_publicas ON organizaciones(is_deleted, abierta_a_colaboraciones) 
WHERE is_deleted = false AND abierta_a_colaboraciones = true;
```

---

## 💻 **FASE 3: IMPLEMENTACIÓN ADMIN (Client Components)**

### ✅ **PASO 3A: Páginas Admin**
- [ ] **`/src/app/admin/organizaciones/page.tsx`** - Lista con DataTable (Client Component)
- [ ] **`/src/app/admin/organizaciones/new/page.tsx`** - Crear organización (formulario dedicado)
- [ ] **`/src/app/admin/organizaciones/[id]/edit/page.tsx`** - Editar organización  
- [ ] **`/src/app/admin/organizaciones/[id]/page.tsx`** - Vista detalle admin

### ✅ **PASO 3B: Componentes Admin**
- [ ] **`/src/components/admin/organizaciones/OrganizacionesListPage.tsx`** - Lista reutilizable
- [ ] **`/src/components/admin/organizaciones/OrganizacionForm.tsx`** - Formulario dedicado
- [ ] **`/src/components/admin/organizaciones/OrganizacionDetailPage.tsx`** - Vista detalle
- [ ] **Agregar rutas al AdminSidebar**

### ✅ **PASO 3C: Testing Admin**
- [ ] **CRUD completo funcional**
- [ ] **Validaciones Zod funcionando** 
- [ ] **Toggle `abierta_a_colaboraciones` con confirmación**
- [ ] **Soft delete funcional**

---

## 🌐 **FASE 4: IMPLEMENTACIÓN PÚBLICA (Server Components)**

### ✅ **PASO 4A: Páginas Públicas**
- [ ] **`/src/app/(public)/organizaciones/page.tsx`** - Lista pública (Server Component)
- [ ] **`/src/app/(public)/organizaciones/[id]/page.tsx`** - Detalle público (Server Component)

### ✅ **PASO 4B: Componentes Públicos**
- [ ] **`/src/components/public/organizaciones/OrganizacionesPublicGrid.tsx`** - Grid públicas
- [ ] **`/src/components/public/organizaciones/OrganizacionCard.tsx`** - Card presentacional
- [ ] **`/src/components/public/organizaciones/OrganizacionDetail.tsx`** - Detalle público
- [ ] **Agregar filtros por tipo** y búsqueda

### ✅ **PASO 4C: SEO y Performance**
- [ ] **`generateMetadata` en páginas de detalle**
- [ ] **Tipos `OrganizacionPublica`** (sin campos admin)
- [ ] **Queries optimizadas** para cargas públicas

---

## 🚀 **FASE 5: FUNCIONALIDADES AVANZADAS**

### 🎯 **PASO 5A: Sistema de Invitaciones (Opción A - Simple)**
- [ ] **Campo `estado_verificacion`** enum: `verificada`, `pendiente_confirmacion`, `rechazada`
- [ ] **Admin dashboard** para aprobar organizaciones pendientes
- [ ] **Email service** para enviar invitaciones  
- [ ] **Token de reclamación** para que organizaciones puedan editar su perfil
- [ ] **Badge de verificación** en UI pública

### 🎯 **PASO 5B: Geolocalización Básica (Fase 1)**
- [ ] **Estructura JSONB `ubicacion`:**
  ```json
  {
    "direccion_completa": "Ruta 40 Km 2140, Ingeniero Jacobacci",
    "coordenadas": { "lat": -41.123, "lng": -69.456 },
    "provincia": "Rio Negro", 
    "localidad": "Ingeniero Jacobacci",
    "codigo_postal": "8536"
  }
  ```
- [ ] **Validaciones formato** en schema Zod
- [ ] **Input estructura** para direcciones en formulario
- [ ] **Display organizado** en vistas públicas

### 🎯 **PASO 5C: Búsqueda y Filtros Avanzados**
- [ ] **Índices GIN** para full-text search en nombre y descripción
- [ ] **Filtro por provincia/localidad**
- [ ] **Filtro por áreas de interés**  
- [ ] **Búsqueda geográfica** por proximidad
- [ ] **API endpoints** para búsquedas AJAX

---

## 🗺️ **FASE 6: GEOLOCALIZACIÓN AVANZADA (Futuro)**

### 🌍 **PASO 6A: Selector de Mapa**
- [ ] **Integrar Leaflet.js** o Mapbox
- [ ] **Componente MapSelector** para formularios
- [ ] **Geocoding automático** de direcciones argentinas
- [ ] **Validación coordenadas** Argentina

### 🌍 **PASO 6B: Vistas de Mapa**
- [ ] **Mapa público** con todas las organizaciones
- [ ] **Clusters por región** 
- [ ] **Popups informativos** en marcadores
- [ ] **Filtros geográficos** interactivos

---

## 📊 **FASE 7: ANÁLISIS Y REPORTES (Futuro)**

### 📈 **PASO 7A: Dashboard Analytics**  
- [ ] **Estadísticas por tipo** de organización
- [ ] **Mapa de densidad** organizacional por región
- [ ] **Organizaciones más activas** (por colaboraciones)
- [ ] **Trending áreas** de interés

### 📈 **PASO 7B: Conectores con Otras Entidades**
- [ ] **Organizaciones ↔ Proyectos** (colaboraciones)
- [ ] **Organizaciones ↔ Personas** (empleados/miembros)
- [ ] **Organizaciones ↔ Noticias** (menciones/fuentes)

---

## ✅ **CRITERIOS DE FINALIZACIÓN POR FASE**

### **Fase 1-3 Completa:** ✅ MVP Admin Funcional
- CRUD completo admin
- RLS implementado y testeado
- Validaciones funcionando
- Soft delete operativo

### **Fase 4 Completa:** ✅ MVP Público Funcional  
- Listado público responsive
- Detalle público con SEO
- Filtros básicos funcionando

### **Fase 5 Completa:** ✅ Funcionalidades Core
- Sistema invitaciones operativo
- Geolocalización básica implementada
- Búsqueda avanzada funcional

### **Fase 6-7 Completa:** ✅ Funcionalidades Premium
- Mapas interactivos
- Analytics dashboard
- Conectores entre entidades

---

