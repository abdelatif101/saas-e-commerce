<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.1
- Modified principles:
  - I. Stable Core First → I. Stable Core of Cohesive Modules
  - II. Plugin-Driven Extensibility → II. Plugin-Driven Extensibility with Runtime Discipline
  - III. Clean Boundaries and Dependency Direction → III. Clean Boundaries and Dependency Direction
  - IV. Durable Business Truth → IV. Durable Business Truth and Replaceable Infrastructure
  - V. Simplicity and Performance over Theoretical Extensibility → V. Simplicity and Performance over Theoretical Extensibility
- Added sections:
  - None
- Removed sections:
  - None
- Follow-up TODOs:
  - None
-->

# SaaS E-Commerce Constitution

## Core Principles

### I. Stable Core of Cohesive Modules
Essential business capabilities MUST remain in the Core, and the Core MUST be composed of
cohesive Modules with clear responsibilities. Features MUST be placed in the smallest
appropriate boundary (Core, Module, Plugin, Adapter, or Use Case). Core functionality MUST
NOT be moved to plugins without concrete architectural benefit.

Rationale: core commerce correctness depends on stable ownership of business logic, not on a
single package layout.

### II. Plugin-Driven Extensibility with Runtime Discipline
Optional, replaceable, integration-specific, or independently extensible capabilities SHOULD be
implemented as Plugins. Every Plugin MUST declare a versioned manifest with id, version,
permissions, lifecycle, and contracts. Plugins MUST communicate only through defined
Core/Application contracts and MUST NOT directly depend on other plugin implementations.
Plugin architecture MUST NOT introduce unnecessary critical-path work.

Rationale: controlled extension points enable flexibility without coupling or avoidable runtime
overhead.

### III. Clean Boundaries and Dependency Direction
The system MUST follow Clean Architecture with explicit Domain, Application,
Infrastructure, and Presentation boundaries. Dependencies MUST point inward. Domain MUST
remain independent of frameworks, vendors, and infrastructure, and Application MUST define
ports/use cases implemented by Infrastructure adapters.

Rationale: strict dependency direction preserves replaceability and testability.

### IV. Durable Business Truth and Replaceable Infrastructure
PostgreSQL MUST be the source of truth for persistent business state, with Neon treated as a
replaceable PostgreSQL provider. Redis MUST NOT be authoritative for business correctness and
MUST be accessed behind replaceable abstractions. System correctness MUST hold when cache is
absent, expired, or unavailable, and Redis failure MUST NOT invalidate persistent business
state.

Rationale: durable truth prevents correctness failures caused by ephemeral infrastructure.

### V. Simplicity and Performance over Theoretical Extensibility
The system MUST prioritize simplicity, testability, observability, replaceability,
performance, and low operational complexity. The MVP MUST prioritize core commerce and
customer communication, and future functionality MUST NOT add unnecessary complexity before
it is required.

Rationale: practical, measurable outcomes take precedence over speculative abstractions.

## Architecture, Modularity, and Governance Requirements

### Normative Definitions
- Core: Essential business capabilities required by the platform, organized as cohesive
  internal Modules.
- Module: A cohesive internal unit within the Core.
- Plugin: An optional, replaceable, or integration-specific extension.
- Infrastructure Dependency: An external framework, platform, service, or provider.
- Adapter: An infrastructure-side implementation of an Application Port/contract.
- Port: An abstraction defined by the Application layer.
- Contract: A versioned interface, schema, or event used between boundaries.
- Source of Truth: The authoritative persistent source of business state.
- Ephemeral Data: Data that can be recreated without losing business truth.

### Architecture Requirements (ARCH-01)
- The system MUST separate Domain, Application, Infrastructure, and Presentation.
- Domain/Application MUST NOT import Next.js, Clerk, Neon, Redis, Vercel Queues, AI
  providers, or external API implementations.
- Route handlers, server actions, and UI components MUST NOT contain business logic.
- Presentation MUST depend on Application contracts; Infrastructure MUST implement
  Application ports.
- Verification MUST include automated or reviewable dependency-boundary checks,
  dependency analysis, and architecture review.

### Modularity Requirements (MOD-01)
- The system MUST be modular and each feature MUST belong to the smallest correct boundary.
- Modules SHOULD have clear ownership and responsibilities.
- Core functionality SHOULD NOT be converted into plugins without concrete benefit.
- Verification MUST include module map review, core/module/plugin decision records, and
  contract tests.

### Plugin Requirements (PLG-01)
- Plugin resolution MUST NOT require loading/scanning every plugin per request.
- Plugin resolution MUST resolve only capabilities required by the current operation.
- Plugins MUST NOT load on the critical path unless required.
- Plugins MUST operate under explicit permissions and SHOULD be independently disableable.
- Plugin discovery SHOULD be lazy; contract versioning SHOULD be independent when practical.
- Plugin resolution MAY use caching where beneficial.
- Verification MUST include manifest validation, permission tests, contract compatibility
  tests, and plugin-resolution performance checks.

### Infrastructure Requirements (INF-01)
- Next.js, Clerk, Neon, Redis, Vercel Queues, AI providers, and external APIs MUST be
  treated as infrastructure dependencies/providers accessed through adapters.
