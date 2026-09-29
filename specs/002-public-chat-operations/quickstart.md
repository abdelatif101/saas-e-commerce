# Quickstart: Public Customer Interaction Operations

This is a validation guide for the feature contracts; it is not a local infrastructure or migration recipe. Run commands from `/home/runner/work/saas-e-commerce/saas-e-commerce/project-code`. Use the repository's configured test fixtures/fakes unless a test specifically requires provisioned PostgreSQL, Redis, queue, or provider adapters. See [data-model.md](data-model.md) and [contracts](contracts/).

## Prerequisites

- Install the existing project dependencies with `npm ci`.
- Configure test environment variables using the repository's test conventions; never place production credentials in fixtures.
- PostgreSQL adapter tests use an isolated test database. Redis and Vercel Queues tests use the existing adapter fakes except in explicitly provisioned integration checks.

## Validation sequence

1. **Unit invariants** — `npm test -- --run tests/unit`
   - Verify page enablement/visibility, workflow consistency, guest identity promotion, conversation-control transitions, authorization denial, message/job idempotency, and rate-limit policy.
2. **Integration/adapters** — `npm test -- --run tests/integration`
   - Verify Prisma persistence and workflow-scoped lookups; widget token binding/expiry; origin and rate-limit enforcement; audit writes; Clerk/member resolution; queue retries, timeout and DLQ; AI and Redis failure behavior.
3. **Contracts** — `npm test -- --run tests/contract`
   - Verify response/error schemas for public page, widget session/message, merchant control/configuration, and Telegram operations; ensure credentials and member grants cannot be supplied by clients.
4. **End-to-end flows** — `npm test -- --run tests/e2e`
   - Public product page → widget conversation → message → guest identity enrichment, all in one target Workflow.
   - AI disabled and unavailable → customer message persists → authorized merchant replies manually.
   - AI enabled → queued response → human takeover races response → only human control/reply is retained.
   - Telegram connected member with valid permission/workflow access succeeds; missing binding, revoked/disconnected channel, missing capability/access, and cross-workflow resource all fail with no mutation and an audit decision.
5. **Quality gates** — `npm run lint`, then `npx tsc --noEmit` if the repository's TypeScript configuration supports standalone type checking.
   - Preserve existing critical-path performance/query budgets; verify no Domain/Application imports from Next.js, Clerk, Prisma, Redis, Vercel Queues, AI providers, or Telegram SDK types.

## Expected outcomes

- No public request creates or accesses a conversation until exactly one workflow and trusted active configuration are resolved.
- Cross-workflow attempts and untrusted authorization claims are denied; no records are mutated on denial.
- A valid customer message remains persisted and manually operable when Redis, queue, or AI provider is unavailable.
- Duplicate AI job delivery does not append duplicate AI responses; a human takeover supersedes any stale AI result.
- Sensitive configuration, control, and Telegram authorization events are persisted without tokens, secrets, or message PII in audit metadata/logs.
