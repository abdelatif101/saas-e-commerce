import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createPurchaseIntent } from "@/core/commerce/conversations/application/create-purchase-intent";
import { NextResponse } from "next/server";
import type {
  CustomerId,
  ProductId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { workflowId } = await context.params;
    const body = (await request.json()) as {
      customer?: { name?: string; email?: string; phone?: string };
      items?: { productId: string; quantity: number }[];
      channelContext?: string;
      contactSnapshot?: Record<string, unknown>;
    };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Purchase intent must contain at least one item" },
        { status: 400 }
      );
    }

    const customer = createCustomer({
      id: crypto.randomUUID() as CustomerId,
      workflowId: workflowId as WorkflowId,
      name: body.customer?.name,
      email: body.customer?.email,
      phone: body.customer?.phone,
      sourceChannel: "public_page",
    });

    const intent = createPurchaseIntent({
      id: crypto.randomUUID(),
      workflowId: workflowId as WorkflowId,
      customerId: customer.id,
      items: body.items.map((item) => ({
        productId: item.productId as ProductId,
        quantity: item.quantity,
      })),
      channelContext: body.channelContext,
      contactSnapshot: body.contactSnapshot,
    });

    return NextResponse.json(
      {
        intent: {
          id: intent.id,
          workflowId: intent.workflowId,
          customerId: intent.customerId,
          items: intent.items,
          channelContext: intent.channelContext,
          createdAt: intent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
