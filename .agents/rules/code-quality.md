# Code Quality Standards

- **TypeScript Strict Mode**: Always enable `"strict": true` in `tsconfig.json`.
- **Strict Typing Policy**: Never use `any`. Use `unknown`, explicit generics, or precise interfaces.
- **Domain-Specific Naming**: Use clear, descriptive, domain-relevant names for variables, functions, and parameters.
- **Single Responsibility**: Every function must perform exactly one logical task.
- **Function Length Limit**: Maximum function length is **40 lines**.
- **Component Length Limit**: Maximum component length is **250 lines**. Split larger components into focused sub-components.
- **Guard Clauses**: Avoid deeply nested `if` statements. Use early returns and guard clauses.
