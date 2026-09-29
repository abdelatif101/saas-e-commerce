import { Order, type OrderType } from "@/core/commerce/orders/domain/order";
import { OrderItem } from "@/core/commerce/orders/domain/order-item";
import type {
  ConversationId,
  CustomerId,
  OrderId,
  ProductId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export interface CreateOrderItemInput {
  id: string;
  productId: ProductId;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  id: OrderId;
  workflowId: WorkflowId;
  customerId: CustomerId;
  sourceConversationId?: ConversationId;
  orderType: OrderType;
  currency?: string;
  contactSnapshot?: Record<string, unknown>;
  items: CreateOrderItemInput[];
}

export function createOrder(input: CreateOrderInput): Order {
  if (!input.items || input.items.length === 0) {
    throw new Error("Order must include at least one line item");
  }

  const order = new Order({
    id: input.id,
    workflowId: input.workflowId,
    customerId: input.customerId,
    sourceConversationId: input.sourceConversationId,
    orderType: input.orderType,
    currency: input.currency,
    contactSnapshot: input.contactSnapshot,
  });

  for (const itemInput of input.items) {
    const item = new OrderItem({
      id: itemInput.id,
      orderId: order.id,
      productId: itemInput.productId,
      quantity: itemInput.quantity,
      unitPrice: itemInput.unitPrice,
    });
    order.addItem(item);
  }

  order.ensureHasItems();
  return order;
}
