<!--
Sync Impact Report
- Version change: 1.0.1 → 1.0.0
- Modified principles:
  - ARCH-01, MOD-01, PLG-01, INF-01, DAT-01, ASY-01, SEC-01, MVP-01, QUA-01, EVO-01
  - GOV-01, GOV-02, GOV-03, GOV-04
- Added principles:
  - PLG-02, ERR-01, OBS-01, CFG-01, PAY-01, TEN-01, DATA-RET-01, WH-01
- Added sections:
  - 0.5 MVP Scope
- Removed sections:
  - Duplicate "Core Principles I–V" block
- Follow-up TODOs:
  - None
-->

# SaaS E-Commerce Constitution (v1.0.0 FINAL)

## 0. Governance & Compliance

### GOV-01 — Versioning
**Statement**
- This Constitution MUST use Semantic Versioning.
- Constitutional changes MUST increment version using: MAJOR (breaking governance changes),
  MINOR (new principle/section), PATCH (clarification/refinement).
- Constitutional metadata MUST remain consistent across title and footer.

**Rationale**
Version discipline makes governance changes explicit, auditable, and safe to adopt.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated check that footer version/date fields exist and parse.
  - Manual review that bump type matches the amendment scope.

### GOV-02 — Compliance
**Statement**
- Specs, plans, tasks, and implementation artifacts MUST NOT violate constitutional MUST or
  MUST NOT requirements.
- Any deviation from SHOULD or SHOULD NOT requirements MUST be documented through GOV-03,
  including justification, scope, risk, owner, and expiry/review date.

**Rationale**
Compliance gates are only enforceable when deviations are explicit and time-bounded.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated compliance checklist in `/specify`, `/plan`, `/tasks`, `/implement`.
  - Manual review of recorded SHOULD/SHOULD NOT deviations.

### GOV-03 — Exceptions
**Statement**
- Exceptions MUST be specific, temporary, and documented via ADR.
- Each exception MUST include mitigation, owner, and removal or review date.
- Permanent exceptions MUST be converted into constitutional amendments.

**Rationale**
Exception control prevents drift while preserving practical delivery flexibility.

**Verification**
- **Type**: Manual
- **Checks**:
  - ADR review confirms scope, owner, risk controls, and retirement conditions.

### GOV-04 — Verification Ownership and Cadence
**Statement**
- Every constitutional principle MUST define verifiable checks.
- Architecture compliance MUST be reviewed at least quarterly.
- A named **Architecture Owner** role MUST own constitutional amendments, quarterly review,
  and compliance disposition.

**Rationale**
Clear ownership and recurring review keep governance enforceable and current.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated reminder/check for quarterly review records.
  - Manual verification that Architecture Owner assignment is current.

## 0.5 MVP Scope

- The MVP MUST focus on core commerce and customer communication only.
- MVP **in-scope** capabilities are:
  - Product catalog and variants.
  - Cart and checkout.
  - Orders with an explicit order state machine.
  - Payments through an isolated provider adapter behind a Payment Port.
  - Inventory with basic availability; reservations are explicitly supported.
  - Notifications: email at minimum; SMS is optional.
  - Multi-currency: **out-of-scope** for MVP.
  - Tax: basic tax calculation is in-scope.
  - Shipping: basic shipping options/rates are in-scope.
  - Returns/refunds: basic refunds are in-scope; full returns workflow is out-of-scope.
- Any capability not listed above MUST be treated as an MVP Non-Goal.

## 1. Normative Definitions

- **Core**: Essential business capabilities required by the platform, organized as cohesive
  internal Modules.
- **Module**: A cohesive internal unit inside the Core boundary.
- **Plugin**: Optional, replaceable, integration-specific, or independently extensible
  capability.
- **Port**: Application-layer abstraction that defines required behavior.
- **Adapter**: Infrastructure-side implementation of a Port.
- **Contract**: Versioned interface, schema, or event exchanged across boundaries.
- **Source of Truth**: Authoritative persistent business state.
- **Ephemeral Data**: Re-creatable data that does not define business truth.
- **Infrastructure Dependency**: External framework/platform/provider/service used through
  adapters.

## 2. Architectural Principles

