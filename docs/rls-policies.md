# RLS Policies - Row Level Security

## 🎯 Overview
Este documento registra todas las políticas RLS necesarias para el funcionamiento completo de la aplicación.

## 📋 Status por Tabla

| Tabla | SELECT | INSERT | UPDATE | DELETE | Status |
|-------|--------|--------|--------|--------|---------|
| `temas` | ✅ | ✅ | ✅ | ✅ | **Completo** |
| `personas` | ✅ | ❌ | ❌ | ❌ | Pendiente |
| `organizaciones` | ❌ | ❌ | ❌ | ❌ | Pendiente |
| `proyectos` | ❌ | ❌ | ❌ | ❌ | Pendiente |
| `noticias` | ❌ | ❌ | ❌ | ❌ | Pendiente |

## 🔧 Políticas Implementadas

### Tabla: `temas`

#### SELECT Policies
```sql
-- Política básica para usuarios autenticados
CREATE POLICY "autenticados" ON "public"."temas"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

-- Política para admins o temas no eliminados
CREATE POLICY "temas_select" ON "public"."temas"  
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

## 📝 Template para Nuevas Tablas

```sql
-- Replace [TABLA] with actual table name

-- SELECT: Basic authenticated access
CREATE POLICY "[tabla]_select_auth" ON "public"."[tabla]"
FOR SELECT TO public
USING (auth.role() = 'authenticated'::text);

-- SELECT: Admin or non-deleted items
CREATE POLICY "[tabla]_select_visible" ON "public"."[tabla]"
FOR SELECT TO public  
USING ((is_admin() OR (is_deleted = false)));

-- INSERT: Authenticated users
CREATE POLICY "[tabla]_insert" ON "public"."[tabla]"
FOR INSERT TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- UPDATE: Authenticated users
CREATE POLICY "[tabla]_update" ON "public"."[tabla]"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);

-- DELETE: Soft delete via UPDATE
CREATE POLICY "[tabla]_delete" ON "public"."[tabla]"
FOR UPDATE TO public
USING (auth.role() = 'authenticated'::text);
```

## 🚀 Script de Aplicación Completa

```sql
-- ============================================
-- RLS POLICIES SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- TEMAS (✅ Already implemented)
-- See above for current policies

-- PERSONAS (❌ Pending)
-- TODO: Add when implementing personas CRUD

-- ORGANIZACIONES (❌ Pending)  
-- TODO: Add when implementing organizaciones CRUD

-- PROYECTOS (❌ Pending)
-- TODO: Add when implementing proyectos CRUD

-- NOTICIAS (❌ Pending)
-- TODO: Add when implementing noticias CRUD
```

## 🔄 Maintenance Notes

- **Update this file** each time you add RLS policies
- **Test policies** in Supabase before marking as ✅
- **Keep templates updated** for consistency
- **Document any special cases** per table

---

*Last updated: 2025-06-23 - Temas policies completed*