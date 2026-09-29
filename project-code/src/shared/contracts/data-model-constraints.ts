/**
 * Shared data-model validation constants and invariant messages.
 *
 * These mirror the validation rules from the approved data-model.md.
 */

export const DataModelConstraints = {
  /** `maxWorkflows >= 1` */
  maxWorkflowsMin: 1,

  /** Workflow creation blocked when current active workflows reaches maxWorkflows */
  workflowLimitReachedMessage:
    "Workflow creation blocked when current active workflows reaches maxWorkflows",

  /** Cannot remove sole Owner without ownership transfer operation */
  soleOwnerRemovalMessage:
    "Cannot remove sole Owner without ownership transfer operation",

  /** Default roles exist for each account */
  defaultRolesRequired: true,

  /** Owner role includes owner-only capabilities */
  ownerRoleCapabilities: [
    "account.manage",
    "subscription.manage",
    "member.manage",
    "role.manage",
    "permission.manage",
    "workflow.access.grant",
    "audit.read",
  ] as const,

  /** Capability must be from allowed MVP capability set */
  capabilityMustBeMvp: true,

  /** Duplicate grants for same member+capability prevented */
  duplicateGrantPrevention: true,

  /** Created only if subscription capacity available */
  subscriptionCapacityRequired: true,

  /** Name required within account context */
  nameRequired: true,

  /** Member and workflow must belong to same account */
  memberWorkflowSameAccount: true,

  /** Access grant required before workflow resource operations */
  accessGrantRequired: true,

  /** Name, type, and price required for sellable products */
  productRequiredFields: ["name", "type", "price"] as const,

  /** Public page only accessible when product is active/public */
  publicPageAvailability: true,

  /** Deduplication uses reliable identifiers when present (phone/email) */
  customerDeduplicationIdentifiers: ["email", "phone"] as const,

  /** Guest can be promoted to identified customer */
  guestPromotionAllowed: true,

  /** Manual response path always available */
  manualResponseAlwaysAvailable: true,

  /** Handoff to human must be possible at all times */
  humanHandoffAlwaysAvailable: true,

  /** Must include at least one order line item */
  orderRequiresLineItem: true,

  /** Status transition rules enforced in application layer */
  orderStatusTransitionsInApplication: true,

  /** Quantity > 0 */
  orderItemQuantityMin: 1,

  /** Product must belong to same workflow as order */
  productSameWorkflowAsOrder: true,

  /** If enabled=false, manual conversation flow remains fully operational */
  aiDisabledManualOperational: true,

  /** Provider-specific secrets stored outside source code */
  secretsOutsideSourceCode: true,

  /** Plugin operations must map to account member identity and permissions */
  pluginMapsToMemberIdentity: true,

  /** Disconnected plugin cannot execute operations */
  disconnectedPluginCannotExecute: true,

  /** Widget requests must resolve target workflow safely */
  widgetWorkflowResolution: true,

  /** Internal credentials never exposed to clients */
  internalCredentialsNotExposed: true,

  /** Slug unique per workflow */
  slugUniquePerWorkflow: true,

  /** Disabled page returns not available state */
  disabledPageNotAvailable: true,

  /** Required for sensitive member/access/authorization and operational actions */
  auditRequiredForSensitiveActions: true,

  /** Must not store secrets in metadata */
  noSecretsInMetadata: true,
} as const;
