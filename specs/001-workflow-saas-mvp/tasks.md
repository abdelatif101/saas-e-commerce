# Tasks: Workflow-Centered SaaS E-Commerce MVP

**Input**: Design documents from `/specs/001-workflow-saas-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include unit, integration, contract, and E2E tests because the plan/constitution require testing pyramid coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the planned project structure and baseline tooling under `project-code/`.

- [ ] T001 Create feature module directories from plan structure in `project-code/src/core/{account,workflow,commerce/{products,customers,conversations,orders},authorization}/{domain,application,infrastructure}`, `project-code/src/plugins/{ai,telegram,integrations}`, and `project-code/src/shared/{contracts,jobs,observability}`
- [ ] T002 Create route group directories in `project-code/src/app/(account)`, `project-code/src/app/(workflow)`, `project-code/src/app/api`, `project-code/src/app/public`, and `project-code/src/app/widget`
- [ ] T003 [P] Create test suite directories in `project-code/tests/{unit,integration,contract,e2e}` and add per-suite README usage notes in each directory
- [ ] T004 [P] Add architecture boundary guard configuration in `project-code/eslint.config.mjs` and document forbidden imports in `project-code/src/shared/contracts/architecture-boundaries.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build mandatory cross-story foundations (tenancy, authorization pipeline, persistence contracts, plugin resolver, async contract).

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [x] T005 Define shared core type contracts (`AccountId`, `WorkflowId`, `MemberId`, `Permission`, `RoleName`) in `project-code/src/shared/contracts/core-types.ts`
- [x] T006 Implement authorization pipeline contract (identity → membership → role/permission → workflow access → resource permission) in `project-code/src/core/authorization/application/authorize-operation.ts`
- [x] T007 [P] Implement workflow context guard that denies access when workflow scope is missing/mismatched in `project-code/src/core/workflow/application/require-workflow-context.ts`
- [x] T008 [P] Implement plugin manifest and deterministic capability resolver (no full scan, load required capabilities only) in `project-code/src/plugins/integrations/plugin-manifest.ts` and `project-code/src/plugins/integrations/capability-resolver.ts`
- [x] T009 [P] Implement async job envelope contract in `project-code/src/shared/jobs/job-envelope.ts` with fields `jobType`, `jobId`, `accountId`, `workflowId`, `idempotencyKey`, `payload`, `attempt`, `scheduledAt`
- [x] T010 [P] Implement async retry policy contract (at-least-once, idempotent side effects, timeout, max attempts, backoff, dead-letter) in `project-code/src/shared/jobs/job-policy.ts`
- [x] T011 Implement base entity ownership policy in `project-code/src/shared/contracts/resource-ownership.ts` enforcing account-scoped vs workflow-scoped separation
- [x] T012 Implement data-model validation constants in `project-code/src/shared/contracts/data-model-constraints.ts` quoting verbatim: `maxWorkflows >= 1`; `Workflow creation blocked when current active workflows reaches maxWorkflows`; `Cannot remove sole Owner without ownership transfer operation`; `Default roles exist for each account`; `Owner role includes owner-only capabilities`; `Capability must be from allowed MVP capability set`; `Duplicate grants for same member+capability prevented`; `Created only if subscription capacity available`; `Name required within account context`; `Member and workflow must belong to same account`; `Access grant required before workflow resource operations`; `Name, type, and price required for sellable products`; `Public page only accessible when product is active/public`; `Deduplication uses reliable identifiers when present (phone/email)`; `Guest can be promoted to identified customer`; `Manual response path always available`; `Handoff to human must be possible at all times`; `Must include at least one order line item`; `Status transition rules enforced in application layer`; `Quantity > 0`; `Product must belong to same workflow as order`; `If enabled=false, manual conversation flow remains fully operational`; `Provider-specific secrets stored outside source code`; `Plugin operations must map to account member identity and permissions`; `Disconnected plugin cannot execute operations`; `Widget requests must resolve target workflow safely`; `Internal credentials never exposed to clients`; `Slug unique per workflow`; `Disabled page returns not available state`; `Required for sensitive member/access/authorization and operational actions`; `Must not store secrets in metadata`
- [x] T013 Implement foundational unit tests for authorization pipeline and workflow guard in `project-code/tests/unit/foundation/authorization-pipeline.test.ts`
- [x] T014 Implement foundational integration tests for plugin resolver and async job contracts in `project-code/tests/integration/foundation/plugin-and-jobs.test.ts`