### ARCH-01 — Clean Architecture Boundaries
**Statement**
- The system MUST separate Domain, Application, Infrastructure, and Presentation layers.
- Dependencies MUST point inward.
- Domain and Application MUST NOT import Next.js, Clerk, Neon, Redis, Vercel Queues,
  AI providers, or external API implementations.
- Business logic MUST NOT live in route handlers, server actions, or UI components.
- Presentation MUST consume Application contracts; Infrastructure MUST implement Application
  Ports.

**Rationale**
Boundary discipline preserves testability, replaceability, and low coupling.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated or reviewable dependency-boundary checks and dependency analysis.
  - Manual architecture review of business logic placement.

### MOD-01 — Core / Module / Plugin Boundaries
**Statement**
- The system MUST be modular.
- Essential capabilities MUST stay in Core Modules.
- Optional or integration-specific capabilities SHOULD be Plugins; deviations from this SHOULD
  MUST follow GOV-03.
- Features MUST be placed in the smallest correct boundary (Core, Module, Plugin, Adapter,
  Use Case).

**Rationale**
Correct boundary placement prevents needless runtime overhead and design sprawl.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Manual module map and boundary decision review.
  - Contract tests at module/plugin boundaries.

### PLG-01 — Plugin Isolation and Performance
**Statement**
- Every Plugin MUST declare a versioned manifest with `id`, `version`, `permissions`,
  `lifecycle`, and `contracts`.
- Plugins MUST communicate only through Core/Application contracts.
- Plugins MUST NOT directly depend on other plugin implementations.
- Plugin architecture MUST NOT introduce unnecessary critical-path work.
- Resolution MUST NOT scan/load all plugins per request.
- Resolution MUST load only capabilities required by the current operation.
- Plugin discovery SHOULD be lazy; exceptions to this SHOULD MUST follow GOV-03.
- Plugin resolution MAY use caching when measurable performance benefit exists.

**Rationale**
Plugins must remain replaceable without turning extensibility into request-time tax.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated manifest validation, permission tests, compatibility tests.
  - Automated plugin-resolution performance checks.

### PLG-02 — Plugin Resolution Model
**Statement**
- Plugin resolution MUST use a declared deterministic model (registry, DI, or
  capability-based resolver).
- Version resolution MUST be deterministic and documented.
- Resolution conflicts MUST fail explicitly with actionable errors.

**Rationale**
Deterministic resolution prevents hidden behavior changes and production ambiguity.

**Verification**
- **Type**: Automated
- **Checks**:
  - Resolution determinism tests.
  - Conflict detection/failure tests.

### INF-01 — Infrastructure Dependency Isolation
**Statement**
- Next.js, Clerk, Neon, Redis, Vercel Queues, AI providers, and external APIs MUST be treated
  as replaceable infrastructure dependencies, not Domain/Application concerns.
- These dependencies MUST be accessed through Application Ports and Infrastructure Adapters.
- Vendor-specific types MUST NOT leak into Domain or Application.
- Replacing an Adapter MUST NOT require Domain rule changes.
- Clerk integration MUST be behind an identity/authentication Port.
- Adapters SHOULD provide test doubles/fakes; exceptions to this SHOULD MUST follow GOV-03.

**Rationale**
Provider independence keeps business logic stable while infrastructure evolves.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated import boundary checks.
  - Manual ports/adapters inventory and adapter-replacement review.

### DAT-01 — Source of Truth and Redis Discipline
**Statement**
- PostgreSQL MUST be the Source of Truth for persistent business state.
- Neon MUST be treated as the current replaceable PostgreSQL provider.
- Redis MUST NOT be the Source of Truth for business state.
- Redis MAY be used for caching, ephemeral state, rate limiting, coordination, and other
  infrastructure concerns.
- Loss of Redis MUST NOT corrupt business truth.
- Cache misses MUST NOT make the system incorrect.
- Redis failure MUST NOT invalidate persistent business state.
- Correctness MUST NOT depend on Redis locks/cache entries.
- Data retention and PII handling MUST follow DATA-RET-01.

**Rationale**
Durable correctness depends on persistent truth, not ephemeral infrastructure.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated cache-off and persistence correctness tests.
  - Manual data ownership matrix and transaction review.

### ASY-01 — Asynchronous Jobs and Queue Contracts
**Statement**
- Vercel Queues MUST remain an infrastructure dependency behind queue adapters.
- Application MUST define Job Contracts.
- Delivery semantics MUST be explicitly defined per job; default is at-least-once.
- Ordering MUST NOT be assumed unless declared in the Job Contract.
- Every job MUST define idempotency, timeout, failure behavior, retry policy, max retries,
  and backoff strategy for its job class.
