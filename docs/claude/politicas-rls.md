# 🔐 Políticas RLS - Row Level Security

## 🎯 Overview
Este documento registra todas las políticas RLS necesarias para el funcionamiento completo de la aplicación, organizadas por tabla y tipo de operación.

## 📋 Status por Tabla

| Tabla | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|--------|--------|--------|--------|---------|
| `temas` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `personas` | 🎯 | 🎯 | 🎯 | 🎯 | **Fase 1A** |
| `organizaciones` | 🎯 | 🎯 | 🎯 | 🎯 | **Fase 1A** |
| `proyectos` | 🎯 | 🎯 | 🎯 | 🎯 | **Fase 1A** |
| `noticias` | 🎯 | 🎯 | 🎯 | 🎯 | **Fase 1A** |
| `historias_orales` | ❌ | ❌ | ❌ | ❌ | Pendiente |
| `roles` | ❌ | ❌ | ❌ | ❌ | Pendiente |
| `persona_roles` | ❌ | ❌ | ❌ | ❌ | Pendiente |

**Leyenda:** ✅ Implementado | 🎯 Fase 1A | ❌ Pendiente

## 🔧 Políticas Implementadas

### Tabla: `temas` ✅

#### SELECT Policies
```sql
-- Política básica para usuarios autenticados
CREATE POLICY "temas_select_auth" ON "public"."temas"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

-- Política para admins o temas no eliminados
CREATE POLICY "temas_select_visible" ON "public"."temas"  
FOR SELECT TO public
USING ((is_admin() OR (is_deleted = false)));
```

#### INSERT Policy
```sql
CREATE POLICY "temas_insert" ON "public"."temas"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);
```

#### UPDATE Policy
```sql
CREATE POLICY "temas_update" ON "public"."temas"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);
```

#### DELETE Policy (Soft Delete)
```sql
CREATE POLICY "temas_delete" ON "public"."temas"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);
```

## 🎯 Políticas Fase 1A (Para Implementar)

### Tabla: `personas`

#### SELECT Policies
```sql
-- Acceso básico autenticado
CREATE POLICY "personas_select_auth" ON "public"."personas"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

-- Visibilidad basada en configuración de perfil y admin override
CREATE POLICY "personas_select_visible" ON "public"."personas"
FOR SELECT TO public  
USING (
  is_admin() OR 
  (is_deleted = false AND (
    visibilidad_perfil = 'publico' OR
    (visibilidad_perfil = 'solo_registrados_plataforma' AND auth.role() = 'authenticated'::text) OR
    (visibilidad_perfil IN ('privado', 'solo_admins_y_propio') AND auth.uid()::uuid = id)
  ))
);
```

#### INSERT/UPDATE/DELETE Policies
```sql
-- Solo usuarios autenticados pueden crear personas
CREATE POLICY "personas_insert" ON "public"."personas"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- Solo admins o el propio usuario pueden actualizar
CREATE POLICY "personas_update" ON "public"."personas"
FOR UPDATE TO public
USING (is_admin() OR auth.uid()::uuid = id);

-- Solo admins pueden hacer soft delete
CREATE POLICY "personas_delete" ON "public"."personas"
FOR UPDATE TO public
USING (is_admin());
```

### Tabla: `organizaciones`

#### Políticas Estándar
```sql
-- SELECT: Básico autenticado + no eliminados
CREATE POLICY "organizaciones_select_auth" ON "public"."organizaciones"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "organizaciones_select_visible" ON "public"."organizaciones"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "organizaciones_insert" ON "public"."organizaciones"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Solo usuarios autenticados (se refinará en fases posteriores)
CREATE POLICY "organizaciones_update" ON "public"."organizaciones"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);

-- DELETE: Solo admins
CREATE POLICY "organizaciones_delete" ON "public"."organizaciones"
FOR UPDATE TO public
USING (is_admin());
```

### Tabla: `proyectos`

