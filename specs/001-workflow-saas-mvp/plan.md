# Implementation Plan: Workflow-Centered SaaS E-Commerce MVP

**Branch**: `[001-workflow-saas-mvp]` | **Date**: 2026-09-29 | **Spec**: [/specs/001-workflow-saas-mvp/spec.md](/specs/001-workflow-saas-mvp/spec.md)

**Input**: Feature specification from `/specs/001-workflow-saas-mvp/spec.md`

## Summary

Deliver a workflow-centered MVP where Account governs subscription, membership, and access control, while each Workflow owns isolated commerce and communication operations (products, customers, conversations, orders), with optional AI and plugin integrations (including Telegram), public product pages, and chat widget support under one consistent authorization model.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16 (App Router)

**Primary Dependencies**: Next.js, React, Node runtime, PostgreSQL adapter (Neon), Redis adapter (cache/rate-limit/ephemeral), queue adapter (Vercel Queues), authentication provider adapter (Clerk), AI provider adapters, plugin connectors (Telegram + future channels)

**Storage**: PostgreSQL as source of truth for persistent business state; Redis for cache, rate-limiting, and ephemeral coordination only

**Testing**: ESLint (existing), TypeScript type checks, unit tests, integration tests, contract tests, and end-to-end workflow tests for critical journeys

**Target Platform**: Multi-tenant web application (server + dashboard + public endpoints) running on managed Linux/serverless infrastructure

**Project Type**: Web application (modular monolith with Core Modules + Plugins)

**Performance Goals**:
- Meet constitution baselines for critical paths:
  - p95 API latency < 300ms
  - p95 checkout/purchase-intent flow < 800ms
  - DB queries per request < 10 on critical flows
- Plugin resolution only loads required capabilities per operation (no global plugin scan)

**Constraints**:
- Business logic remains in Domain/Application layers, not route handlers/UI
- Authentication does not replace authorization
- All workflow-scoped access must enforce workflow isolation
- AI and integrations remain optional and replaceable behind adapters/plugins
- Avoid non-MVP infrastructure complexity (microservices, event mesh, workflow engines, advanced billing)

**Scale/Scope**:
- MVP scope from approved spec and PRD:
  - Account, Subscription, Members, Roles/Permissions, Workflow access/isolation
  - Workflow-owned Products, Customers, Conversations, Orders
  - Optional AI, Chat Widget, Public Product Pages, Plugins/Integrations
- Initial release optimized for small-to-mid merchant teams with multiple workflows per account under subscription limits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **ARCH-01 Clean Boundaries**: PASS — plan separates Domain/Application from Infra/Presentation and routes all external providers through ports/adapters.
- **MOD-01 Core/Module/Plugin Placement**: PASS — essential commerce/auth stays in Core Modules; AI/integrations/channels are Plugins.
- **PLG-01 + PLG-02 Plugin Isolation/Resolution**: PASS — plugin manifest + deterministic capability resolver + lazy per-operation loading.
- **INF-01 Infrastructure Isolation**: PASS — Clerk/Neon/Redis/Queues/AI providers treated as replaceable adapters.
- **DAT-01 Source of Truth**: PASS — persistent state in PostgreSQL; Redis explicitly non-authoritative.
- **ASY-01 Async Contract Discipline**: PASS — jobs include idempotency, retry/backoff, timeout, and DLQ behavior.
- **SEC-01 + TEN-01 Authorization & Tenant Isolation**: PASS — layered checks (identity → membership → role/permission → workflow access → operation), deny-by-default cross-workflow access.
- **MVP-01 Scope Control**: PASS — no website builder, advanced automation, advanced billing, or premature distributed architecture.
- **QUA-01 Quality/Performance Gates**: PASS — testing pyramid, contract tests, E2E critical flow coverage, and performance budget checks included.

No constitutional violations require exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/001-workflow-saas-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── account-workflow-api.md
│   ├── public-interaction-api.md
│   └── plugin-job-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
project-code/
├── src/
│   ├── app/
│   │   ├── (account)/
│   │   ├── (workflow)/
│   │   ├── api/
│   │   ├── widget/
│   │   └── public/
│   ├── core/
│   │   ├── account/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── workflow/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── commerce/
│   │   │   ├── products/
│   │   │   ├── customers/
│   │   │   ├── conversations/
│   │   │   └── orders/
│   │   └── authorization/
│   ├── plugins/
│   │   ├── ai/
│   │   ├── telegram/
│   │   └── integrations/
│   └── shared/
│       ├── contracts/
│       ├── jobs/
│       └── observability/
└── tests/
    ├── unit/
    ├── integration/
    ├── contract/
    └── e2e/
```

**Structure Decision**: Use a single Next.js codebase in `project-code/` with modular Core + Plugin boundaries inside `src/`, preserving clean architecture dependency direction and avoiding microservice complexity.

## Phase 0: Research Outcome

See `/specs/001-workflow-saas-mvp/research.md` for resolved decisions on module boundaries, workflow isolation, authorization model, plugin resolution, async job contracts, security controls, testing strategy, and performance guardrails.

## Phase 1: Design Output

- Data model documented in `/specs/001-workflow-saas-mvp/data-model.md`
- Contracts documented in `/specs/001-workflow-saas-mvp/contracts/`
- End-to-end validation guide documented in `/specs/001-workflow-saas-mvp/quickstart.md`

## Post-Design Constitution Check

- **ARCH-01 / INF-01**: PASS — contracts and model preserve ports/adapters and no vendor leakage into business rules.
- **MOD-01 / PLG-01 / PLG-02**: PASS — plugin contracts are isolated and capability-based; core operations remain core.
- **DAT-01 / TEN-01 / SEC-01**: PASS — entity ownership and contract auth requirements enforce workflow tenancy and deny-by-default access.
- **ASY-01**: PASS — async contracts define idempotency, retry behavior, failure handling, and dead-letter semantics.
- **MVP-01**: PASS — design artifacts remain MVP-scoped and avoid non-goal capabilities.
- **QUA-01**: PASS — quickstart defines validation flows spanning unit/integration/contract/E2E acceptance and performance checks.

## Complexity Tracking

No constitution gate violations; complexity exceptions not required.
