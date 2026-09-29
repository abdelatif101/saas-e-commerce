import { createOrder } from "@/core/commerce/orders/application/create-order";
import { NextResponse } from "next/server";
import type { ConversationId, CustomerId, OrderId, ProductId, WorkflowId } from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { workflowId } = await context.params;
    const body = (await request.json()) as {
      customerId: string;
      sourceConversationId?: string;
      orderType: "physical" | "digital";
      currency?: string;
      contactSnapshot?: Record<string, unknown>;
      items: { id?: string; productId: string; quantity: number; unitPrice: number }[];
    };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must include at least one line item" },
        { status: 400 }
      );
    }

    const order = createOrder({
      id: crypto.randomUUID() as OrderId,
      workflowId: workflowId as WorkflowId,
      customerId: body.customerId as CustomerId,
      sourceConversationId: body.sourceConversationId as ConversationId,
      orderType: body.orderType,
      currency: body.currency,
      contactSnapshot: body.contactSnapshot,
      items: body.items.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        productId: item.productId as ProductId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          workflowId: order.workflowId,
          customerId: order.customerId,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
