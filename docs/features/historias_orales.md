# Funcionalidad: Historias Orales

## ¿Qué hace esta funcionalidad?
Gestiona el Archivo de Historia Oral, una de las piedras angulares del proyecto. Permite preservar y compartir el conocimiento local y las experiencias de la comunidad rural a través de entrevistas, testimonios y saberes, principalmente en formato de video, audio y texto.

## Entidades involucradas
- **Tablas Principales:**
  - `historias_orales`: Almacena la información de cada registro, incluyendo metadatos, transcripciones y enlaces a los archivos multimedia.
- **Tablas Relacionales:**
  - `historia_oral_tema`: Vincula cada historia oral con los temas de conocimiento relevantes.
  - `historia_oral_persona_rol`: Asigna personas (entrevistado, entrevistador, etc.) a un registro. (Nota: esta tabla hay que crearla).
  - `historia_oral_organizacion_rol`: Asigna organizaciones colaboradoras. (Nota: esta tabla hay que crearla).
  - `proyecto_historia_oral`: Relaciona una historia oral con un proyecto técnico que la utilice como fuente o referencia.

## Casos de uso principales
- **Administradores:**
  - Crear, leer, actualizar y eliminar registros del archivo (CRUD).
  - Subir archivos de video/audio o enlazar a plataformas externas (YouTube, Vimeo).
  - Transcribir el contenido y subir el texto.
  - Asignar temas y participantes a cada historia oral.
  - Marcar una historia oral como "publicada" para que sea visible públicamente.
- **Usuarios Públicos:**
  - Navegar por el archivo de historias orales.
  - Filtrar por tema, participante o palabra clave.
  - Visualizar/escuchar el contenido directamente en la plataforma.
  - Leer las transcripciones.

## Flujos especiales
- **Manejo de Contenido Multimedia:** El sistema debe soportar tanto videos/audios alojados en el Storage de Supabase como videos embebidos de plataformas externas.
- **Transcripciones:** La plataforma debe permitir visualizar el texto de la transcripción junto al reproductor multimedia para facilitar el seguimiento.

## Consideraciones para el chatbot
- "¿Quién fue entrevistado en la historia oral sobre 'manejo de ganado'?"
- "Muéstrame las historias orales relacionadas con el tema 'agroecología'."
- "Busca la transcripción de la entrevista a [nombre de persona]."

## Estado actual
- **Backend:** El esquema de la tabla `historias_orales` ha sido corregido y estandarizado. Faltan por crear las tablas de relación con personas y organizaciones.
- **Frontend:** El panel de administración y la interfaz pública están pendientes de desarrollo.