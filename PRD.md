SaaS E-Commerce MVP — Product Requirements Document

Version: 2.1.0
Status: Draft
Product Type: SaaS E-Commerce & Customer Communication Platform
Architecture: Core + Modules + Plugins
Target: MVP
Primary Language: English

---

1. Product Overview

The product is a multi-tenant SaaS platform that allows merchants to manage products, customers, conversations, orders, and connected platforms from one centralized environment.

The primary purpose of the platform is:

«Help merchants sell products by managing customer communication and commerce from one place, using AI or human operators.»

The platform supports:

- Physical products
- Digital products
- Customer conversations
- AI-assisted communication
- Human communication
- Orders
- Public product pages
- Embedded customer chat
- External platform integrations
- Telegram-based merchant control through AI

The MVP is intentionally focused on commerce and customer communication rather than becoming a general-purpose website builder or automation platform.

---

2. Product Model

The platform follows this hierarchy:

Account
│
├── Subscription
│
├── Members
│   ├── Owner
│   ├── Admin
│   └── Member
│
└── Workflows
    │
    ├── Products
    ├── Customers
    ├── Conversations
    ├── Orders
    ├── Integrations
    ├── AI Configuration
    ├── Chat Widget
    ├── Public Product Pages
    └── Workflow Settings

The core relationship is:

«Account owns identity, membership, subscription, and Workflows. Workflow owns the business environment.»

---

3. Account

An Account represents the merchant's platform-level organization.

The Account owns:

- Subscription
- Members
- Roles
- Permissions
- Workflows
- Account-level settings

The Account does not directly own operational commerce data such as products, customers, conversations, or orders.

Those resources belong to a Workflow.

---

4. Subscription

The Subscription determines the capabilities and limits available to an Account.

For the MVP, the primary subscription-controlled limit is:

- Maximum number of Workflows

Additional limits may be introduced later.

Subscription limits apply to the Account as a whole.

A member cannot bypass Account subscription limits through permissions or roles.

Exact pricing and subscription tiers are outside the scope of this PRD.

---

5. Workflow

A Workflow is the primary business environment of the platform.

Each Workflow represents an independent merchant operating environment.

A Workflow owns:

- Products
- Customers
- Conversations
- Orders
- Integrations
- AI configuration
- Chat configuration
- Public product pages
- Workflow settings

A Workflow must be isolated from every other Workflow.

One Account may own multiple Workflows when permitted by its Subscription.

---

6. Workflow-Centered Model

The platform follows:

Account
   │
   ├── Subscription
   │
   ├── Members
   │
   └── Workflows
          │
          ├── Products
          ├── Customers
          ├── Conversations
          ├── Orders
          ├── Integrations
          ├── AI
          ├── Chat
          └── Public Product Pages

The active Workflow determines the business context for operational actions.

All business operations must resolve the target Workflow before accessing Workflow-owned data.

---

7. Account Members

An Account may have multiple members.

Members represent people who can access and operate the Account and its Workflows.

The membership model is separate from Workflow access.

Being a member of an Account does not automatically mean the member can access every Workflow.

---

8. Account Roles

The MVP defines three initial Account roles:

8.1 Owner

The Owner has full Account control.

The Owner can:

- Manage Account settings
- Manage Subscription
- Create and manage Workflows
- Manage Account members
- Assign roles
- Manage permissions
- Manage Workflow access
- Manage integrations
- Perform supported business operations

Ownership transfer is an explicit Account-level operation.

---

8.2 Admin

An Admin can manage the Account and its operational environment according to the permissions available to the role.

An Admin can:

- Manage members
- Manage Workflow access
- Create and manage Workflows when permitted by Subscription
- Manage products
- Manage customers
- Manage conversations
- Manage orders
- Manage integrations
- Manage supported AI configuration

An Admin cannot:

- Transfer Account ownership
- Perform Owner-only Subscription operations

---

8.3 Member

A Member has limited access based on assigned permissions and Workflow access.

A Member may:

- Access explicitly assigned Workflows
- View or manage products
- View or manage customers
- View or manage conversations
- View or manage orders
- Perform other operations explicitly allowed by their permissions

A Member does not automatically have access to every Workflow in the Account.

---

9. Permission Model

Authorization is capability-based.

Roles provide default permission sets, while permissions define what an Account member is allowed to do.

Initial permission areas include:

workflow.view
workflow.manage

product.view
product.manage

