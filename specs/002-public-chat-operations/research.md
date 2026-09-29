# Phase 0 Research: Public Customer Interaction Operations

Decisions are based on `PRD.md`, `specs/001-workflow-saas-mvp/{plan.md,research.md,data-model.md}`, the current `project-code/src` scaffold, and `.specify/memory/constitution.md`. Existing entities and application use cases are retained where they already express the required business behavior.

## Decision 1: Extend the current modular monolith, not create a new service

- **Decision**: Keep public presentation in Next.js routes, interaction/business policy in Core application use cases, and channel/provider-specific behavior in Plugins and Infrastructure adapters.
- **Rationale**: This matches the current Core + Modules + Plugins layout and ARCH-01/MOD-01. Current code already has product-page, widget-session/message, AI handoff, and Telegram application entry points; the main gap is trusted persistence and route wiring, not a new architecture.
- **Alternatives considered**: Microservices or a separate chat service (rejected: unnecessary operational and consistency costs for this MVP); route-handler business logic (rejected: violates clean boundaries).

## Decision 2: Keep ownership and authorization hierarchical

- **Decision**: Account owns subscription, membership, roles, and permissions; Workflow owns products, customers, pages/configuration, conversations, messages, plugin connections, and related operational audit context. Merchant operations use the existing identity → account membership → capability → workflow access → resource operation sequence. Public visitors receive only narrowly scoped widget credentials.
- **Rationale**: Matches PRD Sections 2–6 and 10–11, the feature spec, and TEN-01/SEC-01. Neither a public identifier nor Telegram identity establishes authorization by itself.
- **Alternatives considered**: Account-owned operational records, workflow inference from arbitrary resource IDs, or plugin-specific authorization (rejected: weak ownership/isolation or governance bypass).

## Decision 3: PostgreSQL/Prisma is durable truth; Redis is only abuse-control infrastructure

- **Decision**: Store all durable interaction and audit state in PostgreSQL through Prisma repositories. Use Redis only behind a rate-limit/ephemeral-state port; if unavailable, apply the documented limiter failure policy without treating Redis as business truth.
- **Rationale**: DAT-01/TEN-01 and the existing project data-access constraint require durable, workflow-scoped state and no ORM replacement. Public sessions must resolve to durable conversations even if ephemeral infrastructure is unavailable.
- **Alternatives considered**: Redis as conversation/session source of truth (rejected); new persistence/ORM stack (rejected); an external session platform (rejected as unneeded).

## Decision 4: Public surfaces resolve context before use and use scoped credentials

- **Decision**: Resolve a public product slug or widget workflow reference to exactly one enabled Workflow/page before reading or mutating records. The server enforces widget origin configuration and issues an opaque, limited session token that is bound to a workflow and conversation; clients cannot select a customer, conversation, product, or member by arbitrary ID.
- **Rationale**: Satisfies FR-001–FR-005/FR-013/FR-017 while preventing workflow fallback and identifier substitution. Existing domain use cases express origin checks and guest-to-identified promotion but current route examples construct permissive in-memory configuration, so plans require trusted repository-backed configuration.
- **Alternatives considered**: Trust client-provided workflow/product context or treat CORS/origin as authentication (rejected: neither is a secure ownership or access boundary); public dashboard credentials (rejected).

## Decision 5: Manual handling is primary; AI is an optional plugin enhancement

- **Decision**: Persist customer messages and conversation-control transitions in Core. Call AI only when enabled and the conversation is AI-controlled. Before saving an AI response, re-check workflow ownership and handler state so an intervening human takeover always wins. Manual read/reply/takeover remain available during AI/provider/queue failure.
- **Rationale**: Satisfies FR-006–FR-008 and reuses existing `assist-conversation` / `handoff-to-human` application use cases. A provider outage can degrade assistance without losing communication.
- **Alternatives considered**: AI-mandatory message pipeline or AI-controlled authorization (rejected); provider implementation in Core (rejected).

## Decision 6: Reuse Vercel Queues only for optional AI work

- **Decision**: Define a versioned, at-least-once AI-assistance job with a stable idempotency key, bounded timeout/retries/backoff, and dead-letter handling. Queue adapters implement the existing job port. A queue outage does not reject or roll back a stored customer message; the conversation remains available for a human.
- **Rationale**: Aligns with ASY-01 while limiting asynchronous infrastructure to work that can run independently of the core manual path.
- **Alternatives considered**: Fire-and-forget with no failure contract (rejected); exactly-once delivery, a new broker, or a general workflow engine (rejected as unnecessary complexity).

## Decision 7: Telegram is a replaceable plugin that invokes Core use cases

- **Decision**: Verify inbound webhook authenticity in the adapter, resolve the external sender through a trusted plugin-member binding, read current membership/permissions/workflow grants, then invoke the same application operation as the dashboard. Connection state is workflow-owned and disconnect disables operations.
- **Rationale**: Satisfies FR-009–FR-012 and avoids the current route scaffold's unsafe pattern of accepting member/capability/workflow-access values from request JSON.
- **Alternatives considered**: Treat sender ID as a platform member or accept authorization claims from the caller (rejected); let Telegram mutate domain records directly (rejected).

## Decision 8: Audit sensitive interaction and authorization outcomes

- **Decision**: Persist configuration/connection changes, AI/human control transitions, and Telegram authorization allow/deny events in the existing audit model, including account/workflow, trusted actor when known, action, result, target, timestamp, and non-sensitive correlation metadata. Apply the constitution's minimum 365-day retention for sensitive audit records.
- **Rationale**: Fulfills FR-016 and SEC-01 while keeping audit as Core platform capability rather than plugin-private history.
- **Alternatives considered**: Logs as audit source or channel-specific audit stores (rejected: not durable/complete and inconsistent).

## Decision 9: Validate at each boundary and retain current test tooling

- **Decision**: Use existing Vitest/ESLint and test layers for use cases, repository/adapter behavior, public/plugin contracts, and full scenarios. Cover negative workflow-isolation/authorization cases, queue/provider outages, stale control state, invalid origins, disabled resources, and rate-limit behavior.
- **Rationale**: Existing project tests already divide unit, integration, contract, and E2E scenarios; QUA-01 requires this pyramid and security/isolation tests.
- **Alternatives considered**: Add a new test platform or rely only on route-level E2E tests (rejected: duplication or inadequate fault isolation).
