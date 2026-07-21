# NestJS Backend API Standards

- **Clean Feature Architecture**: Organize code into feature modules (`src/modules/<feature-name>/`).
- **Module Separation**:
  - `*.module.ts`: Feature module registration.
  - `*.controller.ts`: HTTP route handling, request mapping, and Swagger metadata.
  - `*.service.ts`: Business logic, domain rules, and data access.
  - `*.dto.ts`: Data Transfer Objects for validation with `class-validator` / `Zod`.
- **Validation**: Enable global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true }`.
- **Security & Guards**: Protect endpoints using NestJS `AuthGuard` and `RolesGuard`.
- **Swagger Documentation**: Annotate controllers with `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()`.
- **Global Filters**: Handle all unhandled exceptions via global `HttpExceptionFilter`.