customer.view
customer.manage

conversation.view
conversation.manage

order.view
order.manage

integration.view
integration.manage

ai.view
ai.manage

chat.manage

member.view
member.manage

account.manage

The exact permission identifiers may be refined during implementation.

Permissions should represent meaningful business capabilities rather than individual database tables.

---

10. Workflow Access

Account membership and Workflow access are separate concepts.

The authorization flow is:

Authenticated User
       ↓
Account Membership
       ↓
Account Role / Permissions
       ↓
Workflow Access
       ↓
Resource Permission
       ↓
Operation

Example:

Account
├── Owner
├── Admin
├── Member A
└── Member B

Workflows
├── Workflow A
├── Workflow B
└── Workflow C

Member A may have access to Workflow A only.

Member B may have access to Workflow B and Workflow C.

A member must not access Workflow data without authorization.

---

11. Authorization Rules

The authorization system must enforce:

1. Authentication alone does not grant Account access.
2. Account membership must be verified.
3. Account role and permissions must be evaluated.
4. Workflow access must be verified before accessing Workflow data.
5. Resource operations must respect member permissions.
6. Account membership must not bypass Workflow isolation.
7. Resource identifiers must not be usable to bypass authorization.
8. Plugin operations must use the same authorization model.
9. Telegram operations must use the same authorization model.
10. AI must never bypass Account or Workflow authorization.

---

12. Member Management

Authorized Account members may:

- Invite members
- Remove members
- Assign roles
- Change permissions where supported
- Grant Workflow access
- Revoke Workflow access

Member-management operations should be auditable.

The platform must prevent invalid states such as removing the only Account Owner without an explicit ownership-transfer operation.

---

13. Subscription and Roles

Subscription limits apply at the Account level.

For example:

Account Subscription
        ↓
Maximum Workflows
        ↓
All Account Members

A member cannot create additional Workflows beyond the Account's Subscription limit.

Permissions determine who can create Workflows, but Subscription determines whether another Workflow can exist.

---

14. Onboarding Flow

The primary onboarding flow is:

Create Account
      ↓
Create Workflow
      ↓
Workflow Created
      ↓
Connect Platforms
      ↓
Configure Products
      ↓
Configure AI / Chat
      ↓
Invite Members if needed
      ↓
Start Receiving Customers
      ↓
Sell & Manage Orders

A merchant may later create additional Workflows according to Subscription limits.

---

15. Problem

Merchants often manage commerce operations across multiple disconnected tools.

Typical problems include:

- Customer conversations are distributed across platforms.
- Product information is duplicated.
- Orders are manually tracked.
- Customer information is difficult to organize.
- AI tools are disconnected from actual commerce operations.
- Merchants need to switch between multiple systems.
- Website chat and external communication are disconnected from merchant operational data.

The MVP addresses this by providing one Workflow-centered environment for commerce and customer communication.

---

16. MVP Goals

The MVP must allow a merchant to:

1. Create an Account.
2. Create one or more Workflows according to Subscription limits.
3. Invite and manage Account members.
4. Assign roles and permissions.
5. Control member access to Workflows.
6. Manage products inside a Workflow.
7. Manage customers inside a Workflow.
8. Receive and manage customer conversations.
9. Respond manually.
10. Optionally use AI for customer communication.
11. Capture purchase intent.
12. Create and manage orders.
13. Support physical and digital products.
14. Publish product pages.
15. Embed a customer chat widget on an external website.
16. Connect supported platforms to a Workflow.
17. Use Telegram as an AI-powered merchant control interface.
18. Keep all Workflow data isolated.

---

17. MVP Non-Goals

The MVP does not attempt to provide:

- A complete website builder
- A full page/component editor
- A marketplace
- Advanced warehouse management
- Advanced shipping infrastructure
- Automatic digital-product delivery
- Complex CRM automation
- Advanced workflow automation
- A complete AI billing platform
- A large-scale plugin marketplace
- Arbitrary user-created plugins
- Complex distributed infrastructure
- An advanced analytics platform
- Multi-level enterprise organization management

These may be considered later.

---

18. Target User

The primary user is a merchant who sells physical or digital products and communicates with customers through online channels.

The merchant may:

- Sell through social platforms
- Own an external website
- Use direct customer communication
- Need AI assistance
- Need centralized order management
- Manage multiple businesses or commerce environments
- Have multiple employees or operators

---

