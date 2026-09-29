import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { Product } from "@/core/commerce/products/domain/product";
import type { PublicProductPage } from "@/core/workflow/domain/public-product-page";
import type { WorkflowId } from "@/shared/contracts/core-types";

export interface PublicProductPageInput {
  workflowId: WorkflowId;
  slug: string;
  product: Product;
  publicPage: PublicProductPage;
}

export interface PublicProductPagePresentation {
  workflowId: WorkflowId;
  slug: string;
  available: boolean;
  name: string;
  description: string | undefined;
  type: string;
  priceAmount: number;
  currency: string;
  availability: string;
}

export function getPublicProductPage(
  input: PublicProductPageInput
): PublicProductPagePresentation {
  const available =
    input.publicPage.isAvailable() &&
    input.product.isPubliclyAvailable() &&
    DataModelConstraints.publicPageAvailability;

  return {
    workflowId: input.workflowId,
    slug: input.publicPage.slug,
    available,
    name: input.product.name,
    description: input.product.description,
    type: input.product.type,
    priceAmount: input.product.priceAmount,
    currency: input.product.currency,
    availability: input.product.availability,
  };
}