- DLQ behavior MUST be defined for retry exhaustion.
- Outbox SHOULD be used when DB state and queued work consistency requires it; exceptions to
  this SHOULD MUST follow GOV-03.

**Rationale**
Asynchronous correctness requires explicit delivery, retry, and failure semantics.

**Verification**
- **Type**: Automated
- **Checks**:
  - Job contract tests.
  - Retry/backoff, DLQ, timeout, and idempotency tests.

### SEC-01 — Authentication, Authorization, and Secrets
**Statement**
- Clerk MAY provide authentication/identity infrastructure.
- Authentication MUST NOT be treated as authorization.
- Authorization and business permissions MUST remain platform-controlled.
- Tenant isolation MUST be enforced at Application and data-access boundaries.
- Plugin permissions MUST be explicit.
- Secrets MUST NOT be stored in source code.
- Secret rotation policy MUST exist with defined rotation interval and emergency rotation path.
- Sensitive operations MUST be auditable.
- Audit logs for sensitive operations MUST be retained for at least 365 days.
- Redis rate-limit fail-open/fail-closed behavior MUST follow the application security policy
  and MUST NOT corrupt business state.

**Rationale**
Security control failures are architectural failures unless boundaries and policies are explicit.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated authorization and tenant-isolation tests.
  - Manual secret-rotation and audit-retention policy review.

### ERR-01 — Error Handling and Taxonomy
**Statement**
- Errors MUST be classified as Domain, Application, or Infrastructure errors.
- Domain MUST NOT throw infrastructure-specific errors.
- Errors MUST be translated at layer boundaries to boundary-appropriate types.
- Errors MUST declare retryable vs non-retryable behavior.

**Rationale**
A stable error taxonomy prevents coupling and enables reliable retry behavior.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated boundary translation and retry classification tests.
  - Manual taxonomy review.

### OBS-01 — Observability Contract
**Statement**
- Structured logs MUST be used with correlation IDs.
- Traces MUST cross Application and Infrastructure boundaries for critical flows.
- Log levels MUST be standardized: debug, info, warn, error.
- PII MUST NOT appear in logs.

**Rationale**
Diagnosability must be built into contracts, not added after incidents.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated log schema and PII-redaction checks.
  - Automated/Manual trace coverage review for critical flows.

### CFG-01 — Configuration and Feature Flags
**Statement**
- Runtime config and build-time config MUST be distinguished.
- Secrets MUST NOT be stored in config files committed to source.
- Feature flags MUST be typed, explicitly gated, and scoped.
- Each feature flag MUST have an owner and expiry or review date.

**Rationale**
Configuration and flag discipline prevents hidden behavior drift and stale controls.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated config schema checks.
  - Manual config inventory and flag audit.

### PAY-01 — Payment Isolation and PCI Discipline
**Statement**
- Payment providers MUST be isolated behind a Payment Port and Adapter.
- Card data MUST NOT enter platform storage, logs, or Domain models.
- Payment operations MUST be idempotent.
- Payment webhook signatures MUST be verified.
- Refunds MUST be first-class operations with audit trails.

**Rationale**
Payment boundaries reduce PCI scope and protect critical money flows.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated idempotency and webhook signature tests.
  - Manual PCI scope review and provider swap review.

### TEN-01 — Multi-Tenancy Model
**Statement**
- The tenancy model MUST be explicit and documented (shared schema,
  schema-per-tenant, or DB-per-tenant).
- Every persistent entity MUST declare tenant ownership.
- Cross-tenant access MUST be impossible by default.

**Rationale**
Tenant safety requires explicit ownership and deny-by-default data access.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated tenant isolation tests.
  - Manual data ownership matrix review.

### DATA-RET-01 — Data Retention and PII
**Statement**
- PII MUST be classified by data class.
- Retention periods MUST be defined per data class.
- Right-to-erasure MUST be implementable and auditable.

**Rationale**
Retention and erasure controls are mandatory for compliant customer data handling.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Manual PII inventory and retention policy review.
  - Automated/Manual erasure workflow verification.

