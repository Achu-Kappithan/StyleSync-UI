# Performance Standards

- **Memoization**: Use `useMemo` and `useCallback` for expensive computations and callbacks passed to memoized children.
- **Re-render Optimization**: Keep state local and avoid unnecessary top-level state triggers.
- **Image Optimization**: Use modern WebP/AVIF images with lazy-loading attributes (`loading="lazy"`).
- **Virtualized Lists**: Use list virtualization for large data grids or appointment logs.
