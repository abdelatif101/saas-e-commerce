# Contract: Plugin Execution and Async Job Contracts

## Purpose
Defines how plugins (AI, Telegram, future integrations) invoke platform capabilities and how async jobs execute safely.

## Plugin Contract

### Plugin Manifest Requirements
Each plugin declares:
- `id`
- `version`
- `permissions` (platform capabilities it may request)
- `lifecycle` hooks
- `contracts` exposed/consumed

### Plugin Operation Envelope
Every plugin request to application layer includes:
- resolved member identity
- account id
- workflow id
- requested capability
- operation payload
- correlation id

### Plugin Authorization Rules
- Plugins cannot execute operations without platform authorization pipeline.
- Plugin-specific permissions cannot bypass account/workflow permission model.
- Unauthorized plugin operation returns deny response; no partial business mutation.

## AI Conversation Contract

### AI Assist Request
- Input: workflow id, conversation id, customer context, allowed data scope, policy profile
- Output: proposed assistant response + confidence/trace metadata
- Rules:
  - Workflow-scoped data access only
  - Human takeover always allowed
  - AI unavailable path falls back to manual handling

## Telegram Control Contract

### Merchant Command Execution
- Input: telegram actor identity, command intent, workflow context
- Output: authorized operation result or denied response
- Rules:
  - Command interpretation may use AI
  - Final operation always enforced by app authorization rules

## Async Job Contract

### Job Envelope
Fields:
- `jobType`
- `jobId`
- `accountId`
- `workflowId`
- `idempotencyKey`
- `payload`
- `attempt`
- `scheduledAt`

### Execution Semantics
- Delivery: at-least-once
- Must be idempotent for side effects
- Must define timeout per job type
- Must define retry policy + max attempts + backoff
- Must define dead-letter behavior on terminal failure

### Failure Contract
- Retryable failures are retried according to policy
- Non-retryable failures terminate and emit auditable failure event
- Dead-lettered jobs preserve context for replay/manual resolution