### WH-01 — Outbound Webhook Contracts
**Statement**
- Outbound webhooks MUST use versioned contracts.
- Delivery MUST be at-least-once with retries and DLQ.
- Webhook payloads MUST be signed.

**Rationale**
External integrations require durable and verifiable delivery guarantees.

**Verification**
- **Type**: Automated
- **Checks**:
  - Contract compatibility tests.
  - Retry/DLQ behavior tests.
  - Signature generation/verification tests.

### MVP-01 — MVP Scope Control
**Statement**
- MVP delivery MUST prioritize the scope defined in Section 0.5.
- Features outside Section 0.5 MUST be treated as Non-Goals unless approved via GOV-03.
- Architecture MUST NOT force future integrations, future plugin ecosystems, advanced billing,
  distributed-system patterns, or complex observability before required for correctness,
  security, or current MVP outcomes.

**Rationale**
Scope discipline preserves delivery speed and operational simplicity.

**Verification**
- **Type**: Manual
- **Checks**:
  - Scope and Non-Goals review in specs/plans/tasks.

### QUA-01 — Engineering Quality and Performance
**Statement**
- The testing pyramid MUST be enforced: Unit, Integration, Contract, E2E.
- Critical business logic MUST have automated tests.
- Every shared contract MUST have contract tests.
- Plugin contracts MUST have contract tests.
- Adapter implementations SHOULD provide test doubles/fakes; exceptions to this SHOULD MUST
  follow GOV-03.
- The checkout critical path MUST have E2E coverage.
- Critical test suites MUST pass before merge.
- Structured logging and error observability MUST exist.
- Performance budgets MUST be enforced with these baselines:
  - p95 API latency < 300ms
  - p95 checkout flow < 800ms
  - DB queries per request < 10
  - cold start < 2s
  - critical-path JS bundle < 200KB gzip
- Performance budgets MUST be reviewed at least quarterly.

**Rationale**
Quality gates must protect correctness and performance on the revenue-critical path.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated test gates, contract tests, and E2E checkout test.
  - Automated performance checks where available.
  - Manual quarterly performance budget review.

### EVO-01 — Controlled Evolution and Deprecation
**Statement**
- New functionality MUST use the smallest appropriate boundary.
- Breaking contract changes MUST be deliberate, versioned, and announced.
- Shared contracts MUST use Semantic Versioning.
- Deprecated external contracts MUST have a minimum 90-day deprecation window.
- Deprecated internal contracts MUST have a minimum 2-release deprecation window.
- Every deprecation MUST have a named owner, migration guidance, and removal date.
- Architectural decisions MUST be documented via ADR.

**Rationale**
Change safety depends on clear timelines, ownership, and compatibility policy.

**Verification**
- **Type**: Hybrid
- **Checks**:
  - Automated compatibility/version checks where available.
  - Manual ADR and deprecation plan review.

## 3. Spec Kit Compliance Gates

- `/specify` MUST identify applicable constitutional principles, scope, non-goals,
  Source of Truth, affected contracts, tenant implications, and Core/Module/Plugin
  classification.
- `/plan` MUST define architecture boundaries, ports/adapters, data ownership, cache strategy,
  job contracts, error taxonomy, observability, security boundaries, and plugin permissions.
- `/tasks` MUST include critical tests, contract tests, checkout E2E, performance checks,
  observability tasks, migration/deprecation tasks, and compliance checkpoints.
- `/implement` MUST verify dependency direction, no vendor leakage, tenant isolation,
  cache independence, queue/job correctness, payment isolation, permission enforcement,
  and contract compatibility.

## 4. Non-Goals

- Anything outside Section 0.5 MVP scope.
- Converting all Core capabilities into Plugins.
- Using Redis as business Source of Truth.
- Domain/Application dependence on infrastructure vendor types.
- Premature distributed-system complexity.
- Future integrations, future plugin ecosystems, or advanced billing before MVP need.
- Excessive abstraction without measurable operational or performance benefit.

## 5. Governance (Final)

- This Constitution is the authoritative architecture policy for this repository.
- PRs and reviews MUST include constitutional compliance checks.
- Amendments MUST follow GOV-01..GOV-04.
- The Architecture Owner MUST publish quarterly compliance outcomes and amendment decisions.

## 6. Version Footer

**Version**: 1.0.0  
**Ratified**: 2026-09-29  
**Last Amended**: 2026-09-29
