import type { CustomerId, ProductId, WorkflowId } from "@/shared/contracts/core-types";

export interface PurchaseIntentItem {
  productId: ProductId;
  quantity: number;
}

export interface PurchaseIntent {
  id: string;
  workflowId: WorkflowId;
  customerId: CustomerId;
  items: PurchaseIntentItem[];
  channelContext: string;
  contactSnapshot: Record<string, unknown>;
  createdAt: Date;
}

export interface CreatePurchaseIntentInput {
  id: string;
  workflowId: WorkflowId;
  customerId: CustomerId;
  items: PurchaseIntentItem[];
  channelContext?: string;
  contactSnapshot?: Record<string, unknown>;
}

export function createPurchaseIntent(
  input: CreatePurchaseIntentInput
): PurchaseIntent {
  if (!input.items || input.items.length === 0) {
    throw new Error("Purchase intent must contain at least one item");
  }
  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new Error("Purchase intent item quantity must be greater than 0");
    }
  }

  return {
    id: input.id,
    workflowId: input.workflowId,
    customerId: input.customerId,
    items: input.items,
    channelContext: input.channelContext ?? "dashboard",
    contactSnapshot: input.contactSnapshot ?? {},
    createdAt: new Date(),
  };
}
