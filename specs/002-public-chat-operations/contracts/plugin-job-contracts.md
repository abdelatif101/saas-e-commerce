# Contracts: Plugin Operations and AI Jobs

## Telegram operation contract

### Boundary

Telegram Plugin validates channel authenticity and parses a bounded command, then calls a stable Core Application operation contract. The plugin does not query Prisma repositories, mutate Core entities directly, or define independent authorization.

### Resolved request

After trusted adapter resolution, the Application receives:

- `accountId`, `workflowId`, `actorMemberId` from persisted connection/member binding
- `operation` and validated operation input
- `correlationId` and provider update/idempotency reference

It does **not** receive permissions asserted by the Telegram request. The Application reloads current membership, capability, workflow-access grant, and resource ownership before executing. Unknown identity/context, disconnected plugin, invalid/replayed update, or failed permission check is denied. Both allow and deny outcomes are audited, but secrets and message PII are excluded.

### Connection lifecycle

- Connect/disconnect is a workflow-scoped operation authorized through existing `integration.manage` capability and workflow access.
- Store provider credential references/secrets through the existing secret-management adapter; never return or log secret values.
- Disconnection takes effect before subsequent operations are accepted; pending operations re-check connection and authorization at execution.
- Plugin manifest declares ID, version, required permissions, lifecycle, and contracts; resolver loads only Telegram capability for the current operation.

## `ConversationAIJobV1`

```text
type: "conversation.ai-assist.requested.v1"
idempotencyKey: `${workflowId}:${conversationId}:${sourceMessageId}`
correlationId: string
workflowId: string
conversationId: string
sourceMessageId: string
requestedAt: ISO-8601 timestamp
```

- **Producer**: Core conversation application after durable customer-message commit, only when workflow AI is enabled and the conversation is AI-controlled.
- **Consumer**: AI Plugin worker through the queue adapter. Reload workflow configuration, conversation, and source message; do not trust queued state as current state.
- **Delivery**: At least once; duplicate key produces no duplicate response. No ordering is assumed across unrelated conversations.
- **Preconditions**: Workflow and conversation match; AI remains enabled; current handler remains `ai`; source message still belongs to the conversation. Otherwise acknowledge as a no-op.
- **Success**: Provider response is validated and appended through Core only after rechecking workflow/control state. Human takeover always wins a race.
- **Timeout/retry**: Bounded provider timeout; retry only transient infrastructure/provider failures using bounded exponential backoff and configured maximum attempts.
- **Permanent failure/exhaustion**: Send to the existing queue dead-letter handling path, record a non-sensitive failed/degraded outcome, and leave the customer message available for manual response. No retry exhaustion may block the conversation.
- **Observability**: Include job/correlation IDs and outcome classification; redact prompts, generated text, visitor PII, credentials, and provider payloads from logs.

## Port inventory

Application ports: workflow-scoped repositories for public pages/settings, customers, conversations/messages, plugin connections and member bindings; identity/member resolver; existing authorization use cases; audit writer; widget session token verifier/issuer; rate limiter; AI assistance capability; queue producer. Infrastructure adapters: Prisma/PostgreSQL, Clerk, Redis, Vercel Queues, and external AI/Telegram clients. Test fakes implement the same ports.
