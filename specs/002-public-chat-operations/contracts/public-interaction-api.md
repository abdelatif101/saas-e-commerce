# Contract: Public and Merchant Interaction APIs

These HTTP contracts are presented by Next.js routes and delegate business behavior to Core application use cases. Route names align with the existing `project-code/src/app` scaffold. All JSON responses use stable error codes; do not expose provider errors, secrets, or private product data.

## Public product page

`GET /public/{workflowRef}/products/{productSlug}`

- Resolves exactly one active workflow, enabled public page, and matching active product.
- `200`: `{ product: { slug, name, description?, type, priceAmount, currency, availability }, context: { workflowRef, productRef? } }`.
- `404`: missing, disabled, private, or mismatched page/product; response does not reveal which condition or expose private data.
- Product context used to start a conversation is server-resolved, not trusted from an arbitrary body ID.

## Create widget session

`POST /widget/{workflowRef}/sessions`

- Request: `{ productSlug?: string, visitorMetadata?: { name?: string, email?: string, phone?: string } }`; browser `Origin` header is evaluated against the persisted widget configuration. Do not accept client-provided workflow IDs, configuration, rate limit, customer ID, conversation ID, or authorization claims.
- Server validates workflow/configuration/origin, applies rate/size/schema limits, creates or resumes permitted guest context through Core, and issues a high-entropy opaque credential bound to one workflow and conversation.
- `201`: `{ sessionToken, expiresAt, conversationId }`; the raw token is returned only on creation and is never logged or persisted in recoverable form.
- `400`: invalid payload; `403`: origin not allowed; `404`: workflow or public product context unavailable; `429`: rate limited; `503`: required durable persistence unavailable.

## Append widget message / enrich visitor

`POST /widget/{workflowRef}/conversations/{conversationId}/messages`

- Authorization: include the scoped widget session credential in the request authorization header; validate its verifier, expiry/revocation, workflow, and conversation before loading or mutating customer/message records.
- Request: `{ content: string, identity?: { name?: string, email?: string, phone?: string }, idempotencyKey?: string }`.
- `201`: `{ message: { id, sender: "customer", createdAt }, conversation: { id, currentHandler } }`; accepted content is persisted in PostgreSQL. Identity enrichment stays within the bound workflow.
- `400`: invalid/oversized content; `401`: missing/invalid/expired credential; `404`: conversation unavailable; `429`: rate limited; `503`: durable persistence unavailable.
- If AI is enabled, assistance is scheduled independently after persistence; a scheduling/provider error does not invalidate the accepted message.

## Merchant conversation operations

- Dashboard endpoints are workflow-scoped and require Clerk identity resolution, account membership, the existing required capability (normally `conversation.view` or `conversation.manage`), explicit workflow access, and resource/workflow equality.
- Read/reply operations load via workflow-scoped application repositories. Human takeover is an explicit operation requiring `conversation.manage`; it atomically sets manual control and writes an audit event. It is always available even if AI is disabled or unavailable.
- Workflow interaction and plugin settings changes require their existing account/workflow capabilities (`chat.manage`, `ai.manage`, or `integration.manage` as applicable) and are audited.
- Denial returns `403`; missing or cross-workflow records return a non-enumerating `404`. No route accepts caller-supplied grants as proof of access.

## Telegram webhook/operation

- The Telegram adapter validates provider authenticity before parsing. It resolves the external sender using an active workflow plugin connection and trusted Account member binding; the body cannot assert `memberId`, role, capabilities, workflow access, or account.
- The resolved operation supplies one workflow and invokes the same Core application use case and business rules as the dashboard. Disconnected channel, unknown binding, revoked member, insufficient capability, or absent workflow grant fails closed, is audited, and produces no mutation.
- Successful results contain only the minimum channel response. Internal errors, credentials, customer PII, and raw authorization state are not echoed.

## Common protections

- Validate payloads, message size, content type, origin, workflow status, and identifiers at the boundary and again enforce invariants in Application/Domain.
- Rate-limit by workflow and suitable client/session dimensions through `RateLimitPort`; use Redis adapter but never rely on it as source of truth. When the limiter is unavailable, follow the explicit application policy: deny new public-session creation (fail closed) while continuing already-authorized merchant handling; do not silently disable abuse controls.
- Emit correlation IDs in responses/logs as appropriate. Logs redact tokens, secrets, message bodies, and visitor PII.
