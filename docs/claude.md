[2025-06-23] ✅ Temas Restaurado - Plan Híbrido Definido
Context Session: Temas funcionando correctamente, definiendo estrategia híbrida para continuar migración.
🎯 DECISIÓN ARQUITECTÓNICA: ENFOQUE HÍBRIDO
Después de evaluar Opción A (Seguridad Primero) vs Opción B (Funcionalidad Primero), se eligió ENFOQUE HÍBRIDO que combina ambos:

Fase 1A: Permisos Básicos Mejorados (seguridad fundamental)
Fase 1B: Personas Management (funcionalidad crítica)
Fase 2: Sistema Avanzado completo

✅ COMPLETADO ESTA SESIÓN

Temas: Restaurado y funcionando con Client Components + AuthProvider
Arquitectura Base: Confirmada como sólida
Plan de Migración: Definido y documentado

🚀 PRÓXIMA SESIÓN - FASE 1A (Prioridad Inmediata)
Objetivo: Expandir RLS y Crear Utilidades Básicas de Permisos
Tiempo estimado: 1 sesión
Checklist Fase 1A:

 Expandir RLS a Personas: Políticas de lectura/escritura según roles
 Expandir RLS a Organizaciones: Políticas de lectura/escritura según roles
 Crear utilidades básicas de permisos: Funciones helper para verificar acceso
 Documentar políticas RLS: Para referencia futura

Archivos a Modificar/Crear:

Supabase: Nuevas políticas RLS para personas y organizaciones
src/lib/supabase/permissions.ts: Utilidades básicas de permisos
docs/rls-policies.md: Documentación de políticas

🎯 FASE 1B - Siguiente Prioridad
Objetivo: Personas Management Completo
Tiempo estimado: 1-2 sesiones
Checklist Fase 1B:

 Lista de personas: Con AdminDataTable y permisos RLS
 Formulario CRUD: Creación/edición con validación
 Gestión de roles: Asignación de roles globales y por proyecto
 Upload de fotos: Integración con Supabase Storage
 Filtros avanzados: Por rol, estado, etc.

Archivos Principales:

src/app/admin/personas/page.tsx: Lista principal
src/app/admin/personas/new/page.tsx: Formulario de creación
src/app/admin/personas/[id]/edit/page.tsx: Formulario de edición
src/components/admin/personas/: Componentes específicos

📋 ROADMAP COMPLETO POST-FASE 1
Fase 2: Sistema de Permisos Avanzado

 usePermissions hook completo
 Middleware de rutas automático
 Permisos granulares por acción

Fase 3: Organizaciones + Storage

 Organizaciones Management completo
 Migración Firebase → Supabase Storage
 Upload de archivos para todas las entidades

Fase 4: Páginas Públicas

 Vistas públicas optimizadas
 SEO y performance

Fase 5: Funcionalidades Avanzadas

 Relaciones entre entidades
 Análisis satelitales
 Dashboard con métricas

📝 PLANTILLA PARA PRÓXIMA SESIÓN
CONTEXTO: Migración arquitectural Next.js + Supabase - Enfoque Híbrido

ESTADO ACTUAL: 
✅ Temas funcionando correctamente
🎯 Iniciando Fase 1A: Expandir RLS y crear utilidades básicas

PRIORIDAD INMEDIATA: 
Expandir políticas RLS para Personas y Organizaciones + crear utilidades de permisos básicas

OBJETIVO SESIÓN:
Completar Fase 1A para tener base sólida antes de implementar Personas Management

ARCHIVOS CONTEXTO: rules.md, blueprint.md, changelog.md
🔗 CONTEXTO TÉCNICO CLAVE
Patrón Establecido:

Client Components para páginas admin que necesitan AuthProvider
Standalone Services sin herencia para todas las entidades
RLS + AuthProvider para control de acceso

Sistema de Roles Actual:

Roles Globales: persona_roles table (admin, moderator)
Roles por Proyecto: proyecto_persona_rol table (autor, tutor, colaborador)
Función RPC: is_admin() para verificación de permisos

Arquitectura de Datos:

PostgreSQL con Supabase
Soft deletes implementados
Types generados automáticamente en database.types.ts


IMPORTANTE: Este plan híbrido permite avanzar con funcionalidades visibles mientras construimos una base de seguridad sólida. La Fase 1A es crucial para no crear deuda técnica.