# Feature Specification: Workflow-Centered SaaS E-Commerce MVP

**Feature Branch**: `[001-workflow-saas-mvp]`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Define the MVP for the Workflow-centered SaaS E-Commerce platform based on @PRD.md, including Account, Subscription, Members, Roles/Permissions, Workflows, Products, Customers, Conversations, Orders, AI, Chat Widget, Public Product Pages, and Plugins. Keep the scope focused on the PRD and avoid overengineering."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Launch a workflow and start selling (Priority: P1)

A merchant creates an account, creates a workflow within subscription limits, configures products, and starts receiving customer interactions that can become orders.

**Why this priority**: This is the core business outcome of the MVP; without it, the platform cannot deliver commerce value.

**Independent Test**: Can be fully tested by creating an account, creating a workflow, adding at least one product, receiving a customer inquiry, and converting that interaction into an order in the same workflow.

**Acceptance Scenarios**:

1. **Given** a new merchant with no account, **When** they complete onboarding, **Then** an account and initial workflow are created and ready for product/customer/order operations.
2. **Given** a workflow with products configured, **When** a customer expresses purchase intent through a supported entry point, **Then** the merchant can create and manage an order in that workflow.

---

### User Story 2 - Control team access safely (Priority: P2)

An account owner or admin invites members, assigns roles and permissions, and grants workflow access so each member can only perform authorized operations in authorized workflows.

**Why this priority**: Controlled collaboration and access isolation are required for safe multi-user operation and tenant trust.

**Independent Test**: Can be fully tested by inviting members with different roles, granting different workflow access, and verifying allowed and denied operations across products, customers, conversations, and orders.

**Acceptance Scenarios**:

1. **Given** a member with limited role/permissions and access to only Workflow A, **When** they try to access Workflow B data, **Then** access is denied.
2. **Given** an owner/admin with member-management rights, **When** they assign or revoke workflow access, **Then** member access updates immediately for affected workflows.

---

### User Story 3 - Communicate with customers using human or AI support (Priority: P3)

A merchant manages conversations from product pages, chat widget, and supported integrations, responds manually, and optionally enables AI while retaining human takeover control.

**Why this priority**: Communication is central to conversion and customer service, and optional AI improves speed without becoming mandatory.

**Independent Test**: Can be fully tested by starting conversations from public channels, replying manually, enabling AI responses, performing human handoff, and confirming conversation and order-intent context remains in the correct workflow.

**Acceptance Scenarios**:

1. **Given** AI is disabled, **When** customers send messages, **Then** the merchant can still operate end-to-end conversation and order-intent flows manually.
2. **Given** AI is enabled for a workflow, **When** AI participates in a conversation, **Then** a merchant can take over at any time and continue manually.

---

### Edge Cases

- What happens when an account reaches its maximum workflow limit and a member attempts to create another workflow?
- How does the system handle a member whose role allows an action but who lacks access to the current workflow?
- What happens when customer identifiers are incomplete or duplicated across channels (for example, guest to known-customer transition)?
- How does the system behave when a plugin-initiated action (for example, Telegram command) is valid in format but unauthorized for the member or workflow?
- What happens when AI is enabled but unavailable during an active conversation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow merchants to create and manage Accounts that own subscription, members, roles/permissions, workflow definitions, and account-level settings.
- **FR-002**: System MUST enforce Account-level Subscription limits on the maximum number of Workflows, regardless of the initiating member's role.
- **FR-003**: System MUST allow authorized account members to invite, remove, and manage members, including role assignment and workflow access grants/revocations.
- **FR-004**: System MUST support at least three default account roles (Owner, Admin, Member) with distinct business capabilities and owner-only operations.
- **FR-005**: System MUST enforce capability-based permissions for operational areas including workflows, products, customers, conversations, orders, integrations, AI, chat, members, and account management.
- **FR-006**: System MUST require both account membership and explicit workflow access before allowing workflow-scoped operations.
- **FR-007**: System MUST ensure each Workflow is an isolated business environment with no cross-workflow data visibility or mutation.
- **FR-008**: System MUST allow creation and management of Products within a workflow, supporting both physical and digital product types.
- **FR-009**: System MUST allow creation and management of Customers within a workflow, including transition from temporary/guest customer to persistent customer when sufficient identifying information is available.
- **FR-010**: System MUST allow merchants to create, view, and manage Conversations tied to a workflow and customer, with manual response capability always available.
- **FR-011**: System MUST allow merchants to capture purchase intent from supported channels and convert that intent into workflow-scoped Orders without requiring a full checkout system.
- **FR-012**: System MUST support Order creation and management with defined statuses (New, Processing, Completed, Cancelled) and enforce valid status transitions.
- **FR-013**: System MUST provide Public Product Pages that expose shareable product information, support customer questions, and allow purchase-intent initiation.
- **FR-014**: System MUST provide an embeddable Chat Widget for external websites that routes visitors to the correct workflow and supports customer conversation and purchase discussions.
- **FR-015**: System MUST treat AI as optional; the platform MUST remain fully usable for core commerce and communication when AI is disabled.
- **FR-016**: When AI is enabled, System MUST constrain AI operations to authorized workflow context and prevent AI from bypassing membership, permission, or workflow-access checks.
- **FR-017**: System MUST support human handoff for AI-assisted conversations so merchants can take over and continue manually at any point.
- **FR-018**: System MUST support plugin-based integrations (including Telegram and future channels) that execute operations through the same account/workflow authorization model as native operations.
- **FR-019**: System MUST prevent plugins from introducing independent authorization paths that bypass account roles, permissions, or workflow isolation.
- **FR-020**: System MUST allow merchants to connect and disconnect supported external platforms per workflow and process supported inbound/outbound interaction events within workflow context.
- **FR-021**: System MUST record auditable events for sensitive membership, access-control, and operational actions.
- **FR-022**: System MUST maintain durable ownership mapping showing whether each resource is account-scoped or workflow-scoped.
- **FR-023**: System MUST keep MVP scope focused on workflow-centered commerce and customer communication, explicitly excluding full website builder capabilities, advanced automation, and advanced billing systems.

