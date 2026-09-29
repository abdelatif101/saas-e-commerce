import { Product } from "@/core/commerce/products/domain/product";
import { PublicProductPage } from "@/core/workflow/domain/public-product-page";
import { getPublicProductPage } from "@/core/commerce/products/application/get-public-product-page";
import { NextResponse } from "next/server";
import type { ProductId, WorkflowId } from "@/shared/contracts/core-types";

export async function GET(
  _request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { workflowRef, productSlug } = await context.params;

    // In a real implementation these would be loaded from repositories using
    // workflowRef and productSlug. For the MVP contract we construct the
    // presentation model from validated identifiers.
    const workflowId = workflowRef as WorkflowId;
    const productId = productSlug as ProductId;

    const product = new Product({
      id: productId,
      workflowId,
      type: "physical",
      name: "Public Product",
      priceAmount: 0,
      status: "active",
      publicPageEnabled: true,
      availability: "in_stock",
    });

    const publicPage = new PublicProductPage({
      id: crypto.randomUUID(),
      workflowId,
      productId,
      slug: productSlug,
      enabled: true,
      visibility: "public",
    });

    const presentation = getPublicProductPage({
      workflowId,
      slug: productSlug,
      product,
      publicPage,
    });

    return NextResponse.json({ product: presentation }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
