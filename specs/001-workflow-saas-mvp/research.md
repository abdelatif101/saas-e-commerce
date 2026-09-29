# Phase 0 Research: Workflow-Centered SaaS E-Commerce MVP

## Decision 1: Use a modular monolith for MVP delivery
- **Decision**: Implement all MVP capabilities in one Next.js codebase with internal Core Module boundaries and Plugin boundaries.
- **Rationale**: Keeps delivery speed high, reduces operational overhead, and satisfies MVP-01 by avoiding premature distributed complexity.
- **Alternatives considered**:
  - Early microservices split (rejected: unnecessary infrastructure and coordination cost for MVP).
  - Separate service per domain (rejected: adds cross-service auth/consistency complexity before product fit).

## Decision 2: Enforce workflow isolation at application and data-access boundaries
- **Decision**: Require workflow context on all workflow-owned operations and enforce deny-by-default access when workflow membership/access is missing.
- **Rationale**: Directly supports TEN-01, SEC-01, and FR-006/FR-007.
- **Alternatives considered**:
  - UI-only workflow filtering (rejected: bypass risk via direct endpoints/resource identifiers).
  - Role-only access without explicit workflow grant (rejected: violates PRD separation of membership vs workflow access).

## Decision 3: Use layered authorization pipeline
- **Decision**: Apply authorization pipeline: identity → account membership → role/permission → workflow access → resource operation.
- **Rationale**: Aligns with PRD authorization flow and prevents authentication from being treated as authorization.
- **Alternatives considered**:
  - Role-only checks (rejected: insufficient for workflow-specific access control).
  - Per-plugin custom authorization (rejected: violates FR-019 and PLG-01).

## Decision 4: Keep Account-scoped and Workflow-scoped ownership explicit
- **Decision**: Model every persistent entity with explicit ownership scope (account or workflow), and enforce invariant checks in application services.
- **Rationale**: Reduces tenant leakage risk and supports DAT-01 and TEN-01 verification.
- **Alternatives considered**:
  - Implicit ownership from URL paths alone (rejected: weak guarantee; easy drift).
  - Mixed ownership without explicit metadata (rejected: unclear source-of-truth boundaries).

## Decision 5: Treat AI as optional plugin capability behind stable contracts
- **Decision**: AI behavior is plugin-driven and optional; manual conversation handling remains fully functional when AI is off.
- **Rationale**: Meets FR-015/FR-016/FR-017 and preserves provider replaceability.
- **Alternatives considered**:
  - AI-first mandatory conversation pipeline (rejected: violates MVP requirement for non-AI operability).
  - Hard-coded provider logic in core modules (rejected: violates INF-01 and PLG principles).

## Decision 6: Use deterministic plugin resolution with capability-scoped loading
- **Decision**: Introduce plugin manifests and a deterministic resolver that loads only capabilities needed for the current operation.
- **Rationale**: Satisfies PLG-01/PLG-02 and avoids request-time plugin overhead.
- **Alternatives considered**:
  - Dynamic full plugin scan per request (rejected: performance and predictability risks).
  - Plugin-to-plugin direct dependencies (rejected: violates plugin isolation and replaceability).

## Decision 7: Async jobs follow at-least-once semantics with idempotency
- **Decision**: For AI and integration background tasks, define explicit job contracts including idempotency keys, retries, timeout, and dead-letter handling.
- **Rationale**: Aligns with ASY-01 and supports resilient external integration processing.
- **Alternatives considered**:
  - Fire-and-forget jobs without retry policy (rejected: unbounded failure handling).
  - Exactly-once processing guarantee in MVP (rejected: higher complexity without proportional MVP value).

## Decision 8: Public chat and product surfaces get minimal but strict security controls
- **Decision**: For chat widget/public product flows, enforce workflow routing validation, origin allowlisting where applicable, rate limiting, and secret-safe integration handling.
- **Rationale**: Meets PRD security expectations for public endpoints while avoiding overengineering.
- **Alternatives considered**:
  - Open public endpoints without throttling (rejected: abuse risk).
  - Enterprise WAF/risk-engine stack from day one (rejected: not MVP-proportional).

## Decision 9: Testing strategy follows constitution testing pyramid
- **Decision**: Use unit, integration, contract, and E2E coverage with focus on authorization, isolation, conversation→intent→order flow, plugin permissions, and async retry behavior.
- **Rationale**: Required by QUA-01 and PRD quality requirements.
- **Alternatives considered**:
  - E2E-only testing (rejected: slow feedback and poor fault isolation).
  - Unit-only testing (rejected: misses boundary and contract failures).

## Decision 10: Enforce performance with bounded query and plugin behavior
- **Decision**: Set explicit budgets for critical latencies, query counts, and plugin resolution behavior; include checks in validation.
- **Rationale**: Supports QUA-01 and PRD performance principles while retaining simple architecture.
- **Alternatives considered**:
  - Optimize later with no targets (rejected: hidden regressions).
  - Introduce heavy distributed optimization early (rejected: violates MVP-01).