#### Políticas con Roles por Proyecto
```sql
-- SELECT: Básico autenticado + no eliminados
CREATE POLICY "proyectos_select_auth" ON "public"."proyectos"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "proyectos_select_visible" ON "public"."proyectos"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "proyectos_insert" ON "public"."proyectos"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Admins o participantes del proyecto
CREATE POLICY "proyectos_update" ON "public"."proyectos"
FOR UPDATE TO public
USING (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyectos.id 
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);

-- DELETE: Solo admins o autores del proyecto
CREATE POLICY "proyectos_delete" ON "public"."proyectos"
FOR UPDATE TO public
USING (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyectos.id 
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol = 'autor'
    AND ppr.is_deleted = false
  )
);
```


### Tabla: `noticias`

#### Modelo de Permisos Noticias
- **Admin**: Gestión completa de todas las noticias
- **Usuario autenticado**: Gestiona sus noticias + ve noticias publicadas
- **Usuario anónimo**: Solo ve noticias publicadas

#### Políticas de Contenido
```sql
-- SELECT: Usuarios autenticados básico
CREATE POLICY "noticias_select_auth" ON "public"."noticias"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

-- SELECT: Nivel de visibilidad por rol
CREATE POLICY "noticias_select_visible" ON "public"."noticias"  
FOR SELECT TO public
USING (
  is_admin() OR                              -- Admin ve todo
  (auth.uid()::uuid = created_by_uid) OR     -- Usuario ve sus noticias
  (                                          -- Todos ven publicadas no eliminadas
    (is_deleted = false OR is_deleted IS NULL) 
    AND esta_publicada = true
  )
);

-- SELECT: Usuarios anónimos solo ven publicadas
CREATE POLICY "noticias_select_anonymous" ON "public"."noticias"
FOR SELECT TO anon
USING (
  (is_deleted = false OR is_deleted IS NULL) 
  AND esta_publicada = true
);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "noticias_insert" ON "public"."noticias"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Admin o creador
CREATE POLICY "noticias_update" ON "public"."noticias"
FOR UPDATE TO public
USING (
  is_admin() OR 
  auth.uid()::uuid = created_by_uid
);

-- DELETE: Solo admins (soft delete)
CREATE POLICY "noticias_delete" ON "public"."noticias"
FOR UPDATE TO public
USING (is_admin());
```

#### Políticas de Contenido
```sql
-- SELECT: Básico autenticado + no eliminados
CREATE POLICY "noticias_select_auth" ON "public"."noticias"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "noticias_select_visible" ON "public"."noticias"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "noticias_insert" ON "public"."noticias"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Solo admins o el creador de la noticia
CREATE POLICY "noticias_update" ON "public"."noticias"
FOR UPDATE TO public
USING (is_admin() OR auth.uid()::uuid = created_by_uid);

-- DELETE: Solo admins
CREATE POLICY "noticias_delete" ON "public"."noticias"
FOR UPDATE TO public
USING (is_admin());
```

## 📝 Políticas para Tablas Relacionales

### Tabla: `proyecto_persona_rol`
```sql
-- SELECT: Ver roles donde participo o soy admin
CREATE POLICY "proyecto_persona_rol_select" ON "public"."proyecto_persona_rol"
FOR SELECT TO public
USING (
  is_admin() OR 
  persona_id = auth.uid()::uuid OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr2
    WHERE ppr2.proyecto_id = proyecto_persona_rol.proyecto_id
    AND ppr2.persona_id = auth.uid()::uuid
    AND ppr2.rol IN ('autor', 'tutor')
    AND ppr2.is_deleted = false
  )
);

-- INSERT: Solo autor o tutor del proyecto pueden asignar roles
CREATE POLICY "proyecto_persona_rol_insert" ON "public"."proyecto_persona_rol"
FOR INSERT TO public
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyecto_persona_rol.proyecto_id
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);

-- UPDATE/DELETE: Solo admin o quien puede gestionar el proyecto
CREATE POLICY "proyecto_persona_rol_update" ON "public"."proyecto_persona_rol"
FOR UPDATE TO public
USING (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyecto_persona_rol.proyecto_id
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);
```