**Checkpoint**: Foundation ready for independent user story implementation.

---

## Phase 3: User Story 1 - Launch a workflow and start selling (Priority: P1) 🎯 MVP

**Goal**: Enable onboarding flow from account creation to workflow creation, product setup, customer conversation, purchase intent, and order creation.

**Independent Test**: Create account + workflow, add product, start customer conversation, convert purchase intent to order within same workflow.

### Tests for User Story 1

- [x] T015 [P] [US1] Add contract tests for `POST /api/accounts` and `POST /api/accounts/{accountId}/workflows` in `project-code/tests/contract/us1/account-workflow.contract.test.ts`
- [x] T016 [P] [US1] Add contract tests for `POST /api/workflows/{workflowId}/purchase-intents` and `POST /api/workflows/{workflowId}/orders` in `project-code/tests/contract/us1/commerce.contract.test.ts`
- [x] T017 [P] [US1] Add integration journey test (onboarding → product → conversation → intent → order) in `project-code/tests/integration/us1/onboarding-commerce-flow.test.ts`

### Implementation for User Story 1

- [x] T018 [P] [US1] Implement Account and Subscription domain models in `project-code/src/core/account/domain/account.ts` and `project-code/src/core/account/domain/subscription.ts` with constraints `Account name required` and `maxWorkflows >= 1`
- [x] T019 [P] [US1] Implement Workflow domain model in `project-code/src/core/workflow/domain/workflow.ts` with constraints `Created only if subscription capacity available` and `Name required within account context`
- [x] T020 [P] [US1] Implement Product domain model in `project-code/src/core/commerce/products/domain/product.ts` with enum constraints `physical/digital` and rules `Name, type, and price required for sellable products` and `Public page only accessible when product is active/public`
- [x] T021 [P] [US1] Implement Customer domain model in `project-code/src/core/commerce/customers/domain/customer.ts` with enum constraint `guest/identified` and rules `Deduplication uses reliable identifiers when present (phone/email)` and `Guest can be promoted to identified customer`
- [x] T022 [P] [US1] Implement Conversation domain model in `project-code/src/core/commerce/conversations/domain/conversation.ts` with handler modes `human/ai` and rules `Manual response path always available` and `Handoff to human must be possible at all times`
- [x] T023 [P] [US1] Implement Order and OrderItem domain models in `project-code/src/core/commerce/orders/domain/order.ts` and `project-code/src/core/commerce/orders/domain/order-item.ts` with enum constraints `physical/digital` and `New/Processing/Completed/Cancelled`, and rules `Must include at least one order line item`, `Status transition rules enforced in application layer`, `Quantity > 0`, and `Product must belong to same workflow as order`
- [x] T024 [US1] Implement account/workflow application services in `project-code/src/core/account/application/create-account.ts` and `project-code/src/core/workflow/application/create-workflow.ts` enforcing `Workflow creation blocked when current active workflows reaches maxWorkflows`
- [x] T025 [US1] Implement commerce services (create product/customer/conversation/purchase intent/order) in `project-code/src/core/commerce/{products,customers,conversations,orders}/application/*.ts`
- [x] T026 [US1] Implement API handlers for account/workflow and commerce contracts in `project-code/src/app/api/accounts/route.ts`, `project-code/src/app/api/accounts/[accountId]/workflows/route.ts`, `project-code/src/app/api/workflows/[workflowId]/purchase-intents/route.ts`, and `project-code/src/app/api/workflows/[workflowId]/orders/route.ts`
- [x] T027 [US1] Add US1 E2E scenario from quickstart Scenario 1 and 3 in `project-code/tests/e2e/us1/onboarding-to-order.e2e.test.ts`

**Checkpoint**: US1 delivers MVP onboarding-to-order flow and is testable independently.

---

## Phase 4: User Story 2 - Control team access safely (Priority: P2)

**Goal**: Support member lifecycle, role/permission assignment, and workflow access control with strict denial of unauthorized access.

**Independent Test**: Invite members, assign role/permissions, grant workflow A only, verify allowed actions in A and denied in B.

### Tests for User Story 2

