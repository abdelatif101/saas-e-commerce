import type { AIConfiguration } from "@/core/workflow/domain/ai-configuration";
import type { Conversation } from "@/core/commerce/conversations/domain/conversation";
import type { Customer } from "@/core/commerce/customers/domain/customer";

export interface AIAssistResult {
  response: string;
  confidence: number;
  handler: "ai";
}

export interface AssistConversationInput {
  aiConfiguration: AIConfiguration;
  conversation: Conversation;
  customer: Customer;
  recentMessages: { sender: "customer" | "merchant" | "ai"; content: string }[];
}

export function assistConversation(
  input: AssistConversationInput
): AIAssistResult {
  if (!input.aiConfiguration.isOperational()) {
    throw new Error("AI is not enabled for this workflow");
  }

  if (input.conversation.workflowId !== input.customer.workflowId) {
    throw new Error("Conversation and customer must belong to the same workflow");
  }

  input.conversation.assignToAi();

  const lastCustomerMessage = [...input.recentMessages]
    .reverse()
    .find((m) => m.sender === "customer");

  return {
    response: lastCustomerMessage
      ? `AI assist: acknowledged "${lastCustomerMessage.content}"`
      : "AI assist: ready to help",
    confidence: 0.85,
    handler: "ai",
  };
}
