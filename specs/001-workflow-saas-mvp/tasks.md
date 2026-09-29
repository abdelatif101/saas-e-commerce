# Tasks: Workflow-Centered SaaS E-Commerce MVP

**Input**: Design documents from `/specs/001-workflow-saas-mvp/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

**Tests**: Include unit, integration, contract, and E2E tests because `plan.md`, `quickstart.md`, and the constitution require testing-pyramid coverage.

**Organization**: Tasks are grouped by user story to keep each increment independently executable and independently verifiable.

## Format: `[ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the codebase scaffold and tooling with the approved modular-monolith structure.

- [ ] T001 Create/align module directories in `project-code/src/core/{account,workflow,commerce/{products,customers,conversations,orders},authorization}/{domain,application,infrastructure}`, `project-code/src/plugins/{ai,telegram,integrations}`, and `project-code/src/shared/{contracts,jobs,observability}`
- [ ] T002 [P] Create/align app route directories in `project-code/src/app/(account)`, `project-code/src/app/(workflow)`, `project-code/src/app/api`, `project-code/src/app/public`, and `project-code/src/app/widget`
- [ ] T003 [P] Create/align test suite directories in `project-code/tests/{unit,integration,contract,e2e}` and add suite README files in each directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared tenancy/authz/infrastructure contracts that every story depends on.

**⚠️ CRITICAL**: No user story work starts before this phase completes.

- [ ] T004 Define shared IDs/capabilities and ownership contracts in `project-code/src/shared/contracts/{core-types.ts,capabilities.ts,resource-ownership.ts}` preserving Account → Subscription → Members/Roles/Permissions → Workflow ownership sequencing
- [ ] T005 Implement Prisma schema for account/workflow access foundations in `project-code/prisma/schema.prisma` with constraints `maxWorkflows >= 1`, `Account must always have exactly one current Owner member`, `Cannot remove sole Owner without ownership transfer operation`, `Default roles exist for each account`, `Owner role includes owner-only capabilities`, `Capability must be from allowed MVP capability set`, `Duplicate grants for same member+capability prevented`, `Created only if subscription capacity available`, and `Member and workflow must belong to same account`
- [ ] T006 [P] Implement authz pipeline use case in `project-code/src/core/authorization/application/authorize-operation.ts` enforcing identity → membership → role/permission → workflow access → operation order
- [ ] T007 [P] Implement infrastructure adapters for Clerk identity, Neon/PostgreSQL (Prisma), Redis, and Vercel Queues in `project-code/src/core/authorization/infrastructure/`, `project-code/src/shared/jobs/`, and `project-code/src/shared/observability/` without leaking vendor types into domain/application
- [ ] T008 [P] Implement plugin manifest + deterministic capability resolver in `project-code/src/plugins/integrations/{plugin-manifest.ts,capability-resolver.ts}` with capability-scoped loading only
- [ ] T009 Add foundational tests for authorization, workflow isolation, and plugin/job contracts in `project-code/tests/{unit,integration,contract}/foundation/`

**Checkpoint**: Foundation ready; user stories can be implemented and validated independently.

---

## Phase 3: User Story 1 - Launch a workflow and start selling (Priority: P1) 🎯 MVP

**Goal**: Deliver onboarding-to-order flow in a single workflow.

**Independent Test**: Create account, create workflow, add product, receive conversation message, capture purchase intent, convert to order in the same workflow.

**Acceptance Focus**: Satisfy FR-001, FR-002, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add contract tests for `POST /api/accounts` and `POST /api/accounts/{accountId}/workflows` in `project-code/tests/contract/us1/account-workflow.contract.test.ts`
- [ ] T011 [P] [US1] Add contract tests for `POST /api/workflows/{workflowId}/purchase-intents` and `POST /api/workflows/{workflowId}/orders` in `project-code/tests/contract/us1/commerce-order.contract.test.ts`
- [ ] T012 [P] [US1] Add integration test for onboarding→product→conversation→intent→order in `project-code/tests/integration/us1/onboarding-to-order.test.ts`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement `Account` + `Subscription` domain/application flows in `project-code/src/core/account/{domain,application}/` with constraints `Account name required`, `maxWorkflows >= 1`, and `Workflow creation blocked when current active workflows reaches maxWorkflows`
- [ ] T014 [P] [US1] Implement `Workflow` + `WorkflowAccessGrant` domain/application flows in `project-code/src/core/workflow/{domain,application}/` with constraints `Name required within account context` and `Access grant required before workflow resource operations`
- [ ] T015 [P] [US1] Implement `Product` domain/application flows in `project-code/src/core/commerce/products/{domain,application}/` with constraints `Name, type, and price required for sellable products` and `Public page only accessible when product is active/public`
- [ ] T016 [P] [US1] Implement `Customer` + `Conversation` domain/application flows in `project-code/src/core/commerce/{customers,conversations}/{domain,application}/` with constraints `Deduplication uses reliable identifiers when present (phone/email)`, `Guest can be promoted to identified customer`, `Manual response path always available`, and `Handoff to human must be possible at all times`
- [ ] T017 [US1] Implement `Order` + `OrderItem` domain/application flows in `project-code/src/core/commerce/orders/{domain,application}/` with constraints `Must include at least one order line item`, `Status transition rules enforced in application layer`, `Quantity > 0`, and `Product must belong to same workflow as order`
- [ ] T018 [US1] Implement US1 API handlers in `project-code/src/app/api/accounts/route.ts`, `project-code/src/app/api/accounts/[accountId]/workflows/route.ts`, `project-code/src/app/api/workflows/[workflowId]/{purchase-intents,orders}/route.ts` and add E2E scenario in `project-code/tests/e2e/us1/onboarding-to-order.e2e.test.ts`

**Checkpoint**: US1 is production-usable and independently testable as the MVP slice.

---

## Phase 4: User Story 2 - Control team access safely (Priority: P2)

**Goal**: Deliver safe member collaboration with role/permission/workflow access enforcement.

**Independent Test**: Invite members, assign different roles/permissions, grant Workflow A only, verify Workflow B denial and immediate access updates.

**Acceptance Focus**: Satisfy FR-003, FR-004, FR-005, FR-006, FR-021, FR-022.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add contract tests for member invite/access/workflow grant-revoke endpoints in `project-code/tests/contract/us2/member-access.contract.test.ts`
- [ ] T020 [P] [US2] Add integration test for cross-workflow denial and grant/revoke propagation in `project-code/tests/integration/us2/workflow-access-controls.test.ts`

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement `Member` + `Role` domain/application flows in `project-code/src/core/account/{domain,application}/` using default roles `Owner/Admin/Member` and owner-only invariants
- [ ] T022 [P] [US2] Implement `PermissionGrant` + capability checks in `project-code/src/core/authorization/{domain,application}/` enforcing `Capability must be from allowed MVP capability set` and `Duplicate grants for same member+capability prevented`
- [ ] T023 [US2] Implement workflow access management use cases in `project-code/src/core/workflow/application/manage-workflow-access.ts` enforcing same-account and explicit access requirements
- [ ] T024 [US2] Implement member/access API handlers in `project-code/src/app/api/accounts/[accountId]/members/invitations/route.ts`, `project-code/src/app/api/accounts/[accountId]/members/[memberId]/access/route.ts`, and `project-code/src/app/api/accounts/[accountId]/workflows/[workflowId]/access/[memberId]/route.ts`
- [ ] T025 [US2] Implement sensitive access audit logging in `project-code/src/core/account/application/audit-member-actions.ts`, `project-code/src/core/workflow/application/audit-workflow-access.ts`, and add E2E scenario in `project-code/tests/e2e/us2/member-access.e2e.test.ts`

**Checkpoint**: US2 is independently testable and prevents unauthorized cross-workflow/team actions.

---

## Phase 5: User Story 3 - Communicate with customers using human or AI support (Priority: P3)

**Goal**: Deliver public entry points, manual-first conversation handling, optional AI assist, and plugin-governed operations.

**Independent Test**: Run manual conversation flow, enable AI assist, perform immediate human takeover, and validate plugin commands obey authorization/workflow boundaries.

**Acceptance Focus**: Satisfy FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add contract tests for public product and widget endpoints in `project-code/tests/contract/us3/public-widget.contract.test.ts`
- [ ] T027 [P] [US3] Add contract tests for plugin operation envelope and async job contract in `project-code/tests/contract/us3/plugin-job.contract.test.ts`
- [ ] T028 [P] [US3] Add integration tests for AI optional mode and human takeover in `project-code/tests/integration/us3/ai-handoff.test.ts`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement `AIConfiguration`, `PluginConnection`, `ChatWidgetConfiguration`, and `PublicProductPage` domain/application flows in `project-code/src/core/workflow/{domain,application}/` with constraints `If enabled=false, manual conversation flow remains fully operational`, `Plugin operations must map to account member identity and permissions`, `Disconnected plugin cannot execute operations`, `Widget requests must resolve target workflow safely`, `Internal credentials never exposed to clients`, `Slug unique per workflow`, and `Disabled page returns not available state`
- [ ] T030 [P] [US3] Implement public product and widget conversation services in `project-code/src/core/commerce/{products,conversations}/application/` for workflow-safe routing and customer identity progression
- [ ] T031 [P] [US3] Implement AI assist/handoff services in `project-code/src/plugins/ai/application/{assist-conversation.ts,handoff-to-human.ts}` preserving always-available human override
- [ ] T032 [P] [US3] Implement Telegram/plugin command execution service in `project-code/src/plugins/telegram/application/execute-merchant-command.ts` using platform authorization pipeline only
- [ ] T033 [US3] Implement public/widget/plugin API handlers in `project-code/src/app/public/[workflowRef]/products/[productSlug]/route.ts`, `project-code/src/app/widget/[workflowRef]/sessions/route.ts`, `project-code/src/app/widget/[workflowRef]/conversations/[conversationId]/messages/route.ts`, and `project-code/src/app/api/plugins/telegram/commands/route.ts` plus E2E scenario in `project-code/tests/e2e/us3/public-ai-plugin.e2e.test.ts`

**Checkpoint**: US3 is independently testable with AI enabled or disabled.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and full quickstart verification without expanding MVP scope.

- [ ] T034 [P] Add performance budget tests in `project-code/tests/integration/performance/critical-path-budgets.test.ts` for p95 API latency, p95 purchase-intent flow latency, and bounded query counts
- [ ] T035 [P] Add security/isolation regression tests for public surfaces and plugin authorization in `project-code/tests/integration/security/public-and-plugin-security.test.ts`
- [ ] T036 Run full quickstart scenario validation and capture evidence in `specs/001-workflow-saas-mvp/quickstart-validation-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: start immediately
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: depends on Phase 2
- **Phase 4 (US2)**: depends on Phase 2; recommended after US1 for MVP sequencing
- **Phase 5 (US3)**: depends on Phase 2; recommended after US2 for staged rollout
- **Phase 6 (Polish)**: depends on selected user stories being complete

### User Story Dependencies

- **US1 (P1)**: independent after foundations; defines MVP release slice
- **US2 (P2)**: independent after foundations; builds on shared authz/workflow access contracts
- **US3 (P3)**: independent after foundations; builds on shared workflow/authz/plugin/job contracts

### Within Each User Story

- Tests first (contract/integration), then domain/application, then API handlers, then E2E
- Complete the story checkpoint before advancing to the next priority story

---

## Parallel Opportunities

- **Setup**: T002 and T003 parallel after T001
- **Foundational**: T006, T007, T008 parallel after T004/T005
- **US1**: T010/T011/T012 parallel; T013/T014/T015/T016 parallel; T017 after commerce models
- **US2**: T019/T020 parallel; T021/T022 parallel
- **US3**: T026/T027/T028 parallel; T029/T030/T031/T032 parallel
- **Polish**: T034 and T035 parallel before T036

---

## Parallel Example: User Story 1

```bash
Task: "T010 [US1] contract tests in project-code/tests/contract/us1/account-workflow.contract.test.ts"
Task: "T011 [US1] contract tests in project-code/tests/contract/us1/commerce-order.contract.test.ts"
Task: "T012 [US1] integration test in project-code/tests/integration/us1/onboarding-to-order.test.ts"

Task: "T013 [US1] account/subscription flow in project-code/src/core/account/{domain,application}/"
Task: "T014 [US1] workflow/workflow-access flow in project-code/src/core/workflow/{domain,application}/"
Task: "T015 [US1] product flow in project-code/src/core/commerce/products/{domain,application}/"
Task: "T016 [US1] customer/conversation flow in project-code/src/core/commerce/{customers,conversations}/{domain,application}/"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] contract tests in project-code/tests/contract/us2/member-access.contract.test.ts"
Task: "T020 [US2] integration test in project-code/tests/integration/us2/workflow-access-controls.test.ts"