19. Product Management

Each Workflow can manage products.

A product may be:

- Physical
- Digital

Minimum product information should support:

- Name
- Description
- Price
- Product type
- Status
- Images where applicable
- Product identifier
- Availability information where applicable

The exact product schema may evolve during implementation.

---

20. Physical Products

For physical products, the MVP focuses on:

«Cash on Delivery / customer information collection.»

The platform does not need to implement a complete online payment system in the MVP.

A customer can:

1. View a product.
2. Ask questions.
3. Express purchase intent.
4. Provide required information.
5. Create an order.
6. Allow the merchant to process the order.

---

21. Digital Products

Digital products are supported at the product and order-intent level.

The MVP does not automatically deliver digital files or licenses.

The flow is:

Customer
   ↓
Views Digital Product
   ↓
Asks Questions
   ↓
Expresses Purchase Intent
   ↓
Merchant Confirms
   ↓
Merchant Completes Delivery

Automatic digital delivery can be introduced later.

---

22. Customer Management

Customers belong to a Workflow.

A customer can originate from:

- Website chat
- Connected platform
- Product page
- Manual merchant interaction
- Other supported integrations

The system may initially represent an unknown visitor as a temporary/guest customer.

A guest can later become a permanent customer.

Customer deduplication should use available identifiers such as:

- Phone
- Email

The system should avoid unnecessary duplicate customer records where reliable identifying information exists.

---

23. Conversations

Conversations are a core capability.

A conversation belongs to:

- One Workflow
- One customer
- Optionally one integration/channel

A conversation can be handled by:

- Human
- AI
- Human + AI

The merchant must be able to view conversations and respond manually.

---

24. AI-Assisted Communication

AI is an optional capability.

AI may:

- Answer customer questions
- Explain products
- Assist with purchase conversations
- Collect required customer information
- Assist in creating purchase intent
- Help merchants manage conversations

AI must operate within the Workflow context.

AI must never access data belonging to another Workflow.

---

25. AI as a Plugin

AI is treated as an optional capability.

The platform must remain functional without AI.

When AI is enabled:

Conversation
      ↓
AI Capability
      ↓
Workflow Context
      ↓
Product / Customer / Order Data
      ↓
AI Response

The AI implementation must remain replaceable.

The Core business model must not depend on a specific AI provider.

---

26. AI Cost Awareness

AI requests may create external provider costs.

The MVP does not require a complete billing and metering platform.

However, the architecture should allow AI usage information to be recorded.

Usage records should support future capabilities such as:

- Usage limits
- Cost estimation
- Subscription-based AI quotas
- Provider comparison
- Usage analytics

The MVP should not introduce a complex billing subsystem solely for this purpose.

---

27. Human Handoff

The merchant must be able to take over a conversation from AI.

Conceptually:

AI Handling
     ↓
Human Handoff
     ↓
Human Handling

AI must not prevent the merchant from manually controlling the conversation.

---

28. Orders

Orders belong to a Workflow.

An order should contain enough information to support MVP commerce operations.

Minimum information may include:

- Customer
- Products
- Quantities
- Total amount
- Order type
- Status
- Customer contact information
- Creation timestamp

Initial order statuses:

New
Processing
Completed
Cancelled

Order transitions should be enforced by the application layer.

---

29. Purchase Intent

Purchase intent is a central part of customer conversations.

Purchase intent can originate from:

- Product page
- Chat
- AI conversation
- Connected platform

The platform should convert relevant customer interactions into an order or order-related workflow without requiring a full checkout system.

---

30. Public Product Page

Each product may have a public product page.

The page allows a customer to:

- View product information
- View product images
- Ask questions
- Start a conversation
- Express purchase intent
- Provide required order information

A product page can be shared through a public URL.

Public product pages are enabled by default for MVP products but may be disabled.

The MVP does not include a full website builder.

---

31. Chat Widget

The platform provides an embeddable customer chat widget.

The merchant can place the widget on an external website.

The widget connects visitors to the correct Workflow.

The widget must support:

- Customer conversation
- Product context where applicable
- Customer identification
- Purchase conversations
- Human or AI responses

The widget should use Workflow-specific configuration.

Basic protection must include:

- Workflow identification
- Origin allowlisting where applicable
- Rate limiting
- Abuse protection

The widget must not expose internal platform credentials.

---

32. Merchant Dashboard

The dashboard is the main operational interface.

