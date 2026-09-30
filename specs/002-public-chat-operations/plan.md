# Implementation Plan: Public Customer Interaction Operations

**Branch**: `002-public-chat-operations` | **Date**: 2026-09-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-public-chat-operations/spec.md`, with `PRD.md`, the existing MVP architecture, and the project constitution as authoritative context.

## Summary

Complete workflow-scoped public product and widget entry points, customer conversations, optional AI assistance with immediate human takeover, and Telegram operations without changing existing Account, Subscription, membership, permission, workflow, or commerce ownership rules. Keep business decisions in existing Core application use cases; keep AI and Telegram as replaceable Plugins; connect persistence and providers through ports/adapters. Replace scaffold/stub route wiring with those use cases rather than rebuilding completed domain behavior.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16 App Router  
**Primary Dependencies**: Existing Next.js/React application; Prisma persistence adapter; Clerk identity adapter; Neon-hosted PostgreSQL; Redis rate-limit adapter; Vercel Queues adapter; optional AI provider adapter; Telegram integration adapter  
**Storage**: PostgreSQL is the source of truth for workflow settings, public pages, customers, conversations, messages, plugin connections, and audit events. Redis is limited to ephemeral rate-limit/coordination data.  
**Testing**: Existing Vitest unit, integration, contract, and E2E suites; ESLint and TypeScript checks  
**Target Platform**: Multi-tenant Next.js web application and public/API routes  
**Project Type**: Modular monolith, Core Modules + Plugins  
**Performance Goals**: Preserve constitution budgets (p95 API <300ms, p95 purchase-intent <800ms, <10 DB queries per critical request); public and plugin paths load only required capabilities.  
**Constraints**:
- Preserve Account → Subscription → Members/Roles/Permissions → Workflow. Account owns governance; Workflow owns operational commerce and interaction data.
- Resolve and authorize a workflow before reading or changing workflow-owned records. Public routes must resolve exactly one workflow and deny ambiguous/unresolved context.
- Keep business rules in Domain/Application; routes are presentation/wiring. Applications define ports; Prisma, Clerk, Redis, queue, and channel/provider integrations remain adapters.
- Reuse current domain entities and use cases where complete. Extend only missing persistence, message/control lifecycle, configuration, or channel behavior.
- AI remains optional; manual handling cannot depend on AI or queue availability.
- Avoid a website builder, a second authorization model, a new ORM, microservices, a new queue platform, or advanced billing/metering.
**Scale/Scope**: Three feature scenarios and the FR-001–FR-017 scope in `spec.md`; initial channel is Telegram.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **ARCH-01 / INF-01 — Clean boundaries and adapters: PASS.** Core applications expose ports; route handlers only validate/translate/wire; Prisma, Clerk, Redis, Vercel Queues, AI, and Telegram implementations stay outside Domain/Application.
- **MOD-01 / PLG-01 / PLG-02 — Core and plugin placement: PASS.** Conversation and public commerce behavior remain Core; AI and Telegram are optional plugins with deterministic, capability-scoped resolution and versioned contracts.
- **DAT-01 / TEN-01 — Source of truth and ownership: PASS.** PostgreSQL owns durable business records and every operational record is workflow-scoped. Redis holds no business truth.
- **SEC-01 — Authorization and audit: PASS.** Reuse the existing identity → account membership → capability → workflow access → operation checks. Public visitor tokens grant only their own widget conversation; Telegram identities resolve through a trusted member binding. Sensitive decisions/actions are audited.
- **ASY-01 — Queue semantics: PASS.** Only optional AI assistance is queued; specify idempotency, timeout, retry/backoff, max retries, and DLQ. A queue/provider failure never blocks manual conversation handling.
- **ERR-01 / OBS-01 — Failure and observability: PASS.** Translate errors at boundaries, define retryability, use correlation IDs, and exclude message PII and secrets from logs.
- **QUA-01 / MVP-01 — Validation and scope: PASS.** Cover unit, integration, contract, E2E, authorization/isolation, manual fallback, and existing performance gates; no new infrastructure beyond current adapters.

No constitutional exceptions or complexity additions are required.

## Architecture and Incremental Delivery

1. **Complete the Core application boundary.** Inventory existing public-page, widget-session/message, conversation, purchase-intent, AI handoff, and Telegram use cases. Add only missing repository/provider ports and durable Prisma adapters for existing domain records. Persist workflow interaction settings and enabled public-page configuration. Enforce uniqueness and workflow-consistent foreign keys for page slug/product and all conversation/customer/message relations.
2. **Finish public product and widget entry points.** Resolve a public slug or opaque workflow reference to one active Workflow before loading a product or accepting input. Enforce page visibility, widget enabled state, configured allowed origins, request validation, size limits, and rate limits. Create guest customer/conversation records through Core use cases; preserve page product context; issue a scoped opaque session credential for widget messages. Disabled/unknown pages are unavailable without leaking private product data.
3. **Finish manual conversation operations and identity progression.** Persist messages and customer identity upgrades in the same Workflow. Validate the widget credential against the requested conversation and workflow. Keep staff conversation read/reply endpoints behind Clerk identity and existing capability/workflow authorization.
4. **Add optional AI and reliable handoff.** Reuse the AI plugin’s assistance and handoff use cases. Queue assistance only for an enabled workflow and AI-controlled conversation. Before applying a generated response, reload and verify that the conversation remains in the same Workflow and is still AI-controlled; human takeover wins races. Provider/queue failures leave messages and manual handling available.
5. **Secure Telegram and configuration operations.** Connect/disconnect plugin per Workflow; verify inbound channel signatures/webhook secret through the adapter; map the external Telegram identity to a trusted Account member; load current membership, capability, and workflow grants server-side; invoke the same Core use cases as dashboard actions. Never trust caller-supplied member IDs, capabilities, or access lists. Audit connection/config changes and allow/deny outcomes.
6. **Validate incrementally and harden failures.** Add tests alongside each step; finish with the end-to-end public-to-conversation, AI-to-human, and Telegram authorized/denied flows, workflow isolation, abuse controls, audit coverage, and adapter/queue failure behavior. See [quickstart.md](quickstart.md).

### Boundaries, Ports, Adapters, and Dependencies

| Boundary | Owns / responsibility | Application contracts (ports) | Adapters / callers |
|---|---|---|---|
| Core Products + Workflow | Workflow public-page and widget configuration; active product page resolution | `PublicProductPageRepository`, `WorkflowInteractionSettingsRepository` | Prisma repositories; Next public product route and authorized settings route |
| Core Customers + Conversations | Guest/identified customer, workflow-bound conversation, messages, handler/control state | `CustomerRepository`, `ConversationRepository`, `ConversationMessageRepository`, `WidgetSessionTokenPort`, `RateLimitPort`, `InteractionAuditPort` | Prisma; opaque token verifier; Redis limiter; route handlers; existing purchase-intent use case |
| Core Authorization + Account/Workflow | Member identity and grants; operation authorization; sensitive audit records | Existing authorization/application use cases and identity/audit ports | Clerk adapter; Prisma grants/audit adapter; dashboard routes |
| AI Plugin | Optional response assistance, no authority to access other workflows or override human control | Existing conversation-assistance entry point plus `ConversationAIJobV1` | Capability resolver, provider adapter, Vercel Queues producer/consumer |
| Telegram Plugin | Verify channel request, map identity, parse a bounded command, call a Core operation | Member-identity binding and Core application operation contracts | Telegram webhook/connector adapter; plugin connection from Core |
| Presentation (`src/app`) | HTTP validation, response/error translation, adapter wiring | Public and merchant HTTP contracts | Next.js public/widget/API route handlers |

Dependency direction remains inward: routes and adapters call Application; Application depends on Domain and ports; Plugins call stable Core application contracts and do not import route handlers or repository implementations. Clerk authentication does not itself authorize an operation.

### Project Structure

#### Documentation (this feature)

```text
specs/002-public-chat-operations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── public-interaction-api.md
    └── plugin-job-contracts.md
