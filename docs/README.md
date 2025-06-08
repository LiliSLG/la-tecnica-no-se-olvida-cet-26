# Documentación de funcionalidades

Con el objetivo de facilitar el mantenimiento del proyecto, el entrenamiento de futuros asistentes (chatbot), y el onboarding de nuevos desarrolladores, se establece el siguiente patrón de documentación por funcionalidades (features).

## Ubicación

La documentación de cada funcionalidad se ubicará en:

/docs/features/<nombre_feature>.md


Ejemplo:

/docs/features/personas.md
/docs/features/proyectos.md
/docs/features/cursos.md


## Estructura mínima de cada archivo

Cada archivo de feature deberá incluir como mínimo las siguientes secciones:


- <Nombre de la funcionalidad>

- ¿Qué hace esta funcionalidad?

Breve descripción de su propósito dentro del sistema.

- Entidades involucradas

Listado de tablas, enums y relaciones relevantes.

- Casos de uso principales

Listado de casos de uso que cubre la funcionalidad.

- Flujos especiales

Descripción de flujos o particularidades específicas (si aplica).

- Consideraciones para el chatbot

Listado de posibles preguntas que el chatbot debería poder responder en relación a esta funcionalidad.

- Estado actual

Breve resumen del estado actual de la implementación (qué está hecho, qué está pendiente).

## Notas
✅ La documentación debe mantenerse actualizada a medida que se desarrollan o modifican las funcionalidades.
✅ La estructura puede ampliarse si se requiere más detalle, pero siempre debe contener como mínimo las secciones definidas.
✅ Esta documentación será la base para futuros asistentes conversacionales y para la generación de documentación automática.