Task: "T021 [US2] member/role flow in project-code/src/core/account/{domain,application}/"
Task: "T022 [US2] permission-grant flow in project-code/src/core/authorization/{domain,application}/"
```

## Parallel Example: User Story 3

```bash
Task: "T026 [US3] public/widget contract tests in project-code/tests/contract/us3/public-widget.contract.test.ts"
Task: "T027 [US3] plugin/job contract tests in project-code/tests/contract/us3/plugin-job.contract.test.ts"
Task: "T028 [US3] AI handoff integration tests in project-code/tests/integration/us3/ai-handoff.test.ts"

Task: "T029 [US3] workflow AI/plugin/widget/public-page flows in project-code/src/core/workflow/{domain,application}/"
Task: "T031 [US3] AI services in project-code/src/plugins/ai/application/"
Task: "T032 [US3] Telegram services in project-code/src/plugins/telegram/application/"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Run US1 contract/integration/E2E checks.
4. Release MVP.

### Incremental Delivery

1. Add US2, validate independently, release.
2. Add US3, validate independently, release.
3. Run Phase 6 hardening and full quickstart verification.

### Guardrails

- Preserve Clean Architecture and Core + Modules + Plugins boundaries.
- Keep Prisma as ORM with Neon/PostgreSQL as source of truth.
- Keep Clerk, Redis, and Vercel Queues behind adapters.
- Do not add Drizzle, new infrastructure, or non-MVP features.
