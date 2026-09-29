import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type {
  ConversationId,
  CustomerId,
  OrderId,
  WorkflowId,
} from "@/shared/contracts/core-types";
import { OrderItem } from "./order-item";

export type OrderType = "physical" | "digital";
export type OrderStatus = "New" | "Processing" | "Completed" | "Cancelled";

export interface OrderProps {
  id: OrderId;
  workflowId: WorkflowId;
  customerId: CustomerId;
  sourceConversationId?: ConversationId;
  orderType: OrderType;
  status?: OrderStatus;
  currency?: string;
  totalAmount?: number;
  contactSnapshot?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  readonly id: OrderId;
  readonly workflowId: WorkflowId;
  readonly customerId: CustomerId;
  readonly sourceConversationId: ConversationId | undefined;
  readonly orderType: OrderType;
  status: OrderStatus;
  readonly currency: string;
  totalAmount: number;
  readonly contactSnapshot: Record<string, unknown>;
  readonly createdAt: Date;
  updatedAt: Date;
  private _items: OrderItem[] = [];

  constructor(props: OrderProps) {
    if (!props.orderType) {
      throw new Error("Order type is required");
    }
    if (!["physical", "digital"].includes(props.orderType)) {
      throw new Error("Order type must be physical or digital");
    }

    this.id = props.id;
    this.workflowId = props.workflowId;
    this.customerId = props.customerId;
    this.sourceConversationId = props.sourceConversationId;
    this.orderType = props.orderType;
    this.status = props.status ?? "New";
    this.currency = props.currency ?? "USD";
    this.totalAmount = props.totalAmount ?? 0;
    this.contactSnapshot = props.contactSnapshot ?? {};
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  addItem(item: OrderItem): void {
    if (DataModelConstraints.productSameWorkflowAsOrder) {
      // Product workflow membership is enforced by application service using repositories.
      // Domain-level only validates that the item belongs to this order.
      if (item.orderId !== this.id) {
        throw new Error("Order item must belong to this order");
      }
    }
    this._items.push(item);
    this.recalculateTotal();
  }

  private recalculateTotal(): void {
    this.totalAmount = this._items.reduce((sum, item) => sum + item.lineTotal, 0);
    this.updatedAt = new Date();
  }

  ensureHasItems(): void {
    if (!DataModelConstraints.orderRequiresLineItem) return;
    if (this._items.length === 0) {
      throw new Error("Order must include at least one line item");
    }
  }

  transitionStatus(newStatus: OrderStatus): void {
    if (!isValidOrderTransition(this.status, newStatus)) {
      throw new Error(
        `Invalid order status transition from ${this.status} to ${newStatus}`
      );
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  New: ["Processing", "Cancelled"],
  Processing: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export function isValidOrderTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  if (!DataModelConstraints.orderStatusTransitionsInApplication) return true;
  if (from === to) return true;
  return VALID_TRANSITIONS[from].includes(to);
}