- Domain/Application MUST depend only on abstractions; vendor-specific types MUST NOT leak
  into Domain or Application.
- Replacing an adapter MUST NOT require Domain business-rule changes.
- Clerk integration MUST be isolated behind an identity/authentication boundary defined by
  Application contracts.
- Adapters SHOULD provide fakes/test doubles where practical.
- Verification MUST include ports inventory, import boundary checks, and adapter replacement
  tests.

## Operational, Security, Quality, and Evolution Requirements

### Data Requirements (DAT-01)
- Redis MAY be used for caching, ephemeral state, rate limiting, coordination, and other
  infrastructure concerns only if loss cannot corrupt business truth.
- Authoritative business state MUST NOT exist only in Redis.
- Correctness MUST NOT depend on a Redis lock or cache entry.
- Cache misses MUST NOT make the system incorrect.
- Redis-based rate limiting MAY fail open or fail closed according to application security
  policy, but MUST NOT corrupt business state.
- Verification MUST include cache-off tests, data ownership matrix, transaction review, and
  persistence tests.

### Async Job Requirements (ASY-01)
- Vercel Queues MUST remain an infrastructure dependency used through adapters.
- Application MUST define job contracts.
- Every job MUST define idempotency, failure behavior, and timeout behavior.
- Retry behavior MUST be defined for retryable jobs; side-effecting jobs SHOULD be
  idempotent.
- Outbox and DLQ patterns SHOULD be used when consistency and durable failure handling
  requirements justify them.
- Verification MUST include job contract tests, retry tests, failure injection, and
  idempotency tests.

### Security Requirements (SEC-01)
- Clerk MAY provide authentication/identity infrastructure.
- Authorization and business permissions MUST remain platform-controlled.
- Tenant isolation MUST be enforced at Application and data-access boundaries.
- Plugins MUST operate under explicit permissions.
- Secrets MUST remain outside source code and sensitive operations MUST be auditable.
- Authentication MUST NOT be treated as authorization.
- Verification MUST include authorization tests, permission matrix checks, tenant isolation
  tests, and audit review.

### MVP Discipline (MVP-01)
- MVP scope MUST prioritize core commerce and customer communication.
- Features MUST NOT be implemented before required.
- Architecture choices MUST avoid forcing speculative integrations, plugins, distributed
  patterns, or operational complexity before MVP necessity.
- Specs SHOULD define explicit non-goals; feature flags SHOULD gate controlled rollout when
  needed.
- Verification MUST include scope review, non-goals review, and feature audit.

### Quality Requirements (QUA-01)
- Critical business logic MUST have automated tests.
- Critical shared contracts MUST have contract tests.
- Structured logging and error observability MUST exist.
- Architectural complexity MUST have measurable purpose.
- Metrics/tracing SHOULD be introduced when measurable value exists.
- Performance budgets SHOULD cover critical paths and monitoring SHOULD evolve for p95
  latency, database queries, bundle size, and cold starts as scale requires.
- Verification MUST include test gates, contract tests, performance tests, and observability
  review.

### Controlled Evolution (EVO-01)
- New functionality MUST use the smallest appropriate boundary.
- Breaking contract changes MUST be deliberate and versioned.
- Architectural decisions MUST be documented in ADRs.
- Deprecated contracts MUST have migration/removal paths.
- Shared contracts SHOULD use semantic versioning and SHOULD be protected by compatibility
  tests.
- Verification MUST include ADR review, versioning review, deprecation review, and
  compatibility tests.

### Spec Kit Compliance Gates
- `/specify` MUST identify applicable principles, scope, non-goals, source of truth,
  affected contracts, and Core/Module/Plugin classification.
- `/plan` MUST identify architecture boundaries, ports/adapters, data ownership, cache
  strategy, job contracts, authorization boundaries, and plugin permissions when applicable.
- `/tasks` MUST include critical tests, contract tests, observability, performance
  requirements, and migration requirements where applicable.
- `/implement` MUST verify dependency direction, no vendor leakage, tenant isolation,
  cache independence, job correctness, permission enforcement, and contract compatibility.

### Non-Goals
This constitution MUST NOT be interpreted to require all functionality as plugins, Redis as a
business datastore, domain logic coupled to infrastructure, premature distributed-system
complexity, implementation of future functionality before MVP need, vendor-specific business
logic, or excessive abstraction without measurable benefit.

## Governance

- This constitution MUST use Semantic Versioning.
- Amendments MUST be approved through an ADR and review.
- Breaking amendments MUST include a migration plan.
- Specs, plans, and tasks MUST NOT violate constitutional MUST requirements.
- Deviations from SHOULD requirements MUST include explicit justification.
- Each Spec Kit phase MUST pass applicable compliance checks.
- Exceptions MUST be specific, temporary, and documented through an ADR with risk mitigation
  or removal plan.
- Permanent exceptions MUST be converted into constitutional amendments.
- Every constitutional principle MUST have a defined verification method and critical
  architectural decisions MUST be reviewable via checklists, tests, or automation.

**Version**: 1.0.1 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-29
