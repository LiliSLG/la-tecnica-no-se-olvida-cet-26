# Funcionalidad: Proyectos

## ¿Qué hace esta funcionalidad?
Permite la gestión completa de los proyectos técnicos desarrollados en el CET N°26. Esto incluye su creación, edición, catalogación y visualización pública. Es una de las características centrales de la plataforma, diseñada para preservar y dar a conocer el trabajo de los estudiantes.

## Entidades involucradas
- **Tablas Principales:**
  - `proyectos`: Almacena toda la información central de cada proyecto.
- **Tablas Relacionales:**
  - `proyecto_tema`: Vincula proyectos con uno o más temas de conocimiento.
  - `proyecto_persona_rol`: Asigna personas (autores, tutores, etc.) a un proyecto con un rol específico.
  - `proyecto_organizacion_rol`: Asigna organizaciones a un proyecto con un rol específico.
  - `proyecto_relaciones`: Vincula un proyecto con otros proyectos, definiendo una relación direccional (p.ej., "mejora", "continuación").
  - `proyecto_archivo`: Almacena archivos adicionales asociados a un proyecto.
  - `proyecto_historia_oral`: Vincula un proyecto con un registro del archivo de historia oral.

## Casos de uso principales
- **Administradores:**
  - Crear, leer, actualizar y eliminar proyectos (CRUD).
  - Asignar temas, autores, tutores y organizaciones a un proyecto.
  - Subir archivos adjuntos a un proyecto.
  - Relacionar un proyecto con otros proyectos existentes en la plataforma.
- **Usuarios Públicos:**
  - Ver un listado de todos los proyectos publicados.
  - Filtrar los proyectos por año, tema o palabra clave.
  - Ver la página de detalle de un proyecto, incluyendo su descripción, autores, tutores, archivos y los proyectos con los que se relaciona.

## Flujos especiales
- **Relación entre proyectos:** El sistema permite crear un grafo de conocimiento al vincular proyectos. Una relación es direccional (Proyecto B "mejora" al Proyecto A) y se describe con un tipo y un texto explicativo. La interfaz pública debe poder mostrar estas relaciones en ambos sentidos ("Basado en..." y "Referenciado por...").
- **Creación de Personas desde el Formulario:** Si un autor o tutor no existe, el formulario de proyectos debe permitir crearlo de forma rápida (a través de un modal) sin abandonar el flujo principal.

## Consideraciones para el chatbot
- "¿Cuáles son los proyectos del año 2023?"
- "Muéstrame los proyectos relacionados con 'energías renovables'."
- "Busca el proyecto sobre 'invernaderos automatizados'."
- "En el proyecto 'Invernadero Automatizado', ¿quiénes fueron los autores?"
- "¿Qué proyectos son una continuación del proyecto 'Diseño de Dron Agrícola'?"

## Estado actual
- **Backend:** El esquema de la base de datos está completamente definido, incluyendo la lógica de relaciones. Los servicios de Supabase están por revisarse y completarse.
- **Frontend:** El panel de administración para el CRUD de proyectos y la página pública de listado/detalle están pendientes de desarrollo en la nueva versión del frontend.