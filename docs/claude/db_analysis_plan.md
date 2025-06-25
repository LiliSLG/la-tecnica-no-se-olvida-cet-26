# 🔍 Plan de Análisis Sistemático - Base de Datos

## 🎯 **Checklist por Tabla - Template de Análisis**

Para cada tabla nueva que implementemos, seguir esta metodología:

### **🔍 Fase 1: Auditoría Estructura**
- [ ] **Campos obligatorios** están marcados como NOT NULL
- [ ] **Tipos de datos** son apropiados (UUID, TEXT, TIMESTAMPTZ)
- [ ] **Campos de auditoría** están presentes (created_at, created_by_uid, etc.)
- [ ] **Soft delete** implementado (is_deleted, deleted_at, deleted_by_uid)
- [ ] **Enums** definidos para campos con valores limitados

### **🔍 Fase 2: Auditoría Relaciones**
- [ ] **Foreign Keys** hacia `personas.id` para auditoría
- [ ] **Foreign Keys** hacia otras tablas según dependencias
- [ ] **Cascade behavior** apropiado (SET NULL vs CASCADE)
- [ ] **Tablas relacionales** para many-to-many existen
- [ ] **Nombres consistentes** para FK constraints

### **🔍 Fase 3: Auditoría RLS**
- [ ] **RLS habilitado** en la tabla
- [ ] **Política SELECT auth** para usuarios autenticados
- [ ] **Política SELECT visible** respetando soft delete y permisos
- [ ] **Política SELECT anon** para usuarios anónimos (si aplica)
- [ ] **Política INSERT** con validaciones apropiadas
- [ ] **Política UPDATE** restringida por ownership/admin
- [ ] **Política DELETE** solo para admins (soft delete)

### **🔍 Fase 4: Auditoría Índices**
- [ ] **Primary key** (UUID con gen_random_uuid())
- [ ] **Índices en FK** para performance de JOINs
- [ ] **Índices en campos de filtro** frecuentes (estado, tipo, fecha)
- [ ] **Índices en soft delete** (is_deleted)
- [ ] **Índices GIN** para arrays y JSONB (si aplica)
- [ ] **Índices únicos** para campos que lo requieren

### **🔍 Fase 5: Auditoría Performance**
- [ ] **Consultas frecuentes** identificadas y optimizadas
- [ ] **EXPLAIN ANALYZE** en queries complejas
- [ ] **Límites y paginación** en consultas masivas
- [ ] **Vacío y estadísticas** actualizados

---

## 📊 **Scripts de Análisis Automático**

### **Script 1: Verificar FK Faltantes**
```sql
-- Buscar tablas sin FK hacia personas para auditoría
SELECT 
  table_name,
  column_name,
  'Missing FK to personas' as issue
FROM information_schema.columns 
WHERE column_name IN ('created_by_uid', 'updated_by_uid', 'deleted_by_uid')
  AND table_schema = 'public'
  AND table_name NOT IN (
    SELECT DISTINCT tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name IN ('created_by_uid', 'updated_by_uid', 'deleted_by_uid')
  );
```

### **Script 2: Verificar Índices Faltantes**
```sql
-- Buscar FK sin índices
SELECT 
  c.table_name,
  c.column_name,
  'Missing index on FK' as issue
FROM information_schema.columns c
JOIN information_schema.table_constraints tc ON c.table_name = tc.table_name
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND c.column_name = kcu.column_name
  AND c.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = c.table_name 
      AND indexdef LIKE '%' || c.column_name || '%'
  );
```

### **Script 3: Verificar RLS**
```sql
-- Tablas sin RLS habilitado
SELECT 
  schemaname,
  tablename,
  'RLS not enabled' as issue
FROM pg_tables 
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%';
```

---

## 🎯 **Plan de Implementación**

### **Próxima Sesión: Personas**
1. **Ejecutar checklist completo** en tabla `personas`
2. **Implementar FK faltantes** hacia `personas.id`
3. **Crear RLS policies** según visibilidad_perfil
4. **Agregar índices** para email, categoria_principal
5. **Testing completo** de permisos

### **Siguiente: Proyectos** 
1. **Analizar relaciones complejas** (proyecto_persona_rol, proyecto_tema)
2. **RLS avanzado** con roles por proyecto
3. **Índices para queries** de estado, año, fechas
4. **Performance testing** con datos de ejemplo

### **Después: Optimización General**
1. **Ejecutar scripts de análisis** en todas las tablas
2. **Crear plan de índices** master
3. **Implementar monitoring** básico
4. **Documentar queries** frecuentes

---

## 📋 **Documentos a Crear/Actualizar**

1. **estado-bd-actual.md** (el que acabamos de crear)
2. **plan-analisis-tablas.md** (este documento)
3. **checklist-por-tabla.md** (template reutilizable)
4. **scripts-mantenimiento-bd.md** (queries de análisis)
5. **performance-monitoring.md** (métricas y alertas)

---

*Plan creado: 25/12/24 - Metodología sistemática para análisis incremental de BD*