The merchant should be able to access:

Account
├── Subscription
├── Members
└── Workflows
     │
     ├── Overview
     ├── Products
     ├── Customers
     ├── Conversations
     ├── Orders
     ├── Integrations
     ├── AI
     ├── Chat
     └── Settings

The dashboard must always operate within the selected Workflow context for business operations.

---

33. Platform Integrations

Platforms connected by the merchant are attached to a Workflow.

A Workflow may connect supported platforms according to available integrations.

The integration layer should allow:

- Connecting a platform
- Disconnecting a platform
- Receiving supported events/messages
- Sending supported responses/actions
- Mapping external identities to Workflow data

External integrations must not become part of Core business logic.

---

34. Telegram Integration

Telegram is an MVP integration/plugin.

Its purpose is not limited to notifications.

Telegram can act as a merchant control interface.

The merchant may communicate with the platform through Telegram and use AI to perform authorized operations.

Examples:

"Show me today's orders."

"Add a new product."

"Change order #123 to processing."

"How many pending orders do I have?"

The execution flow is:

Telegram
   ↓
Telegram Plugin
   ↓
AI Capability
   ↓
Workflow Context
   ↓
Authorized Application Operation
   ↓
Platform

Telegram actions must respect:

- Account identity
- Account role
- Permissions
- Workflow access
- Workflow context
- Plugin permissions
- Application business rules

AI must not bypass application authorization.

---

35. Plugin Authorization

Plugins must not create independent authorization systems.

A plugin operation must resolve authorization through the platform's existing Account and Workflow permission model.

Example:

Telegram Request
      ↓
Identify Account Member
      ↓
Resolve Account Role
      ↓
Resolve Workflow Access
      ↓
Check Required Permission
      ↓
Execute Application Operation

The same rule applies to AI-assisted operations.

AI may interpret a request, but the final operation must be authorized by the Application layer.

---

36. Plugin Strategy

The product follows:

«Core + Modules + Plugins»

Not every feature should be a plugin.

Core / Modules

Essential business capabilities remain inside Core Modules:

- Account
- Workflow
- Products
- Customers
- Conversations
- Orders
- Authorization

Plugins

Optional or replaceable capabilities are implemented as Plugins.

Examples:

- AI provider capability
- Telegram integration
- Future communication channels
- Future external commerce integrations

Plugin architecture must not introduce unnecessary runtime overhead.

Only required plugins/capabilities should be resolved for a given operation.

The application must not scan or load every plugin for every request.

---

37. Authentication

Authentication may be provided by Clerk.

Authentication identifies the user.

Account membership determines whether the user belongs to an Account.

Authorization determines what the member can do.

The platform remains responsible for business authorization.

Authentication must not be treated as equivalent to authorization.

---

38. Multi-Tenancy

The system is multi-tenant at the Workflow level.

Every business resource must be associated with its owning Workflow.

Examples:

Product       → Workflow
Customer      → Workflow
Conversation  → Workflow
Order         → Workflow
Integration   → Workflow
AI Config     → Workflow
Chat Config   → Workflow

Account-level resources include:

Subscription
Members
Roles
Permissions
Workflows

Workflow isolation must be enforced through application and data-access rules.

---

39. Workflow Isolation

Data belonging to Workflow A must never be accessible through Workflow B.

Isolation applies to:

- Products
- Customers
- Conversations
- Orders
- Integrations
- AI configuration
- Chat configuration
- Public product pages
- Workflow settings

An authenticated Account member must still be denied access to Workflows they are not authorized to access.

---

40. Data Ownership

Persistent business data must have a clear source of truth.

The primary database is responsible for durable business state.

Examples include:

- Accounts
- Subscriptions
- Members
- Roles/permissions
- Workflows
- Products
- Customers
- Conversations
- Orders
- Integrations
- AI usage records

Redis may be used for:

- Cache
- Ephemeral state
- Rate limiting
- Coordination

Redis must not be the only source of authoritative business data.

A Redis failure must not corrupt business truth.

---

41. Asynchronous Operations

Long-running or asynchronous work may use Vercel Queues.

Examples include:

- AI processing
- External integration processing
- Background synchronization
- Non-critical asynchronous operations

Application-level job contracts must define:

- Job input
- Idempotency behavior
- Failure behavior
- Timeout behavior

Side-effecting jobs should tolerate retries.

The MVP should avoid introducing additional distributed infrastructure unless required.

