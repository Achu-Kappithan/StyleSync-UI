# Architecture Standards

- **Clean Architecture**: Strictly separate presentation UI, domain logic, and data layer.
- **Feature-Based Folder Structure**: Organize code by feature modules under `src/features/<feature-name>/` (e.g., `components/`, `hooks/`, `pages/`, `types/`, `services/`).
- **SOLID Principles**:
  - **S**: Single Responsibility Principle for functions and components.
  - **O**: Open/Closed Principle for extensible components.
  - **L**: Liskov Substitution Principle.
  - **I**: Interface Segregation for focused TypeScript types.
  - **D**: Dependency Inversion using custom hooks and service abstractions.
- **Zero Business Logic Duplication**: Keep domain calculations centralized in pure utility or service modules.
- **Modular Components**: Keep components decoupled, reusable, and independent.
