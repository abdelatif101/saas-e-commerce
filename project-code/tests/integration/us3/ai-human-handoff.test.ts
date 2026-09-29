import { describe, expect, it } from "vitest";
import { AIConfiguration } from "@/core/workflow/domain/ai-configuration";
import { Conversation } from "@/core/commerce/conversations/domain/conversation";
import { Customer } from "@/core/commerce/customers/domain/customer";
import { assistConversation } from "@/plugins/ai/application/assist-conversation";
import { handoffToHuman } from "@/plugins/ai/application/handoff-to-human";
import type { ConversationId, CustomerId, WorkflowId } from "@/shared/contracts/core-types";

const workflowId = "wf_ai_1" as WorkflowId;

function makeConversation() {
  const customer = new Customer({
    id: "cust_ai_1" as CustomerId,
    workflowId,
    kind: "guest",
    sourceChannel: "widget",
  });

  const conversation = new Conversation({
    id: "conv_ai_1" as ConversationId,
    workflowId,
    customerId: customer.id,
    channel: "widget",
    currentHandler: "human",
  });

  return { customer, conversation };
}

describe("AI optional mode and human handoff", () => {
  it("manual conversation flow works when AI is disabled", () => {
    const { conversation, customer } = makeConversation();

    const aiConfig = new AIConfiguration({
      id: "ai_1",
      workflowId,
      enabled: false,
    });

    expect(aiConfig.isOperational()).toBe(false);
    expect(conversation.currentHandler).toBe("human");
    expect(customer.kind).toBe("guest");
  });

  it("AI assist updates conversation handler to ai", () => {
    const { conversation, customer } = makeConversation();

    const aiConfig = new AIConfiguration({
      id: "ai_2",
      workflowId,
      enabled: true,
      handoffPolicy: "ai_assist",
    });

    const result = assistConversation({
      aiConfiguration: aiConfig,
      conversation,
      customer,
      recentMessages: [{ sender: "customer", content: "What sizes do you have?" }],
    });

    expect(result.handler).toBe("ai");
    expect(conversation.currentHandler).toBe("ai");
  });

  it("human handoff is always available and overrides AI", () => {
    const { conversation, customer } = makeConversation();

    const aiConfig = new AIConfiguration({
      id: "ai_3",
      workflowId,
      enabled: true,
    });

    assistConversation({
      aiConfiguration: aiConfig,
      conversation,
      customer,
      recentMessages: [{ sender: "customer", content: "Help me" }],
    });

    expect(conversation.currentHandler).toBe("ai");

    const handoff = handoffToHuman({ conversation });

    expect(handoff.handler).toBe("human");
    expect(conversation.currentHandler).toBe("human");
    expect(conversation.status).toBe("handoff");
  });
});
