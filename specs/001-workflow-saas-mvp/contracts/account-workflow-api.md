# Contract: Account & Workflow Management API

## Purpose
Defines authenticated merchant-facing contracts for account setup, member/role/permission management, workflow management, and authorization checks.

## Authorization Contract
Every protected operation enforces:
1. Authenticated identity
2. Account membership
3. Role/permission capability
4. Workflow access check (for workflow-scoped endpoints)

## Endpoint Contracts

### Create Account
- **Operation**: `POST /api/accounts`
- **Input**: account display name
- **Output**: account id + default subscription + owner membership
- **Rules**:
  - Caller becomes owner member
  - Owner role assigned by default

### Create Workflow
- **Operation**: `POST /api/accounts/{accountId}/workflows`
- **Input**: workflow name
- **Output**: workflow id and metadata
- **Rules**:
  - Requires `workflow.manage`
  - Enforces subscription max workflow limit

### Invite Member
- **Operation**: `POST /api/accounts/{accountId}/members/invitations`
- **Input**: email, target role, optional initial workflow access list
- **Output**: invitation record
- **Rules**:
  - Requires `member.manage`
  - Owner-only restrictions apply to owner-level operations

### Assign Role / Permissions
- **Operation**: `PATCH /api/accounts/{accountId}/members/{memberId}/access`
- **Input**: role + permission grants
- **Output**: updated access profile
- **Rules**:
  - Requires `member.manage`
  - Must not remove sole owner without transfer flow

### Grant/Revoke Workflow Access
- **Operation**: `POST|DELETE /api/accounts/{accountId}/workflows/{workflowId}/access/{memberId}`
- **Input**: grant/revoke intent
- **Output**: updated grant status
- **Rules**:
  - Requires `member.manage` and `workflow.manage`
  - Member must belong to same account

## Error Contract
- `401` unauthenticated
- `403` permission or workflow-access denied
- `404` account/workflow/member not found in caller scope
- `409` invariant conflict (e.g., sole owner removal, workflow limit reached)
