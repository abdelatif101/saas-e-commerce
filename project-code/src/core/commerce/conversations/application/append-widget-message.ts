import type { Conversation } from "@/core/commerce/conversations/domain/conversation";
import type { Customer } from "@/core/commerce/customers/domain/customer";
import type { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";

export interface WidgetMessage {
  id: string;
  conversationId: string;
  sender: "customer" | "merchant" | "ai";
  content: string;
  createdAt: Date;
}

export interface AppendWidgetMessageInput {
  conversation: Conversation;
  customer: Customer;
  widgetConfiguration: ChatWidgetConfiguration;
  origin: string;
  content: string;
  identity?: { name?: string; email?: string; phone?: string };
}

export interface AppendWidgetMessageResult {
  message: WidgetMessage;
  currentHandler: "human" | "ai";
  customer: Customer;
}

export function appendWidgetMessage(
  input: AppendWidgetMessageInput
): AppendWidgetMessageResult {
  if (!input.widgetConfiguration.isOriginAllowed(input.origin)) {
    throw new Error("Origin not allowed");
  }

  if (input.conversation.workflowId !== input.customer.workflowId) {
    throw new Error("Conversation and customer must belong to the same workflow");
  }

  if (input.identity) {
    input.customer.promoteToIdentified(input.identity);
  }

  const message: WidgetMessage = {
    id: crypto.randomUUID(),
    conversationId: input.conversation.id,
    sender: "customer",
    content: input.content,
    createdAt: new Date(),
  };

  input.conversation.lastMessageAt = new Date();

  return {
    message,
    currentHandler: input.conversation.currentHandler,
    customer: input.customer,
  };
}
