# Data Model: Public Customer Interaction Operations

## Ownership and Source of Truth

- Account-scoped existing records: `Account`, `Subscription`, `Member`, `Role`, `PermissionGrant`, and workflow access grants.
- Workflow-scoped durable records: `Workflow`, `Product`, `PublicProductPage`, widget/AI settings, `Customer`, `Conversation`, conversation messages, `PluginConnection`, trusted plugin-member bindings, and interaction `AuditEvent`.
- PostgreSQL is authoritative; access is through Prisma adapters. Redis may hold expiring rate-limit counters and coordination data only.
- Every operational record carries `workflowId` or is reachable only through a record with the same `workflowId`. Enforce workflow equality across product/page, conversation/customer/message, and plugin connection/operation relations in application validation and persistence constraints where possible.

## Entities

### Existing entities to retain and complete

| Entity | Scope and fields relevant to this feature | Relationships and invariants |
|---|---|---|
| `Workflow` | Account-owned workflow context and status | Belongs to one Account; required before any operational read/write. |
| `Product` | `id`, `workflowId`, sellable/public state, catalog presentation fields | Page product must belong to the page's workflow and be active/public. Reuse existing commerce model. |
| `PublicProductPage` | `id`, `workflowId`, `productId`, `slug`, `enabled`, `visibility`, `updatedAt` | Slug unique within workflow; page and product share workflow; disabled/private pages are unavailable. |
| `ChatWidgetConfiguration` | `id`, `workflowId`, `enabled`, allowed origins, rate-limit profile, branding, `updatedAt` | One current configuration per workflow unless existing persistence requires versioned rows; no client-supplied config is trusted. |
| `Customer` | `id`, `workflowId`, guest/identified kind, optional name/email/phone, source channel | Guest may be promoted in the same workflow; never merge across workflows. |
| `Conversation` | `id`, `workflowId`, `customerId`, channel, optional integration/product context, status, `currentHandler`, timestamps | Customer and optional product context share workflow. `currentHandler` is `human` or `ai`; AI is permitted only when enabled. |
| `PluginConnection` | `id`, `workflowId`, plugin ID, connection status, external account reference, permission scope, timestamps | One channel connection belongs to one workflow; disconnected connections cannot invoke operations. Never persist channel secrets in public records/logs. |
| `AuditEvent` | Existing account/workflow/actor/action/target/result/timestamp/metadata fields | Append-only; secrets and message PII excluded; sensitive events retained at least 365 days. |

### Feature additions

| Entity | Fields | Relationships and invariants |
|---|---|---|
| `ConversationMessage` | `id`, `workflowId`, `conversationId`, sender (`customer`/`merchant`/`ai`), content, `createdAt`, optional idempotency reference | Conversation/workflow must match; ordering by persisted creation sequence/time; log metadata must not copy content/PII. |
| `WidgetSession` | `id`, `workflowId`, `conversationId`, `customerId`, token verifier/hash, `expiresAt`, `revokedAt?`, `createdAt` | Binds one public client credential to one conversation/customer/workflow; store only a verifier/hash, never a reusable raw bearer token. Expiry/revocation and message rate limits apply. |
| `ConversationControlEvent` (or equivalent audit record) | `id`, `workflowId`, `conversationId`, actor (`member`/`system`), from/to handler, reason, timestamp | Records manual takeover/control changes; AI output must re-check current state before append. Reuse AuditEvent if it can represent this without adding a parallel event store. |
| `PluginMemberBinding` | `id`, `accountId`, `pluginId`, external identity reference, `memberId`, status, timestamps | Unique active binding per channel/external identity and Account; identity maps to a current account member. Workflow permission is checked separately at execution. |

## State and Validation Rules

- Public page lookup uses `(workflowRef, productSlug)` and only returns a page and product that are enabled/public and share a workflow. Do not disclose private product fields for disabled/missing pages.
- Widget session creation validates the persisted configuration, allowed origin, request shape/size, and workflow status before creating a guest customer and conversation. A public session token cannot grant access to other conversations or workflow data.
- Customer identity enrichment updates the existing customer only after validating its conversation/session ownership and workflow. Do not deduplicate or promote across workflow boundaries.
- A message is persisted before optional AI dispatch. Repeated AI jobs are idempotent by workflow, conversation, and source message. AI output is appended only if the conversation remains AI-controlled and in the same workflow.
- Human takeover is authorized by the existing conversation-management capability and workflow grant; it atomically changes current control to human. Stale AI responses are discarded. Manual replies do not require AI availability.
- Telegram operation authorization resolves a trusted plugin-member binding, then loads current account membership, capability grants, workflow access, and resource context. Missing, revoked, inactive, or ambiguous identity/context is denied and audited without mutation.
- Audit metadata records correlation and decision context but omits credentials, webhook secrets, raw session tokens, and message body.

## Persistence and Ephemeral Data

Prisma/PostgreSQL stores page/configuration, customer, conversation/message, binding, connection, and audit truth. Redis counters can implement configured rate limits and may expire independently; cache/Redis failure must not corrupt or hide durable business state. Queue delivery is not business state: job execution is idempotent and verifies the persisted conversation state before writing.
