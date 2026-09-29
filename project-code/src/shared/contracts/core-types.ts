export type AccountId = string & { readonly __brand: "AccountId" };
export type WorkflowId = string & { readonly __brand: "WorkflowId" };
export type MemberId = string & { readonly __brand: "MemberId" };
export type RoleId = string & { readonly __brand: "RoleId" };
export type PermissionGrantId = string & { readonly __brand: "PermissionGrantId" };
export type WorkflowAccessGrantId = string & { readonly __brand: "WorkflowAccessGrantId" };
export type ProductId = string & { readonly __brand: "ProductId" };
export type CustomerId = string & { readonly __brand: "CustomerId" };
export type ConversationId = string & { readonly __brand: "ConversationId" };
export type OrderId = string & { readonly __brand: "OrderId" };
export type AuditEventId = string & { readonly __brand: "AuditEventId" };
export type PluginId = string & { readonly __brand: "PluginId" };
export type JobId = string & { readonly __brand: "JobId" };

export type Permission = Capability;

export type RoleName = "Owner" | "Admin" | "Member";

export const MVP_CAPABILITIES = [
  "account.manage",
  "subscription.manage",
  "member.manage",
  "role.manage",
  "permission.manage",
  "workflow.manage",
  "workflow.access.grant",
  "product.manage",
  "customer.manage",
  "conversation.manage",
  "order.manage",
  "integration.manage",
  "ai.manage",
  "ai.assist",
  "chat.widget.manage",
  "public.page.manage",
  "audit.read",
] as const;

export type Capability = (typeof MVP_CAPABILITIES)[number];

export function isValidCapability(value: string): value is Capability {
  return (MVP_CAPABILITIES as readonly string[]).includes(value);
}

export function createBrand<T extends string>(value: string): T {
  return value as T;
}