```

#### Source Code (repository root)

```text
project-code/src/
├── app/
│   ├── public/[workflowRef]/products/[productSlug]/
│   ├── widget/[workflowRef]/
│   └── api/{workflows,plugins}/
├── core/
│   ├── account/{application,infrastructure}/
│   ├── authorization/{application,infrastructure}/
│   ├── workflow/{application,domain,infrastructure}/
│   └── commerce/{products,customers,conversations}/
│       ├── application/
│       ├── domain/
│       └── infrastructure/
├── plugins/{ai,telegram,integrations}/
└── shared/{contracts,jobs,observability}/
project-code/tests/{unit,integration,contract,e2e}/
```

**Structure Decision**: Extend the existing Next.js modular monolith at `project-code/`. Put durable adapters beside their Core module; keep AI/Telegram provider-specific code within Plugins; do not add a separate service or application.

## Phase 0: Research Outcome

See [research.md](research.md). The existing PRD, MVP plan, implementation scaffold, and constitution resolve the feature’s architecture choices; no outstanding technology or product clarification is needed for this plan.

## Phase 1: Design Output

- Workflow ownership, entities, invariants, and lifecycle: [data-model.md](data-model.md)
- Public, merchant, Telegram, and job interfaces: [contracts/](contracts/)
- Runnable validation sequence and expected outcomes: [quickstart.md](quickstart.md)

## Post-Design Constitution Check

- **ARCH-01 / INF-01**: PASS — dependency direction, ports/adapters, and no vendor types in Domain/Application are explicit.
- **MOD-01 / PLG-01 / PLG-02**: PASS — interaction/conversation policy remains Core; AI/Telegram are isolated, optional plugins.
- **DAT-01 / TEN-01**: PASS — PostgreSQL is authoritative, Redis is ephemeral, every operational record has workflow ownership, and repository operations scope by workflow.
- **SEC-01**: PASS — trusted identity resolution and the existing authorization pipeline precede merchant/plugin operations; public credentials are conversation-scoped; audit retention follows policy.
- **ASY-01**: PASS — AI job delivery is at-least-once and idempotent, has bounded retry/backoff, timeout, and DLQ behavior; enqueue/provider failure preserves manual operations.
- **ERR-01 / OBS-01**: PASS — failure classes, correlation, and PII/secret-safe logs are covered by contracts and validation.
- **QUA-01 / MVP-01**: PASS — tests map to scenarios and preserve performance/scope constraints without new infrastructure or changes to completed governance/commerce behavior.

## Complexity Tracking

No constitutional violations; no exception or additional infrastructure is proposed.
