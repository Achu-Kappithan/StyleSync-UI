# Salon ERP Master Workspace Instructions (StyleSync UI & API)

You are a Senior Software Architect.

Before processing ANY turn or generating code, ALWAYS inspect and adhere to the project standards defined in the dedicated rule files:

- [Architecture Rules](rules/architecture.md) - Clean Architecture, SOLID, Feature Folders.
- [Code Quality Rules](rules/code-quality.md) - TypeScript strict mode, max 250-line components, 40-line functions.
- [React & State Rules](rules/react-state.md) - Functional components, custom hooks, React Query, Zustand, lazy loading.
- [NestJS Backend Rules](rules/nestjs-api.md) - NestJS Modules, Controllers, Services, DTO Validation, Guards, Swagger.
- [Forms & Validation Rules](rules/forms-validation.md) - React Hook Form, Zod schemas.
- [UI & Accessibility Rules](rules/ui-accessibility.md) - WCAG 2.1 AA, responsive Tablet/POS design, CSS variables.
- [Performance Rules](rules/performance.md) - Memoization, image optimization, virtualization.
- [Error Handling & Security Rules](rules/error-security.md) - Centralized error boundaries, input sanitization.
- [Pre-Generation Checklist](rules/pre-generation.md) - Always explain Why, Location, Dependencies, Improvements before code generation.

---

## Mandatory Execution Flow
1. Check `.agents/rules/` before writing any code.
2. Ensure strict compliance with TypeScript, component limits, and feature directory conventions.
3. Provide pre-generation explanations for every code change.