- [ ] T028 [P] [US2] Add contract tests for member invite, access patch, and workflow grant/revoke endpoints in `project-code/tests/contract/us2/member-access.contract.test.ts`
- [ ] T029 [P] [US2] Add integration tests for cross-workflow deny behavior and access update propagation in `project-code/tests/integration/us2/workflow-access-controls.test.ts`

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implement Member and Role domain models in `project-code/src/core/account/domain/member.ts` and `project-code/src/core/account/domain/role.ts` with constraints `Default roles exist for each account`, `Owner role includes owner-only capabilities`, and role names `Owner/Admin/Member`
- [ ] T031 [P] [US2] Implement PermissionGrant and WorkflowAccessGrant domain models in `project-code/src/core/authorization/domain/permission-grant.ts` and `project-code/src/core/workflow/domain/workflow-access-grant.ts` with constraints `Capability must be from allowed MVP capability set`, `Duplicate grants for same member+capability prevented`, `Member and workflow must belong to same account`, and `Access grant required before workflow resource operations`
- [ ] T032 [US2] Implement member management services (invite/remove/assign role/assign permissions) in `project-code/src/core/account/application/manage-members.ts` enforcing `Cannot remove sole Owner without ownership transfer operation`
- [ ] T033 [US2] Implement workflow access grant/revoke service in `project-code/src/core/workflow/application/manage-workflow-access.ts`
- [ ] T034 [US2] Implement API handlers for member access contracts in `project-code/src/app/api/accounts/[accountId]/members/invitations/route.ts`, `project-code/src/app/api/accounts/[accountId]/members/[memberId]/access/route.ts`, and `project-code/src/app/api/accounts/[accountId]/workflows/[workflowId]/access/[memberId]/route.ts`
- [ ] T035 [US2] Implement audit event recording for sensitive membership/access changes in `project-code/src/core/account/application/audit-member-actions.ts` and `project-code/src/core/workflow/application/audit-workflow-access.ts` with rule `Required for sensitive member/access/authorization and operational actions`
- [ ] T036 [US2] Add US2 E2E scenario from quickstart Scenario 2 in `project-code/tests/e2e/us2/member-permission-workflow-access.e2e.test.ts`

**Checkpoint**: US2 independently validates team access governance and workflow isolation enforcement.

---

## Phase 5: User Story 3 - Communicate with customers using human or AI support (Priority: P3)

**Goal**: Enable public product/chat entry points, manual and AI-assisted conversations, human handoff, and plugin-governed operations.

**Independent Test**: Start conversations from public channels, respond manually, enable AI, hand off to human, verify workflow-safe behavior.

### Tests for User Story 3

- [ ] T037 [P] [US3] Add contract tests for public product and widget endpoints (`GET /public/{workflowRef}/products/{productSlug}`, `POST /widget/{workflowRef}/sessions`, `POST /widget/{workflowRef}/conversations/{conversationId}/messages`) in `project-code/tests/contract/us3/public-and-widget.contract.test.ts`
- [ ] T038 [P] [US3] Add contract tests for plugin execution envelope and async job policy in `project-code/tests/contract/us3/plugin-jobs.contract.test.ts`
- [ ] T039 [P] [US3] Add integration tests for AI optional mode, AI assist, and forced human handoff in `project-code/tests/integration/us3/ai-human-handoff.test.ts`

### Implementation for User Story 3

- [ ] T040 [P] [US3] Implement AIConfiguration, PluginConnection, ChatWidgetConfiguration, PublicProductPage domain models in `project-code/src/core/workflow/domain/{ai-configuration.ts,plugin-connection.ts,chat-widget-configuration.ts,public-product-page.ts}` with constraints `If enabled=false, manual conversation flow remains fully operational`, `Plugin operations must map to account member identity and permissions`, `Disconnected plugin cannot execute operations`, `Widget requests must resolve target workflow safely`, `Internal credentials never exposed to clients`, `Slug unique per workflow`, and `Disabled page returns not available state`
- [ ] T041 [US3] Implement public product page query service in `project-code/src/core/commerce/products/application/get-public-product-page.ts`
- [ ] T042 [US3] Implement widget session and message services in `project-code/src/core/commerce/conversations/application/{start-widget-session.ts,append-widget-message.ts}` including origin/rate-limit checks
- [ ] T043 [US3] Implement AI assist and handoff services in `project-code/src/plugins/ai/application/{assist-conversation.ts,handoff-to-human.ts}` preserving manual override invariant
- [ ] T044 [US3] Implement Telegram/plugin command execution service in `project-code/src/plugins/telegram/application/execute-merchant-command.ts` using platform authorization pipeline
- [ ] T045 [US3] Implement public/widget and plugin API handlers in `project-code/src/app/public/[workflowRef]/products/[productSlug]/route.ts`, `project-code/src/app/widget/[workflowRef]/sessions/route.ts`, `project-code/src/app/widget/[workflowRef]/conversations/[conversationId]/messages/route.ts`, and `project-code/src/app/api/plugins/telegram/commands/route.ts`
- [ ] T046 [US3] Add US3 E2E scenarios from quickstart Scenario 4, 5, and 6 in `project-code/tests/e2e/us3/public-chat-ai-plugin.e2e.test.ts`

