import { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";
import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createConversation } from "@/core/commerce/conversations/application/create-conversation";
import { startWidgetSession } from "@/core/commerce/conversations/application/start-widget-session";
import { NextResponse } from "next/server";
import type { WorkflowId } from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { workflowRef } = await context.params;
    const body = (await request.json()) as {
      origin?: string;
      visitorMetadata?: Record<string, unknown>;
      productContext?: Record<string, unknown>;
    };

    const workflowId = workflowRef as WorkflowId;
    const origin = body.origin ?? "https://example.com";

    const widgetConfiguration = new ChatWidgetConfiguration({
      id: crypto.randomUUID(),
      workflowId,
      enabled: true,
      allowedOrigins: [origin],
    });

    const session = startWidgetSession({
      workflowId,
      origin,
      widgetConfiguration,
      createCustomer: (input) =>
        createCustomer({
          id: input.id,
          workflowId: input.workflowId,
          kind: "guest",
          sourceChannel: "widget",
        }),
      createConversation: (input) =>
        createConversation({
          id: input.id,
          workflowId: input.workflowId,
          customerId: input.customerId,
          channel: "widget",
        }),
      generateSessionToken: () => crypto.randomUUID(),
    });

    return NextResponse.json(
      {
        sessionToken: session.sessionToken,
        workflowId: session.workflowId,
        conversationId: session.conversationId,
        customerId: session.customerId,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Origin") ? 403 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
