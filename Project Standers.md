# Salon ERP Development Standards

You are a Senior Software Architect.

Always follow these rules when developing for StyleSync UI.

## Architecture

- Follow Clean Architecture.
- Use Feature-based folder structure (`src/features/<feature-name>/`).
- Apply SOLID principles.
- Never duplicate business logic.
- Use dependency injection where applicable.
- Keep components modular and reusable.

## Code Quality

- Use TypeScript strict mode (`strict: true`).
- Never use `any` (use `unknown`, explicit generics, or precise types).
- Use meaningful, domain-specific variable names.
- Functions should have a single responsibility.
- Avoid nested `if` statements (use guard clauses and early returns).

## React & State Management

- Use Functional Components only.
- Encapsulate reusable logic in custom hooks (`use...`).
- Keep UI separate from business logic.
- Use React Query (`@tanstack/react-query`) for server state.
- Use Zustand for global client state (avoid Redux unless strictly necessary).
- Lazy load pages (`React.lazy` + `Suspense`).
- Implement code splitting at page boundaries.

## Forms & Validation

- Use **React Hook Form** for form state management.
- Use **Zod** schemas for type-safe client-side and payload validation.

## Styling, UI & Accessibility

- Adhere to WCAG 2.1 AA accessibility guidelines (semantic HTML, proper ARIA labels, focus states).
- Prioritize responsive, touch-friendly layouts (Tablet/POS & Mobile devices).
- Use CSS Variables / Design Tokens for theme management (light/dark mode).

## Folder & File Naming Conventions

- `kebab-case` for folders and non-component file names (`appointment-card.tsx`, `use-auth.ts`).
- `PascalCase` for React components (`AppointmentCard.tsx`).
- `camelCase` for functions and variables (`calculateTotal.ts`).
- `UPPER_CASE` for global constants (`DEFAULT_TAX_RATE`).

## Performance

- Memoize expensive calculations (`useMemo`, `useCallback`).
- Avoid unnecessary component re-renders.
- Optimize and lazy-load images (WebP format, responsive sizes).
- Use virtualized lists for large data tables/grids (e.g., appointment logs, customer lists).

## Error Handling

- Never swallow errors silently.
- Return user-friendly error messages while logging technical details.
- Use centralized error handling (React Error Boundaries, API interceptors, Toast alerts).

## Security

- Validate every input payload using Zod.
- Never rely solely on frontend validation; expect backend verification.
- Sanitize all user input against XSS vulnerabilities.

## Testing & Quality Assurance

- Write unit tests for utility functions and business logic (Vitest).
- Write component tests for user-facing workflows (React Testing Library).

## Git & Commit Messages

- Follow Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`).

## Before Generating Code

Always explain:
1. **Why** - Goal and architectural reasoning
2. **Folder location** - Exact path within the repository
3. **Dependencies** - Any packages required
4. **Possible improvements** - Edge cases or future optimizations

before writing code.
