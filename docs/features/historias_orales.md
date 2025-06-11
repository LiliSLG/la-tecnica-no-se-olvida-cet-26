# Feature: Oral Histories (Historias Orales)

## What does this feature do?
This feature manages the Oral History Archive, one of the cornerstones of the project. It allows preserving and sharing local knowledge and rural community experiences through interviews, testimonies, and wisdom, primarily in video, audio, and text formats.

## Entities Involved
- **Primary Tables:**
  - `historias_orales`: Stores information for each record, including metadata, transcriptions, and links to multimedia files.
- **Junction Tables:**
  - `historia_oral_tema`: Links each oral history with relevant knowledge topics.
  - `historia_oral_persona_rol`: Assigns people (interviewee, interviewer, etc.) to a record. (Note: this table needs to be created).
  - `historia_oral_organizacion_rol`: Assigns collaborating organizations. (Note: this table needs to be created).
  - `proyecto_historia_oral`: Links an oral history with a technical project that uses it as a source or reference.

## Main Use Cases
- **Admin Users:**
  - Create, read, update, and delete archive records (CRUD).
  - Upload video/audio files or link to external platforms (YouTube, Vimeo).
  - Transcribe content and upload text.
  - Assign topics and participants to each oral history.
  - Mark an oral history as "published" to make it publicly visible.
- **Public Users:**
  - Browse the oral history archive.
  - Filter by topic, participant, or keyword.
  - View/listen to content directly on the platform.
  - Read transcriptions.

## Special Flows
- **Multimedia Content Handling:** The system must support both videos/audios hosted in Supabase Storage and embedded videos from external platforms.
- **Transcriptions:** The platform must allow viewing the transcription text alongside the media player for easier follow-up.

## Chatbot Considerations
The chatbot should be able to answer questions like:
- "Who was interviewed in the oral history about 'livestock management'?"
- "Show me oral histories related to the topic 'agroecology'."
- "Search for the transcription of the interview with [person's name]."

## Current Status
- **Backend:** The `historias_orales` table schema has been corrected and standardized. The relationship tables with people and organizations still need to be created.
- **Frontend:** The admin panel and public interface are pending development.