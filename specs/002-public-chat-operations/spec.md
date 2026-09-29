# Feature Specification: Public Customer Interaction Operations

**Feature Branch**: `[002-public-chat-operations]`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Define the next coherent product capability from @PRD.md and the existing specs, based on the current project state and completed work. Specify the user problem, goals, actors, functional behavior, business rules, permissions, Workflow boundaries, acceptance criteria, edge cases, and explicit non-goals; preserve the existing Account → Subscription → Members/Roles/Permissions → Workflow model and Prisma, but do not prescribe implementation architecture or technology unless required by an existing project constraint."

## User Scenarios & Testing *(mandatory)*

### User Problem

Merchants can already manage account, subscription limits, team roles/permissions, workflows, and core commerce records, but they still lack a complete customer-facing interaction surface that connects public entry points, optional AI assistance, and plugin-initiated operations into one workflow-safe operational loop.

### Product Goals

- Complete the MVP communication surface so customers can start from public product pages or embedded chat and reach merchant operations.
- Keep manual merchant control available at all times, with AI remaining optional.
- Ensure plugin-triggered operations follow the same authorization and workflow-boundary rules as native dashboard actions.

### Actors

- **Account Owner/Admin**: Configures workflow-level public interaction settings and manages who can operate interaction channels.
- **Merchant Member**: Handles conversations, order-intent follow-up, and plugin-assisted operations when authorized.
- **Customer/Visitor**: Interacts through public product pages and chat widget.
- **Plugin/Integration Actor (Telegram and future channels)**: Sends operation requests that must resolve to an authorized member context.

### User Story 1 - Start customer interactions from public surfaces (Priority: P1)

A customer discovers a product through a public product page or embedded chat widget, starts a conversation, and shares purchase intent that is routed to the correct workflow.

**Why this priority**: Without public entry points, merchants cannot consistently acquire or route customer conversations into workflow-scoped commerce operations.

**Independent Test**: Can be fully tested by enabling a public product page and widget for a workflow, initiating customer messages from both entry points, and confirming they appear in the same target workflow context.

**Acceptance Scenarios**:

1. **Given** a workflow has a public product page enabled, **When** a visitor opens the page and starts a conversation, **Then** the conversation is created in that workflow and linked to the relevant product context.
2. **Given** a widget is configured for Workflow A, **When** a visitor sends a message from an allowed origin, **Then** the message is accepted and routed only to Workflow A.

---

### User Story 2 - Operate conversations with optional AI and guaranteed human control (Priority: P2)

Merchants run conversations manually by default, can enable AI assistance when desired, and can take over any AI-assisted conversation immediately.

**Why this priority**: The MVP promise requires customer communication to work end-to-end without AI while still supporting AI acceleration when enabled.

**Independent Test**: Can be fully tested by handling the same conversation flow once with AI disabled and once with AI enabled, then forcing human takeover mid-conversation.

**Acceptance Scenarios**:

1. **Given** AI is disabled for a workflow, **When** customer messages arrive, **Then** merchants can complete conversation handling manually with no AI dependency.
2. **Given** AI is enabled for a workflow, **When** AI is participating in a conversation and a merchant takes over, **Then** control immediately shifts to the merchant and remains manual until changed again.

---

### User Story 3 - Execute plugin-assisted operations under existing authorization rules (Priority: P3)

A merchant uses Telegram/plugin commands to perform workflow operations, and the system enforces account membership, role/permission checks, and workflow access before execution.

**Why this priority**: Plugin channels must extend the product safely, not bypass the platform's existing governance model.

**Independent Test**: Can be fully tested by issuing plugin commands from users with different permissions/workflow access and verifying authorized commands succeed while unauthorized commands fail.

**Acceptance Scenarios**:

1. **Given** a member lacks required permission or workflow access, **When** they submit a plugin command, **Then** the operation is denied and no workflow data is modified.
2. **Given** a member has required permission and workflow access, **When** they submit a plugin command, **Then** the operation executes within the resolved workflow and follows normal business rules.

---

### Edge Cases

