import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";
import type { Conversation } from "@/core/commerce/conversations/domain/conversation";
import type { Customer } from "@/core/commerce/customers/domain/customer";
import type { ConversationId, CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export interface WidgetSession {
  sessionToken: string;
  workflowId: WorkflowId;
  conversationId: ConversationId;
  customerId: CustomerId;
}

export interface StartWidgetSessionInput {
  workflowId: WorkflowId;
  origin: string;
  widgetConfiguration: ChatWidgetConfiguration;
  createCustomer: (input: { id: CustomerId; workflowId: WorkflowId }) => Customer;
  createConversation: (input: {
    id: ConversationId;
    workflowId: WorkflowId;
    customerId: CustomerId;
  }) => Conversation;
  generateSessionToken: () => string;
}

export function startWidgetSession(input: StartWidgetSessionInput): WidgetSession {
  if (DataModelConstraints.widgetWorkflowResolution && !input.widgetConfiguration.isOriginAllowed(input.origin)) {
    throw new Error("Origin not allowed");
  }

  if (!input.widgetConfiguration.enabled) {
    throw new Error("Widget is disabled");
  }

  const customer = input.createCustomer({
    id: crypto.randomUUID() as CustomerId,
    workflowId: input.workflowId,
  });

  const conversation = input.createConversation({
    id: crypto.randomUUID() as ConversationId,
    workflowId: input.workflowId,
    customerId: customer.id,
  });

  return {
    sessionToken: input.generateSessionToken(),
    workflowId: input.workflowId,
    conversationId: conversation.id,
    customerId: customer.id,
  };
}