### Tabla: `persona_tema` y `proyecto_tema`
```sql
-- PERSONA_TEMA: Gestión de expertise personal
-- PERSONA_TEMA: Gestión de expertise personal
CREATE POLICY "persona_tema_select" ON "public"."persona_tema"
FOR SELECT TO public
USING (
  is_admin() OR 
  persona_id = auth.uid()::uuid OR
  auth.role() = 'authenticated'::text
);

CREATE POLICY "persona_tema_insert" ON "public"."persona_tema"
FOR INSERT TO public
WITH CHECK (is_admin() OR persona_id = auth.uid()::uuid);

CREATE POLICY "persona_tema_update" ON "public"."persona_tema"
FOR UPDATE TO public
USING (is_admin() OR persona_id = auth.uid()::uuid);

-- PROYECTO_TEMA: Relación proyecto-tema
CREATE POLICY "proyecto_tema_select" ON "public"."proyecto_tema"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "proyecto_tema_insert" ON "public"."proyecto_tema"
FOR INSERT TO public
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyecto_tema.proyecto_id
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);
```

## 🎯 Políticas de Acceso Anónimo (Rutas Públicas)

### Para rutas `/(public)/`
```sql
-- PROYECTOS: Solo finalizados/presentados para anónimos
CREATE POLICY "proyectos_select_anonymous" ON "public"."proyectos"
FOR SELECT TO anonymous
USING (
  is_deleted = false AND 
  estado_actual IN ('finalizado', 'presentado')
);

-- NOTICIAS: Todas las noticias para anónimos
CREATE POLICY "noticias_select_anonymous" ON "public"."noticias"
FOR SELECT TO anonymous
USING (is_deleted = false);

-- PERSONAS: Solo perfiles públicos para anónimos
CREATE POLICY "personas_select_anonymous" ON "public"."personas"
FOR SELECT TO anonymous
USING (
  is_deleted = false AND 
  visibilidad_perfil = 'publico'
);

-- TEMAS: Todos los temas para anónimos
CREATE POLICY "temas_select_anonymous" ON "public"."temas"
FOR SELECT TO anonymous
USING (is_deleted = false);
```

## 🎯 Políticas de Creación Específicas

### Creación de Proyectos (Solo Alumnos + Admin)
```sql
-- UPDATE: Política INSERT más restrictiva para proyectos
DROP POLICY "proyectos_insert" ON "public"."proyectos";

CREATE POLICY "proyectos_insert_restricted" ON "public"."proyectos"
FOR INSERT TO public
WITH CHECK (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM personas p
    WHERE p.id = auth.uid()::uuid
    AND p.categoria_principal IN ('estudiante_cet', 'ex_alumno_cet')
    AND p.activo = true
    AND p.is_deleted = false
  )
);
```

## 🚀 Script de Aplicación Completa - Fase 1A

