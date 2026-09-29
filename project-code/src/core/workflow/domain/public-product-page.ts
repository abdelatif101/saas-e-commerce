import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { ProductId, WorkflowId } from "@/shared/contracts/core-types";

export type PublicProductPageVisibility = "public" | "unlisted" | "private";

export interface PublicProductPageProps {
  id: string;
  workflowId: WorkflowId;
  productId: ProductId;
  slug: string;
  enabled?: boolean;
  visibility?: PublicProductPageVisibility;
  updatedAt?: Date;
}

export class PublicProductPage {
  readonly id: string;
  readonly workflowId: WorkflowId;
  readonly productId: ProductId;
  readonly slug: string;
  enabled: boolean;
  readonly visibility: PublicProductPageVisibility;
  readonly updatedAt: Date;

  constructor(props: PublicProductPageProps) {
    if (!props.slug || props.slug.trim().length === 0) {
      throw new Error("Slug is required");
    }

    this.id = props.id;
    this.workflowId = props.workflowId;
    this.productId = props.productId;
    this.slug = props.slug.trim();
    this.enabled = props.enabled ?? false;
    this.visibility = props.visibility ?? "public";
    this.updatedAt = props.updatedAt ?? new Date();
  }

  isAvailable(): boolean {
    if (DataModelConstraints.disabledPageNotAvailable && !this.enabled) {
      return false;
    }
    return this.enabled && this.visibility === "public";
  }
}
