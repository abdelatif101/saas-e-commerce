import { appendWidgetMessage } from "@/core/commerce/conversations/application/append-widget-message";
import { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";
import { Conversation } from "@/core/commerce/conversations/domain/conversation";
import { Customer } from "@/core/commerce/customers/domain/customer";
import { NextResponse } from "next/server";
import type { ConversationId, CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { workflowRef, conversationId } = await context.params;
    const body = (await request.json()) as {
      origin?: string;
      content?: string;
      identity?: { name?: string; email?: string; phone?: string };
    };

    const workflowId = workflowRef as WorkflowId;
    const origin = body.origin ?? "https://example.com";

    const widgetConfiguration = new ChatWidgetConfiguration({
      id: crypto.randomUUID(),
      workflowId,
      enabled: true,
      allowedOrigins: [origin],
    });

    const customer = new Customer({
      id: crypto.randomUUID() as CustomerId,
      workflowId,
      kind: "guest",
      sourceChannel: "widget",
    });

    const conversation = new Conversation({
      id: conversationId as ConversationId,
      workflowId,
      customerId: customer.id,
      channel: "widget",
    });

    const result = appendWidgetMessage({
      conversation,
      customer,
      widgetConfiguration,
      origin,
      content: body.content ?? "",
      identity: body.identity,
    });

    return NextResponse.json(
      {
        message: {
          id: result.message.id,
          content: result.message.content,
          createdAt: result.message.createdAt,
        },
        currentHandler: result.currentHandler,
        customer: {
          id: result.customer.id,
          kind: result.customer.kind,
          email: result.customer.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Origin") ? 403 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