### Key Entities *(include if feature involves data)*

- **Account**: Merchant organization that owns subscription, members, role/permission policies, workflows, and account-level governance.
- **Subscription**: Account-scoped entitlement defining workflow-count limits and other account-wide capability boundaries.
- **Member**: Human operator associated with an account, assigned a role, permissions, and workflow-access grants.
- **Role**: Named permission baseline (Owner, Admin, Member) used to bootstrap account authorization behavior.
- **Permission Grant**: Capability-level authorization record defining what actions a member may perform.
- **Workflow**: Isolated business environment owned by an account and containing commerce/communication operations.
- **Product**: Workflow-scoped sellable item (physical or digital) with business-facing catalog attributes and public-page eligibility.
- **Customer**: Workflow-scoped buyer identity, including temporary/guest representation and deduplicated persistent records.
- **Conversation**: Workflow-scoped customer communication thread handled by human, AI, or both.
- **Order**: Workflow-scoped purchase record derived from customer intent and managed through defined statuses.
- **AI Capability**: Optional workflow-scoped assistant behavior for conversation support under platform authorization rules.
- **Chat Widget Configuration**: Workflow-scoped public chat settings used by embedded website chat.
- **Public Product Page**: Publicly reachable product presentation surface linked to a workflow product and customer interaction flow.
- **Plugin Integration**: Optional workflow-connected capability (for example Telegram or channel connectors) that routes actions through platform authorization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of new merchants in acceptance testing can complete the baseline onboarding journey (account creation, first workflow creation, first product setup) in one uninterrupted session.
- **SC-002**: In authorization acceptance tests, 100% of unauthorized cross-workflow access attempts are denied while authorized same-workflow operations succeed.
- **SC-003**: At least 95% of end-to-end purchase-intent journeys (from conversation or product page to order creation) complete without manual data repair.
- **SC-004**: In role/permission validation tests, 100% of tested owner/admin/member capability boundaries behave as defined, including owner-only operations.
- **SC-005**: At least 90% of sampled customer conversations can be handled end-to-end via manual response, with optional AI and human handoff functioning when enabled.
- **SC-006**: Public customer entry points (public product page and chat widget) successfully route interactions to the correct workflow in at least 99% of verification cases.
- **SC-007**: The MVP remains operable for core commerce flows (product, customer, conversation, order management) with AI disabled in 100% of required acceptance scenarios.

## Assumptions

- The MVP includes one default subscription setup that enforces workflow count limits, while detailed commercial pricing/tiering remains out of scope.
- Authentication exists and provides user identity, while business authorization decisions are handled by account membership, permissions, and workflow access rules.
- Product checkout remains intent-driven for MVP (including COD-focused physical-product flow) rather than a full online payment checkout system.
- Public product pages are enabled by default for eligible products but can be disabled per product when merchants choose.
- Chat widget deployment occurs on merchant-managed external websites with basic origin/abuse protections applied.
- Telegram is treated as an initial plugin integration for authorized merchant control actions, using the same permission model as dashboard operations.
- The platform prioritizes workflow-centered commerce/communication outcomes and intentionally excludes non-goals from the PRD (for example full website builder, advanced automation, and plugin marketplace).
