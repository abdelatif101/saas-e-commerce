# Data Model: Workflow-Centered SaaS E-Commerce MVP

## Ownership and Tenancy Rules

- Account-scoped entities: `Account`, `Subscription`, `Member`, `Role`, `PermissionGrant`, `WorkflowAccessGrant`
- Workflow-scoped entities: `Workflow`, `Product`, `Customer`, `Conversation`, `Order`, `PluginConnection`, `AIConfiguration`, `ChatWidgetConfiguration`, `PublicProductPage`, `AuditEvent`
- Every workflow-scoped entity MUST carry `workflowId` and be inaccessible without workflow authorization.

## Entities

### 1) Account
- **Fields**: `id`, `name`, `status`, `createdAt`, `updatedAt`
- **Relationships**:
  - 1:1 with `Subscription`
  - 1:N with `Member`
  - 1:N with `Workflow`
- **Validation Rules**:
  - Account name required
  - Account must always have exactly one current Owner member

### 2) Subscription
- **Fields**: `id`, `accountId`, `planCode`, `maxWorkflows`, `status`, `effectiveFrom`, `effectiveTo`
- **Relationships**: N:1 to `Account`
- **Validation Rules**:
  - `maxWorkflows >= 1`
  - Workflow creation blocked when current active workflows reaches `maxWorkflows`

### 3) Member
- **Fields**: `id`, `accountId`, `userIdentityRef`, `email`, `displayName`, `roleId`, `status`, `invitedAt`, `joinedAt`
- **Relationships**:
  - N:1 to `Account`
  - N:1 to `Role`
  - 1:N to `PermissionGrant`
  - 1:N to `WorkflowAccessGrant`
- **Validation Rules**:
  - Identity must map to a valid authentication subject
  - Cannot remove sole Owner without ownership transfer operation

### 4) Role
- **Fields**: `id`, `accountId`, `name` (`Owner`/`Admin`/`Member`), `isSystemRole`
- **Relationships**: 1:N to `Member`
- **Validation Rules**:
  - Default roles exist for each account
  - Owner role includes owner-only capabilities

### 5) PermissionGrant
- **Fields**: `id`, `accountId`, `memberId`, `capability`, `effect` (`allow`), `createdAt`
- **Relationships**: N:1 to `Member`, N:1 to `Account`
- **Validation Rules**:
  - Capability must be from allowed MVP capability set
  - Duplicate grants for same member+capability prevented

### 6) Workflow
- **Fields**: `id`, `accountId`, `name`, `status`, `createdAt`, `updatedAt`
- **Relationships**:
  - N:1 to `Account`
  - 1:N to workflow-owned entities
- **Validation Rules**:
  - Created only if subscription capacity available
  - Name required within account context

### 7) WorkflowAccessGrant
- **Fields**: `id`, `accountId`, `workflowId`, `memberId`, `accessLevel`, `grantedByMemberId`, `grantedAt`
- **Relationships**: N:1 to `Workflow`, N:1 to `Member`
- **Validation Rules**:
  - Member and workflow must belong to same account
  - Access grant required before workflow resource operations

### 8) Product
- **Fields**: `id`, `workflowId`, `type` (`physical`/`digital`), `name`, `description`, `priceAmount`, `currency`, `status`, `images[]`, `availability`, `publicPageEnabled`
- **Relationships**: N:1 to `Workflow`
- **Validation Rules**:
  - Name, type, and price required for sellable products
  - Public page only accessible when product is active/public

### 9) Customer
- **Fields**: `id`, `workflowId`, `kind` (`guest`/`identified`), `name`, `email`, `phone`, `sourceChannel`, `createdAt`, `updatedAt`
- **Relationships**: N:1 to `Workflow`; 1:N to `Conversation`; 1:N to `Order`
- **Validation Rules**:
  - Deduplication uses reliable identifiers when present (phone/email)
  - Guest can be promoted to identified customer

### 10) Conversation
- **Fields**: `id`, `workflowId`, `customerId`, `channel`, `integrationRef`, `status`, `currentHandler` (`human`/`ai`), `startedAt`, `lastMessageAt`
- **Relationships**: N:1 to `Workflow`; N:1 to `Customer`
- **Validation Rules**:
  - Manual response path always available
  - Handoff to human must be possible at all times

### 11) Order
- **Fields**: `id`, `workflowId`, `customerId`, `sourceConversationId?`, `orderType` (`physical`/`digital`), `status`, `currency`, `totalAmount`, `contactSnapshot`, `createdAt`, `updatedAt`
- **Relationships**: N:1 to `Workflow`; N:1 to `Customer`; optional N:1 to `Conversation`
- **Validation Rules**:
  - Must include at least one order line item
  - Status transition rules enforced in application layer

### 12) OrderItem
- **Fields**: `id`, `orderId`, `productId`, `quantity`, `unitPrice`, `lineTotal`
- **Relationships**: N:1 to `Order`; N:1 to `Product`
- **Validation Rules**:
  - Quantity > 0
  - Product must belong to same workflow as order

### 13) AIConfiguration
- **Fields**: `id`, `workflowId`, `enabled`, `providerProfile`, `responsePolicy`, `handoffPolicy`, `updatedAt`
- **Relationships**: N:1 to `Workflow`
- **Validation Rules**:
  - If `enabled=false`, manual conversation flow remains fully operational
  - Provider-specific secrets stored outside source code

### 14) PluginConnection
- **Fields**: `id`, `workflowId`, `pluginId`, `status`, `externalAccountRef`, `permissionsScope`, `connectedAt`, `updatedAt`
- **Relationships**: N:1 to `Workflow`
- **Validation Rules**:
  - Plugin operations must map to account member identity and permissions
  - Disconnected plugin cannot execute operations

### 15) ChatWidgetConfiguration
- **Fields**: `id`, `workflowId`, `enabled`, `allowedOrigins[]`, `rateLimitProfile`, `branding`, `updatedAt`
- **Relationships**: N:1 to `Workflow`
- **Validation Rules**:
  - Widget requests must resolve target workflow safely
  - Internal credentials never exposed to clients

### 16) PublicProductPage
- **Fields**: `id`, `workflowId`, `productId`, `slug`, `enabled`, `visibility`, `updatedAt`
- **Relationships**: N:1 to `Workflow`; N:1 to `Product`
- **Validation Rules**:
  - Slug unique per workflow
  - Disabled page returns not available state

### 17) AuditEvent
- **Fields**: `id`, `accountId`, `workflowId?`, `actorMemberId`, `action`, `targetType`, `targetId`, `result`, `timestamp`, `metadata`
- **Relationships**: N:1 to `Account`; optional N:1 to `Workflow`
- **Validation Rules**:
  - Required for sensitive member/access/authorization and operational actions
  - Must not store secrets in metadata

## State Transitions

### Order Status
- Allowed transitions:
  - `New -> Processing`
  - `New -> Cancelled`
  - `Processing -> Completed`
  - `Processing -> Cancelled`
- Disallowed transitions:
  - `Completed -> *`
  - `Cancelled -> *`
  - `New -> Completed` (must pass through Processing)

### Conversation Handling Mode
- Allowed handling transitions:
  - `human -> ai` (when AI enabled and allowed)
  - `ai -> human` (always allowed for handoff)
  - `human+ai` collaborative mode where human override is immediate
- Invariant:
  - Human takeover cannot be blocked by AI/plugin behavior