---

42. Technical Architecture Boundary

The MVP architecture follows:

Presentation
      ↓
Application
      ↓
Domain
      ↓
Ports
      ↓
Adapters
      ↓
Infrastructure

Infrastructure may include:

- Next.js
- Clerk
- Neon/PostgreSQL
- Redis
- Vercel Queues
- AI providers
- External APIs

Business logic must not directly depend on infrastructure providers.

Provider-specific implementations belong behind appropriate adapters or plugins.

---

43. Account Authorization Boundary

Account authorization belongs in the Application layer.

The authorization system is responsible for:

- Account membership
- Roles
- Permissions
- Workflow access
- Resource authorization
- Plugin authorization
- Merchant action authorization

The conceptual model is:

Identity
   ↓
Account Membership
   ↓
Role / Permissions
   ↓
Workflow Access
   ↓
Resource
   ↓
Operation

Infrastructure authentication providers may establish identity, but they must not become the source of business authorization rules.

---

44. Performance Principles

Performance is important, but the MVP must avoid premature optimization.

Requirements:

- Do not load unnecessary plugins.
- Avoid unnecessary database queries.
- Use caching where it provides measurable value.
- Keep request paths simple.
- Use asynchronous processing for appropriate long-running operations.
- Avoid distributed systems unless justified.
- Avoid loading all integrations or capabilities on every request.

The system should optimize for:

«Simple architecture + predictable performance + low operational cost.»

---

45. Security

The MVP must protect:

- Account data
- Workflow data
- Customer data
- Integration credentials
- AI provider credentials
- Merchant actions

Requirements include:

- Authentication
- Account membership validation
- Role and permission validation
- Workflow authorization
- Tenant isolation
- Secret management
- Plugin permissions
- Rate limiting where required
- Protection of public endpoints
- Auditability for sensitive merchant operations

Credentials must never be hardcoded into application code.

---

46. Main User Flows

46.1 New Merchant

Create Account
      ↓
Create Workflow
      ↓
Configure Workflow
      ↓
Add Products
      ↓
Connect Platform
      ↓
Enable Chat / AI if desired
      ↓
Invite Members if needed
      ↓
Start Selling

46.2 Add Team Member

Account Owner/Admin
        ↓
Invite Member
        ↓
Member Accepts
        ↓
Assign Role
        ↓
Grant Workflow Access
        ↓
Member Operates Within Permissions

46.3 Customer Purchase

Customer
   ↓
Product Page / Platform / Chat
   ↓
Questions
   ↓
Purchase Intent
   ↓
Customer Information
   ↓
Order
   ↓
Merchant Processing

46.4 AI Conversation

Customer Message
      ↓
Conversation
      ↓
AI Capability
      ↓
Workflow Context
      ↓
Product / Customer Information
      ↓
AI Response

46.5 Human Handoff

Customer
   ↓
AI
   ↓
Merchant Takes Over
   ↓
Human Response

46.6 Telegram Merchant Control

Merchant
   ↓
Telegram
   ↓
Telegram Plugin
   ↓
AI
   ↓
Authorization
   ↓
Application Operation
   ↓
Workflow

---

47. MVP Success Criteria

The MVP is successful when a merchant can complete:

Account
  ↓
Workflow
  ↓
Product
  ↓
Customer
  ↓
Conversation
  ↓
Purchase Intent
  ↓
Order
  ↓
Merchant Processing

Additionally:

- Multiple Workflows can be supported according to Subscription limits.
- Multiple members can operate an Account.
- Roles and permissions control member capabilities.
- Workflow access is independently controlled.
- Workflow data remains isolated.
- AI can be enabled without coupling Core to a provider.
- Telegram can operate as a merchant control interface.
- Customers can interact through public product pages and Chat Widget.
- The platform remains usable without AI.
- External integrations can be added without modifying Core business rules.

---

48. MVP Quality Requirements

Critical business behavior must have automated tests.

Important areas include:

- Account authorization
- Role assignment
- Permission enforcement
- Workflow access
- Workflow isolation
- Product operations
- Customer operations
- Conversation behavior
- Order creation
- Order state transitions
- Plugin permissions
- AI capability boundaries
- Telegram actions
- Job idempotency
- Public product access
- Subscription Workflow limits

Critical external contracts should have contract tests where appropriate.

---

49. Observability

The MVP should provide sufficient observability to diagnose:

- Failed requests
- Failed jobs
- Integration failures
- AI failures
- Authorization failures
- Permission failures
- Plugin failures
- Order-processing failures

Logging should avoid exposing secrets or sensitive customer information unnecessarily.

The system should favor structured logs and useful operational signals over an unnecessarily complex observability stack.

---

50. MVP Architecture Constraints

The MVP must not introduce infrastructure solely because it may become useful at larger scale.

Do not introduce prematurely:

- Kafka
- Complex event-driven architecture
- Microservices
- Service mesh
- Distributed locks
- Complex workflow engines
- Dedicated plugin servers
- Advanced billing infrastructure
- Full event sourcing
- Complex CQRS
- Multiple databases without a concrete requirement

The architecture must remain capable of evolving without implementing future complexity prematurely.

---

51. Product Boundaries

The MVP has four major product layers:

Account Layer
    ↓
Workflow Layer
    ↓
Commerce & Communication Core
    ↓
Plugins / Integrations

Account Layer

Responsible for:

- Identity
- Subscription
- Members
- Roles
- Permissions
- Workflow limits
- Workflow access

Workflow Layer

Responsible for:

- Business environment
- Isolation
- Context

Core

Responsible for:

- Products
- Customers
- Conversations
- Orders

Plugins

Responsible for:

- AI
- Telegram
- External platforms
- Future integrations

---

52. Future Extension Direction

The architecture should allow future capabilities such as:

- More communication channels
- More AI providers
- Automatic digital delivery
- Online payments
- Advanced shipping
- Website builder
- Advanced analytics
- Marketing automation
- Additional commerce integrations
- Plugin marketplace
- More advanced team permission models

These are not MVP requirements.

Future features must not force the MVP to implement their infrastructure prematurely.

---

53. Spec Kit Requirements

The PRD is intended to be used with Spec Kit.

Specifications should preserve the following hierarchy:

Account
   │
   ├── Subscription
   ├── Members
   │    ├── Roles
   │    └── Permissions
   │
   └── Workflows
         │
         ├── Core Modules
         └── Plugins / Integrations

For each feature, the specification should explicitly identify:

- Account ownership
- Workflow ownership
- Data ownership
- Source of truth
- Application boundary
- Module or Plugin classification
- Required permissions
- Workflow access requirements
- External dependencies
- Async behavior where applicable
- Failure behavior
- Required tests

Implementation should not introduce infrastructure or abstractions that are not justified by the feature.

---

54. MVP Definition of Done

The MVP is considered functionally complete when:

Account

- An Account can be created.
- A Subscription can be associated with an Account.
- Subscription limits are enforced.
- Members can be added.
- Members can be removed.
- Roles can be assigned.
- Permissions can be enforced.
- Workflow access can be controlled.

Workflow

- A Workflow can be created.
- Multiple Workflows can be created when permitted.
- Workflow data is isolated.
- Members can access only authorized Workflows.

Commerce

- Products can be created and managed.
- Customers can be created and managed.
- Conversations can be created and managed.
- Human responses work.
- AI can optionally process conversations.
- Purchase intent can become an order.
- Physical products support COD/order-information collection.
- Digital products support purchase intent without automatic delivery.
- Orders can be processed through defined statuses.

Customer Experience

- Public product pages work.
- Chat Widget works.
- Customers can communicate with merchants.
- Customer information can be captured.

Integrations

- Supported integrations can connect to a Workflow.
- Telegram can perform authorized merchant operations through AI.
- Plugins respect Account and Workflow permissions.

Architecture

- Core business logic is independent from infrastructure providers.
- Critical functionality is tested.
- Async jobs behave correctly under retries/failures.
- Workflow isolation is enforced.
- Authorization cannot be bypassed through resource identifiers.

---

55. Final Product Principle

The MVP is not intended to be the most feature-rich commerce platform.

It is intended to establish a strong foundation around:

«Workflow-centered commerce + customer communication + optional AI + extensible integrations + controlled team access.»

The architecture should remain:

- Simple
- Modular
- Replaceable
- Tenant-safe
- Permission-aware
- Performance-conscious
- Cost-conscious
- Easy to evolve

The Core should remain stable.

Plugins should provide optional and replaceable capabilities.

The Account should control identity, subscription, membership, and access.

The Workflow should remain the boundary around merchant business activity.

Account owns the subscription and team.
Workflow owns the business.
Permissions control who can operate it.
