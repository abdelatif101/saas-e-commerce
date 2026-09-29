import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { OrderId, ProductId } from "@/shared/contracts/core-types";

export interface OrderItemProps {
  id: string;
  orderId: OrderId;
  productId: ProductId;
  quantity: number;
  unitPrice: number;
}

export class OrderItem {
  readonly id: string;
  readonly orderId: OrderId;
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;

  constructor(props: OrderItemProps) {
    if (props.quantity < DataModelConstraints.orderItemQuantityMin) {
      throw new Error("Quantity must be greater than 0");
    }
    if (props.unitPrice < 0) {
      throw new Error("Unit price cannot be negative");
    }

    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.lineTotal = this.quantity * this.unitPrice;
  }
}
