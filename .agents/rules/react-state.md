# React & State Management Standards

- **Functional Components Only**: Class components are strictly prohibited.
- **Custom Hooks (`use...`)**: Encapsulate complex stateful logic and side-effects in custom hooks.
- **UI & Logic Separation**: Presentational components should focus strictly on JSX rendering.
- **Server State**: Use **React Query** (`@tanstack/react-query`) for fetching, caching, and updating server data.
- **Global Client State**: Use **Zustand** for global application client state (avoid Redux boilerplate).
- **Code Splitting & Lazy Loading**: Use `React.lazy` and `Suspense` for page-level routes.
