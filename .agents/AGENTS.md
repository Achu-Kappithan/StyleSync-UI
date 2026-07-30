# 🚨 Mandatory Frontend Development Rules (Must Follow)

These rules are **mandatory** for every React/TypeScript code generation request. Before writing any code, review this checklist and ensure every point is satisfied. Do not skip or ignore any rule.

## Core Software Principles
- Follow Clean Architecture.
- Follow SOLID Principles.
- Apply DRY (Don't Repeat Yourself).
- Apply KISS (Keep It Simple).
- Apply YAGNI (You Aren't Gonna Need It).
- Follow Separation of Concerns.
- Write scalable, maintainable, and production-ready code.
- Never duplicate business logic or UI.
- Prefer composition over inheritance.

---

## React Standards
- Use only Functional Components.
- Keep components focused on a single responsibility.
- Keep components under **250 lines** whenever possible.
- Keep functions under **40 lines** whenever possible.
- Extract reusable logic into **Custom Hooks**.
- Never place business logic directly inside UI components.
- Avoid unnecessary `useEffect`.
- Avoid unnecessary re-renders.
- Use lazy loading and code splitting where appropriate.
- Implement proper Error Boundaries.
- Use React Query for server state.
- Use Zustand only for global client state.
- Never store server data in Zustand.
- Never call APIs directly from components.

---

## Responsive UI (Mandatory)
Every page, component, dialog, table, form, and layout **must be fully responsive**.

Support all screen sizes:
- Mobile
- Tablet
- Laptop
- Desktop
- Large Desktop
- POS Screens (where applicable)

Always:
- Use Flexbox and CSS Grid.
- Use responsive spacing and typography.
- Avoid fixed widths and heights.
- Use relative units whenever possible.
- Ensure tables and forms adapt gracefully to smaller screens.
- Verify layouts across all breakpoints before considering the implementation complete.

---

## Reusable Components
Before creating a new component:
- Check whether an existing reusable component can be used.
- Prefer reusable UI over duplicated JSX.
- Place shared UI inside the shared/components directory.
- Keep feature-specific components inside their feature folders.

Create reusable components for:
- Buttons
- Inputs
- Selects
- Textareas
- Cards
- Tables
- Forms
- Modals
- Drawers
- Alerts
- Loaders
- Empty States
- Error States
- Pagination
- Search
- Filters

Never duplicate these components.

---

## Forms & Validation
Always use:
- React Hook Form
- Zod Validation
- Reusable form components
- Shared validation schemas

Never duplicate validation logic.

---

## TypeScript Standards
- Strict Mode is mandatory.
- Never use `any`.
- Never use `@ts-ignore` or `@ts-nocheck`.
- Prefer interfaces, utility types, and generics.
- Reuse types whenever possible.
- Ensure full type safety throughout the application.

---

## Performance
Always optimize performance by:
- Using `React.memo` where beneficial.
- Using `useMemo` and `useCallback` appropriately.
- Lazy loading pages and heavy components.
- Code splitting.
- Virtualizing large lists.
- Optimizing images.
- Preventing unnecessary re-renders.

---

## Accessibility
Every UI must comply with **WCAG 2.1 AA**.

Include:
- Semantic HTML
- Proper labels
- Keyboard navigation
- Focus management
- ARIA attributes
- Screen reader support
- Sufficient color contrast

Accessibility is mandatory.

---

## Styling Standards
- Use Tailwind CSS.
- Use CSS Variables and Design Tokens.
- Follow the project's design system.
- Maintain consistent spacing (8px scale).
- Maintain consistent typography.
- Avoid inline styles.
- Avoid hardcoded colors, spacing, and magic numbers.

---

## API & Project Structure
Always separate responsibilities:

Component
→ Custom Hook
→ Service
→ API Client

Feature folders should follow:

- components/
- hooks/
- services/
- api/
- schemas/
- types/
- utils/
- constants/
- pages/
- routes/

---

## Error Handling
Every asynchronous operation must handle:
- Loading State
- Success State
- Empty State
- Error State

Display user-friendly error messages.
Never fail silently.

---

## Naming Conventions
Use meaningful, descriptive names.

Examples:
- UserCard
- AppointmentTable
- EmployeeForm
- useAppointments
- appointment.service.ts
- appointment.schema.ts

Avoid generic names like:
- Data
- Item
- Temp
- Test
- Component1

---

## Before Generating Any Code (Mandatory Self-Review)

Before returning code, verify:

- ✅ Follows Clean Architecture and SOLID.
- ✅ Fully responsive across all breakpoints.
- ✅ Uses reusable components whenever possible.
- ✅ No duplicated code or business logic.
- ✅ Business logic is extracted into hooks/services.
- ✅ APIs are not called directly from components.
- ✅ Proper loading, error, and empty states exist.
- ✅ TypeScript strict mode with zero `any` types.
- ✅ Accessibility (WCAG 2.1 AA) is implemented.
- ✅ Performance optimizations are applied where needed.
- ✅ Folder structure follows project standards.
- ✅ Code is modular, readable, scalable, maintainable, and production-ready.

If any item fails this checklist, improve the implementation before generating the final code.