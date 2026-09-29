import { Conversation } from "@/core/commerce/conversations/domain/conversation";
import type { ConversationId, CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export interface CreateConversationInput {
  id: ConversationId;
  workflowId: WorkflowId;
  customerId: CustomerId;
  channel?: "widget" | "public_page" | "telegram" | "dashboard";
  integrationRef?: string;
}

export function createConversation(
  input: CreateConversationInput
): Conversation {
  return new Conversation({
    id: input.id,
    workflowId: input.workflowId,
    customerId: input.customerId,
    channel: input.channel,
    integrationRef: input.integrationRef,
  });
}
