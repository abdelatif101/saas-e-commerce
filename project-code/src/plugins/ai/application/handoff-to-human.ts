import type { Conversation } from "@/core/commerce/conversations/domain/conversation";

export interface HandoffToHumanResult {
  handler: "human";
  handoffAt: Date;
}

export interface HandoffToHumanInput {
  conversation: Conversation;
}

export function handoffToHuman(input: HandoffToHumanInput): HandoffToHumanResult {
  input.conversation.handoffToHuman();

  return {
    handler: "human",
    handoffAt: new Date(),
  };
}
