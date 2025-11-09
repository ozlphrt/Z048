# Cursor Rules — Local Copy v1.0

This project follows the global Cursor operational manual provided by the user.  
Key excerpts (summarised):

1. **Core Principles**
   - Clarity before code.
   - Persist context; trace assumptions.
   - No blind generation; validate against sources.
   - Preserve version integrity.

2. **File & Documentation**
   - Use snake_case filenames, PascalCase components, camelCase vars/functions.
   - Maintain required markdown files (overview, tasks, setup, coordinates, performance, decisions, rules).
   - Version incremental updates (append `_vX_Y` or bump versions).

3. **Behavioral Protocol**
   - Read markdowns before coding.
   - Confirm naming, ask when unsure.
   - Comment coordinate assumptions and transforms.

4. **Coordinate Governance**
   - Right-handed, Y-up system; origin at grid centre.
   - Declare source/target spaces for transforms.
   - Maintain debug helpers and round-trip tests.

5. **Version Control**
   - Commit format: `<type>(<scope>): <summary> — <impact>`.
   - Branch format: `feat/<scope>`, etc. No direct pushes to `main`.

6. **UI/UX**
   - Default to dark glassmorphic panels, hover-drag inputs over sliders unless overridden.

7. **Diagnostics**
   - Provide concise, structured responses.
   - Propose improvements with trade-offs.
   - Never suggest transforms without naming spaces/matrices.

Refer to user-provided manual for full detail. This file is a synchronised snapshot for local reference.
## Cursor Operational Rules (Local Copy)

1. **Clarity before Code**: Review markdown context prior to implementation.
2. **Context Persistence**: Maintain traceable assumptions (coords, transforms, configs).
3. **No Blind Generation**: Tie every code change to acceptance criteria.
4. **Version Integrity**: Append, never overwrite, unless explicitly approved.
5. **Coordinate Governance**: Right-handed, Y-up, origin centered. Document space transitions.
6. **UI Guidance**: Glassmorphic styling, hover-drag controls preferred, sliders banned unless overridden.
7. **Performance Target**: Sustain 60 FPS; log metrics in `PERFORMANCE_LOG.md`.
8. **Documentation Set**: Keep `PROJECT_OVERVIEW.md`, `TASK_LIST.md`, `TECHNICAL_SETUP.md`, `COORDINATE_CONVENTIONS.md`, `PERFORMANCE_LOG.md`, `DECISIONS.md`, and this file current.
9. **Decision Gate**: Code only with explicit acceptance criteria; label experiments as prototypes.
10. **Reporting Template**:
    ```
    Summary: …
    Why: …
    Next: …
    ```

Context realigned successfully according to COORDINATE_CONVENTIONS.md.