- What happens when a public product page is disabled after its URL has already been shared publicly?
- How does the system behave when a widget request cannot be mapped to a valid workflow context?
- What happens when a plugin command is syntactically valid but cannot be mapped to an authenticated member identity?
- How does conversation handling proceed when AI is enabled but temporarily unavailable?
- What happens when a member has permission for an operation but loses workflow access before execution completes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow each workflow to expose customer interaction entry points through public product pages and chat widget configurations.
- **FR-002**: System MUST route every public product page and chat widget interaction to exactly one resolved workflow context before any conversation or intent processing.
- **FR-003**: System MUST allow visitors to start customer conversations from public product pages and widget sessions without requiring merchant dashboard access.
- **FR-004**: System MUST preserve product context linkage when conversations originate from public product pages.
- **FR-005**: System MUST support customer identity progression in conversations (from minimal/guest identity to richer identified identity) within the same workflow.
- **FR-006**: System MUST keep manual merchant conversation handling available regardless of AI configuration state.
- **FR-007**: System MUST treat AI conversation assistance as optional and MUST keep communication workflows operational when AI is disabled or unavailable.
- **FR-008**: System MUST allow authorized merchants to take immediate human control of AI-assisted conversations at any point.
- **FR-009**: System MUST allow workflows to connect/disconnect supported plugin channels and only process plugin operations while the connection is active.
- **FR-010**: System MUST require plugin-initiated operations to resolve an account member identity and pass account membership, role/permission, and workflow-access checks before execution.
- **FR-011**: System MUST enforce the same business rules and operation boundaries for plugin-initiated actions as for native merchant actions.
- **FR-012**: System MUST block plugin or AI paths from creating independent authorization behavior that bypasses existing account/workflow governance.
- **FR-013**: System MUST maintain strict workflow isolation so public, AI-assisted, and plugin-initiated actions cannot read or mutate data outside the resolved workflow.
- **FR-014**: System MUST preserve the existing Account → Subscription → Members/Roles/Permissions → Workflow control hierarchy for all capabilities in this feature.
- **FR-015**: System MUST remain compatible with the repository's existing Prisma-based data access model and ownership semantics.
- **FR-016**: System MUST record auditable events for sensitive public-surface configuration changes, AI handoff/control actions, and plugin operation authorization decisions.
- **FR-017**: System MUST protect public interaction surfaces with workflow-safe request validation and abuse controls appropriate to customer-facing endpoints.

### Business Rules and Permissions

- Workflow configuration privileges for public surfaces, AI enablement, and plugin channel connectivity are restricted to members who already hold the required account/workflow capabilities.
- A member with account membership but without workflow access is denied conversation and operation handling in that workflow, including via plugins.
- Subscription limits remain account-governed and continue to constrain workflow-level feature usage only through existing account/workflow entitlement logic.
- Workflow context is mandatory for all operational actions; unresolved context results in denial, not fallback to another workflow.

### Workflow Boundaries

- Public product pages, widget sessions, conversations, AI assistance, and plugin commands are workflow-scoped operational surfaces.
- Account, subscription, member, role, and permission governance remains account-scoped and is applied before workflow-scoped operations.
- Cross-workflow visibility or mutation is prohibited even when the same account owns multiple workflows.

### Key Entities *(include if feature involves data)*

- **Public Product Page**: Publicly reachable product presentation and interaction surface linked to one workflow product.
- **Chat Widget Session**: Customer interaction session initiated from an embedded widget and bound to one workflow.
- **Conversation Control State**: Workflow-scoped state indicating manual handling, AI assistance, and handoff transitions.
- **Plugin Connection**: Workflow-level enablement state and channel binding for a supported integration.
- **Plugin Operation Request**: A channel-originated instruction that must resolve member identity, required permissions, and workflow context before execution.
- **Interaction Audit Event**: Immutable record of sensitive actions and authorization outcomes related to public surfaces, AI control, and plugin operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of sampled public product page visits can successfully start a conversation in the intended workflow without manual remediation.
- **SC-002**: At least 95% of sampled widget-originated conversations are routed to the correct workflow on first attempt.
- **SC-003**: In authorization validation, 100% of plugin operation attempts without required permission and workflow access are denied.
- **SC-004**: In authorization validation, 100% of plugin operation attempts with valid membership, permission, and workflow access succeed within the correct workflow boundary.
- **SC-005**: In acceptance testing, merchants can complete end-to-end conversation handling manually in 100% of required scenarios with AI disabled.
- **SC-006**: In AI-enabled acceptance testing, merchants can successfully perform immediate human takeover in at least 99% of tested conversations.
- **SC-007**: In workflow isolation validation, 100% of tested cross-workflow access attempts through public, AI, and plugin paths are blocked.

## Assumptions

- Existing account, subscription, member, role/permission, and workflow governance behavior from the current MVP specification remains authoritative and unchanged.
- Existing product/customer/conversation/order domain ownership mappings remain valid; this feature extends interaction surfaces and control behavior around them.
- Public interaction entry points continue to support intent-driven commerce flows rather than introducing a full checkout-site builder capability.
- Telegram remains the initial plugin channel for merchant-side control operations, while future channels can follow the same governance model.
- Any usage/cost tracking for AI interactions is limited to lightweight operational recording and does not introduce advanced billing scope.

## Non-Goals

- Building a full website builder or CMS for merchant storefronts.
- Introducing a new authorization model separate from existing account/workflow permissions.
- Replacing the current data ownership model or introducing an alternative ORM paradigm.
- Delivering advanced automation/orchestration engines for conversations or operations.
- Introducing advanced billing, metering, or multi-provider cost optimization flows.
