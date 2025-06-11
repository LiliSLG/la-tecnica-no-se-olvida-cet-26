# Feature Documentation

To facilitate project maintenance, training of future assistants (chatbot), and onboarding of new developers, the following feature documentation pattern is established.

## Location

Each feature's documentation will be located at:

/docs/features/<feature_name>.md


Example:

/docs/features/personas.md
/docs/features/proyectos.md
/docs/features/cursos.md


## Minimum Structure for Each File

Each feature file must include at minimum the following sections:


- <Feature Name>

- What does this feature do?

Brief description of its purpose within the system.

- Entities Involved

List of relevant tables, enums, and relationships.

- Main Use Cases

List of use cases covered by the feature.

- Special Flows

Description of specific flows or particularities (if applicable).

- Chatbot Considerations

List of possible questions that the chatbot should be able to answer regarding this feature.

- Current Status

Brief summary of the current implementation status (what's done, what's pending).

## Notes
✅ Documentation must be kept up to date as features are developed or modified.
✅ The structure can be expanded if more detail is required, but it must always contain at minimum the defined sections.
✅ This documentation will be the foundation for future conversational assistants and automated documentation generation.