### Para ejecutar en Supabase SQL Editor
```sql
-- ============================================
-- RLS POLICIES SETUP SCRIPT - FASE 1A
-- Run this in Supabase SQL Editor
-- ============================================

-- PERSONAS
CREATE POLICY "personas_select_auth" ON "public"."personas"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "personas_select_visible" ON "public"."personas"
FOR SELECT TO public  
USING (
  is_admin() OR 
  (is_deleted = false AND (
    visibilidad_perfil = 'publico' OR
    (visibilidad_perfil = 'solo_registrados_plataforma' AND auth.role() = 'authenticated'::text) OR
    (visibilidad_perfil IN ('privado', 'solo_admins_y_propio') AND auth.uid()::uuid = id)
  ))
);

CREATE POLICY "personas_select_anonymous" ON "public"."personas"
FOR SELECT TO anonymous
USING (is_deleted = false AND visibilidad_perfil = 'publico');

CREATE POLICY "personas_insert" ON "public"."personas"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "personas_update" ON "public"."personas"
FOR UPDATE TO public
USING (is_admin() OR auth.uid()::uuid = id);

CREATE POLICY "personas_delete" ON "public"."personas"
FOR UPDATE TO public
USING (is_admin());

-- ORGANIZACIONES
CREATE POLICY "organizaciones_select_auth" ON "public"."organizaciones"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "organizaciones_select_visible" ON "public"."organizaciones"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

CREATE POLICY "organizaciones_insert" ON "public"."organizaciones"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "organizaciones_update" ON "public"."organizaciones"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "organizaciones_delete" ON "public"."organizaciones"
FOR UPDATE TO public
USING (is_admin());

-- PROYECTOS
CREATE POLICY "proyectos_select_auth" ON "public"."proyectos"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "proyectos_select_visible" ON "public"."proyectos"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

CREATE POLICY "proyectos_select_anonymous" ON "public"."proyectos"
FOR SELECT TO anonymous
USING (is_deleted = false AND estado_actual IN ('finalizado', 'presentado'));

CREATE POLICY "proyectos_insert_restricted" ON "public"."proyectos"
FOR INSERT TO public
WITH CHECK (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM personas p
    WHERE p.id = auth.uid()::uuid
    AND p.categoria_principal IN ('estudiante_cet', 'ex_alumno_cet')
    AND p.activo = true
    AND p.is_deleted = false
  )
);

CREATE POLICY "proyectos_update" ON "public"."proyectos"
FOR UPDATE TO public
USING (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyectos.id 
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);

CREATE POLICY "proyectos_delete" ON "public"."proyectos"
FOR UPDATE TO public
USING (
  is_admin() OR 
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyectos.id 
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol = 'autor'
    AND ppr.is_deleted = false
  )
);

-- NOTICIAS
CREATE POLICY "noticias_select_auth" ON "public"."noticias"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "noticias_select_visible" ON "public"."noticias"
FOR SELECT TO public  
USING (is_admin() OR is_deleted = false);

CREATE POLICY "noticias_select_anonymous" ON "public"."noticias"
FOR SELECT TO anonymous
USING (is_deleted = false);

CREATE POLICY "noticias_insert" ON "public"."noticias"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "noticias_update" ON "public"."noticias"
FOR UPDATE TO public
USING (is_admin() OR auth.uid()::uuid = created_by_uid);

CREATE POLICY "noticias_delete" ON "public"."noticias"
FOR UPDATE TO public
USING (is_admin());

-- RELACIONES
CREATE POLICY "proyecto_persona_rol_select" ON "public"."proyecto_persona_rol"
FOR SELECT TO public
USING (
  is_admin() OR 
  persona_id = auth.uid()::uuid OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr2
    WHERE ppr2.proyecto_id = proyecto_persona_rol.proyecto_id
    AND ppr2.persona_id = auth.uid()::uuid
    AND ppr2.rol IN ('autor', 'tutor')
    AND ppr2.is_deleted = false
  )
);

CREATE POLICY "proyecto_persona_rol_insert" ON "public"."proyecto_persona_rol"
FOR INSERT TO public
WITH CHECK (
  is_admin() OR
  EXISTS (
    SELECT 1 FROM proyecto_persona_rol ppr
    WHERE ppr.proyecto_id = proyecto_persona_rol.proyecto_id
    AND ppr.persona_id = auth.uid()::uuid
    AND ppr.rol IN ('autor', 'tutor')
    AND ppr.is_deleted = false
  )
);
```

## 🔄 Maintenance y Testing

### Checklist para Testear Políticas
- [ ] **Admin**: Puede ver/editar todo
- [ ] **Estudiante**: Puede crear proyectos propios
- [ ] **Usuario normal**: Solo lectura
- [ ] **Anónimo**: Ve solo rutas públicas
- [ ] **Autor proyecto**: Puede gestionar su proyecto
- [ ] **Tutor**: Puede gestionar proyectos asignados

### Comandos de Debug
```sql
-- Ver políticas de una tabla
SELECT * FROM pg_policies WHERE tablename = 'proyectos';

-- Testear función admin
SELECT is_admin();

-- Ver rol actual
SELECT auth.role();
```

---

*RLS configurado para balancear seguridad y usabilidad según los roles del CET N°26.*