**Checkpoint**: US3 independently validates public/customer communication and optional AI/plugin operations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, performance checks, and end-to-end validation across stories.

- [ ] T047 [P] Add performance assertions for p95 API latency, p95 purchase-intent flow latency, and query-count budget in `project-code/tests/integration/performance/critical-path-budgets.test.ts`
- [ ] T048 [P] Add plugin resolver performance test ensuring no global plugin scan per request in `project-code/tests/unit/plugins/capability-resolver-performance.test.ts`
- [ ] T049 Add security hardening checks (secret-safe logging, public endpoint abuse protection assertions) in `project-code/tests/integration/security/public-surface-security.test.ts`
- [ ] T050 Run quickstart validation and record executed checklist evidence in `specs/001-workflow-saas-mvp/quickstart-validation-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → no dependencies
- Phase 2 → depends on Phase 1, blocks all user stories
- Phase 3 (US1) → depends on Phase 2
- Phase 4 (US2) → depends on Phase 2 (can run parallel with US1 after Phase 2, but priority order is US1 first)
- Phase 5 (US3) → depends on Phase 2 (can run parallel with US2 after Phase 2, but priority order is US1 → US2 → US3)
- Phase 6 → depends on completion of target stories

### User Story Dependencies

- **US1 (P1)**: independent after foundations; MVP slice
- **US2 (P2)**: independent after foundations; integrates with US1 authorization primitives but testable alone
- **US3 (P3)**: independent after foundations; uses US1 commerce entities and foundational plugin/async contracts

### Within Each Story

- Contract + integration tests first
- Domain models before application services
- Services before route handlers
- Route handlers before E2E validation

---

## Parallel Opportunities

- **Phase 1**: T003, T004 parallel after T001/T002
- **Phase 2**: T007/T008/T009/T010 parallel after T005/T006
- **US1**: T015/T016/T017 in parallel; T018–T023 in parallel by domain area
- **US2**: T028/T029 parallel; T030/T031 parallel
- **US3**: T037/T038/T039 parallel; T040 with T041/T042 can be parallelized once model contracts exist
- **Polish**: T047/T048/T049 parallel before T050

---

## Parallel Example: User Story 1

```bash
Task: "T015 [US1] contract tests in project-code/tests/contract/us1/account-workflow.contract.test.ts"
Task: "T016 [US1] contract tests in project-code/tests/contract/us1/commerce.contract.test.ts"
Task: "T017 [US1] integration test in project-code/tests/integration/us1/onboarding-commerce-flow.test.ts"

Task: "T018 [US1] account/subscription models in project-code/src/core/account/domain/"
Task: "T019 [US1] workflow model in project-code/src/core/workflow/domain/workflow.ts"
Task: "T020 [US1] product model in project-code/src/core/commerce/products/domain/product.ts"
Task: "T021 [US1] customer model in project-code/src/core/commerce/customers/domain/customer.ts"
Task: "T022 [US1] conversation model in project-code/src/core/commerce/conversations/domain/conversation.ts"
Task: "T023 [US1] order/order-item models in project-code/src/core/commerce/orders/domain/"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate T027 E2E and US1 contract/integration tests
4. Ship MVP slice

### Incremental Delivery

1. Add US2 and validate member/permission/workflow isolation journeys
2. Add US3 and validate public/chat/AI/plugin journeys
3. Execute Phase 6 hardening and quickstart-wide validation

### Less-Capable Model Execution Guidance

- Complete tasks exactly in ID order unless marked [P]
- Do not change file paths or architecture boundaries in task descriptions
- Do not combine tasks; each task is intentionally small and explicit
- Run the specific tests created in each story before moving to the next story
