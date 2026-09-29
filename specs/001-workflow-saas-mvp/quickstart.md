# Quickstart Validation Guide: Workflow-Centered SaaS E-Commerce MVP

This guide validates end-to-end behavior for the planned MVP design using the contracts and data model.

## References

- Spec: `/specs/001-workflow-saas-mvp/spec.md`
- Plan: `/specs/001-workflow-saas-mvp/plan.md`
- Data model: `/specs/001-workflow-saas-mvp/data-model.md`
- Contracts:
  - `/specs/001-workflow-saas-mvp/contracts/account-workflow-api.md`
  - `/specs/001-workflow-saas-mvp/contracts/public-interaction-api.md`
  - `/specs/001-workflow-saas-mvp/contracts/plugin-job-contracts.md`

## Prerequisites

1. Node.js LTS installed
2. `project-code/` dependencies installed
3. Environment configured for authentication, database, cache, queue, and optional AI/plugin adapters
4. At least one test account identity available

## Setup Commands

From repository root:

```bash
cd /home/runner/work/saas-e-commerce/saas-e-commerce/project-code
npm install
npm run lint
npm run build
```

## Validation Scenarios

### Scenario 1: Account + Workflow bootstrap
1. Create account through account contract
2. Verify default owner membership + role
3. Create first workflow
4. Confirm workflow count increments and respects subscription cap

**Expected Outcome**:
- Account resources are account-scoped
- Workflow created only when subscription limit allows

### Scenario 2: Member, role, permission, and workflow access controls
1. Invite two members
2. Assign different roles/permissions
3. Grant one member access to Workflow A only
4. Attempt operations in Workflow A and Workflow B

**Expected Outcome**:
- Authorized operations succeed in granted workflow
- Cross-workflow operations are denied
- Sole-owner invariant preserved

### Scenario 3: Product/Customer/Conversation/Order flow
1. Add product to workflow
2. Start customer conversation
3. Capture purchase intent
4. Convert intent to order and transition order status

**Expected Outcome**:
- All commerce entities remain workflow-scoped
- Order status transitions follow allowed state machine

### Scenario 4: Public product page + chat widget flow
1. Enable public product page and access public URL
2. Start widget session from allowed origin
3. Send customer messages and capture identity progression
4. Route intent to merchant-side order conversion

**Expected Outcome**:
- Public surfaces map to correct workflow
- Origin/rate-limit/security controls are enforced
- No internal credential leakage

### Scenario 5: Optional AI + human handoff
1. Run conversation with AI disabled and confirm manual-only path
2. Enable AI for workflow
3. Let AI assist in conversation
4. Perform immediate human takeover

**Expected Outcome**:
- Core flow works with AI off
- AI stays within workflow scope
- Human handoff always available

### Scenario 6: Plugin authorization + async resilience
1. Trigger Telegram/plugin command requiring authorization
2. Validate deny path for insufficient permission
3. Trigger authorized command path
4. Execute async job retries and dead-letter path using job contract

**Expected Outcome**:
- Plugin operations follow same auth model as native operations
- Async failures are retried idempotently and terminal failures are auditable

## Performance and Quality Checks

- Verify critical latency and query-count targets defined in `plan.md`
- Verify plugin resolution does not load all plugins per request
- Verify required tests are mapped across unit/integration/contract/E2E levels

## Completion Criteria

The MVP design is validated when all scenarios pass with expected outcomes and no constitution gate regressions are found.
