# AI Usage Guidelines for Development

This document defines the correct practices for using AI assistants (such as Cursor or ChatGPT) in this project.

## Why

AI assistants can help with generating or refactoring code.  
However, they need to be guided carefully to respect the architecture and patterns defined for this project.

## General Rules

✅ **All prompts to AI assistants must be written in English.**  
AI models (especially Cursor) follow architecture and patterns more reliably when the prompts are in English.

✅ **Always start your prompts with the following prefix:**
Using the rules set out in rules.md.


This ensures that the AI follows the project's architecture, service patterns, and conventions as documented in:

- `rules.md`
- `blueprint.md`

Without this prefix, the AI may introduce breaking changes or incorrect patterns.

## Workflow

1️⃣ Write your prompts in English.  
2️⃣ Start the prompt with: `Using the rules set out in rules.md.`  
3️⃣ After the AI returns code, **review the changes carefully**.  
4️⃣ Summarize what was done (for yourself and for future tracking).  
5️⃣ Only proceed with further prompts once you confirm the previous changes are correct.

## Interaction Flow (AI + Team Workflow)

To avoid chat overload and maintain development flow:

✅ After each response from Cursor, the assistant (ChatGPT) will:
- Provide a brief summary of what Cursor changed.
- Immediately suggest the next prompt to continue the plan.

✅ The assistant will only pause for confirmation in these cases:
- If Cursor introduces changes that violate documented patterns.
- If key information is missing for the next step.
- If a design/architecture decision is required before proceeding.

In most cases, we follow a "pipeline" flow:
- Summary → Next Prompt → Cursor → Repeat.

This ensures fast, efficient iteration without unnecessary pauses.

