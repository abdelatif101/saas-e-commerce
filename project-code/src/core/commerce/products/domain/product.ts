import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { ProductId, WorkflowId } from "@/shared/contracts/core-types";

export type ProductType = "physical" | "digital";
export type ProductStatus = "draft" | "active" | "inactive";

export interface ProductProps {
  id: ProductId;
  workflowId: WorkflowId;
  type: ProductType;
  name: string;
  description?: string;
  priceAmount: number;
  currency?: string;
  status?: ProductStatus;
  publicPageEnabled?: boolean;
  availability?: "in_stock" | "out_of_stock" | "preorder";
}

export class Product {
  readonly id: ProductId;
  readonly workflowId: WorkflowId;
  readonly type: ProductType;
  readonly name: string;
  readonly description: string | undefined;
  readonly priceAmount: number;
  readonly currency: string;
  readonly status: ProductStatus;
  readonly publicPageEnabled: boolean;
  readonly availability: "in_stock" | "out_of_stock" | "preorder";

  constructor(props: ProductProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Product name is required");
    }
    if (!props.type) {
      throw new Error("Product type is required");
    }
    if (props.priceAmount === undefined || props.priceAmount < 0) {
      throw new Error("Product price is required");
    }
    if (!["physical", "digital"].includes(props.type)) {
      throw new Error("Product type must be physical or digital");
    }

    this.id = props.id;
    this.workflowId = props.workflowId;
    this.type = props.type;
    this.name = props.name.trim();
    this.description = props.description;
    this.priceAmount = props.priceAmount;
    this.currency = props.currency ?? "USD";
    this.status = props.status ?? "draft";
    this.publicPageEnabled = props.publicPageEnabled ?? false;
    this.availability = props.availability ?? "in_stock";
  }

  isPubliclyAvailable(): boolean {
    return (
      this.status === "active" &&
      this.publicPageEnabled &&
      DataModelConstraints.publicPageAvailability
    );
  }
}
