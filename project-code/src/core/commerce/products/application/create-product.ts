import { Product } from "@/core/commerce/products/domain/product";
import type { ProductId, WorkflowId } from "@/shared/contracts/core-types";

export interface CreateProductInput {
  id: ProductId;
  workflowId: WorkflowId;
  type: "physical" | "digital";
  name: string;
  description?: string;
  priceAmount: number;
  currency?: string;
  status?: "draft" | "active" | "inactive";
  publicPageEnabled?: boolean;
  availability?: "in_stock" | "out_of_stock" | "preorder";
}

export function createProduct(input: CreateProductInput): Product {
  return new Product({
    id: input.id,
    workflowId: input.workflowId,
    type: input.type,
    name: input.name,
    description: input.description,
    priceAmount: input.priceAmount,
    currency: input.currency,
    status: input.status,
    publicPageEnabled: input.publicPageEnabled,
    availability: input.availability,
  });
}
