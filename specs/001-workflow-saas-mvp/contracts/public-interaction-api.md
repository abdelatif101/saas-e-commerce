# Contract: Public Product Pages, Chat Widget, and Commerce Interaction API

## Purpose
Defines public and authenticated contracts for product discovery, customer conversation initiation, purchase intent capture, and order creation.

## Public Surface Contracts

### Resolve Public Product Page
- **Operation**: `GET /public/{workflowRef}/products/{productSlug}`
- **Output**: product presentation model, public availability state, entry points for conversation/intent
- **Rules**:
  - Must only expose workflow-scoped product data intended for public view
  - Disabled/non-public product returns unavailable state

### Start Widget Session
- **Operation**: `POST /widget/{workflowRef}/sessions`
- **Input**: origin, optional visitor metadata, optional product context
- **Output**: widget session token + conversation/session references
- **Rules**:
  - Validate workflow routing
  - Enforce origin/rate-limit policies
  - Never expose internal credentials

### Create/Append Conversation Message
- **Operation**: `POST /widget/{workflowRef}/conversations/{conversationId}/messages`
- **Input**: message payload, optional customer identity fields
- **Output**: accepted message + current handling mode
- **Rules**:
  - Conversation belongs to workflow
  - Customer identity updates follow deduplication rules

### Capture Purchase Intent
- **Operation**: `POST /api/workflows/{workflowId}/purchase-intents`
- **Input**: customer reference, product/items, channel context, contact info snapshot
- **Output**: intent record + optional order draft reference
- **Rules**:
  - Requires authenticated merchant operation for internal conversion
  - Public-origin data must be validated before conversion

### Convert Intent to Order
- **Operation**: `POST /api/workflows/{workflowId}/orders`
- **Input**: customer + items + contact snapshot + source context
- **Output**: order id with initial status `New`
- **Rules**:
  - Requires `order.manage`
  - All items and customer must belong to same workflow

## Error Contract
- `400` invalid input
- `403` policy denied (origin/abuse/authorization)
- `404` workflow/product/conversation not found in scope
- `422` business rule validation failed
