# Architecture Boundaries

Enforced dependency direction and import rules for the modular monolith.

## Layer Rules

1. **Domain** (`*/domain/*`)
   - No imports from Application, Infrastructure, Plugins, or App layers.
   - May import from `shared/contracts` for primitive types and core policies.

2. **Application** (`*/application/*`)
   - May import from Domain and `shared/contracts`.
   - Must not import from Infrastructure, route handlers, UI components, or
     plugin implementations directly.

3. **Infrastructure** (`*/infrastructure/*`)
   - May import from Domain and Application ports/contracts.
   - Adapter implementations live here.

4. **Plugins** (`src/plugins/*`)
   - May import from `shared/contracts` and application service entry points
     (behind stable ports).
   - Must not bypass core authorization or workflow isolation.

5. **App/Routes** (`src/app/*`)
   - May import from Application and Infrastructure (for adapter wiring).
   - Business logic must be delegated to application services; no direct
     domain manipulation in route handlers.

## Forbidden Imports

- Domain layer importing Application, Infrastructure, route handlers, or UI.
- Application layer importing Infrastructure, Plugin implementations, or
  route handlers.
- Plugins importing route handlers or UI.
- Cross-module imports that bypass the authorization/application port, e.g.:
  - `plugins/*` directly mutating core domain models.
  - `app/api/*` importing repository implementations unless wiring adapters.
