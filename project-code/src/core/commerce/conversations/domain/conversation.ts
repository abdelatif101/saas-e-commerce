import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { ConversationId, CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export type ConversationStatus = "open" | "closed" | "handoff";
export type ConversationHandler = "human" | "ai";
export type ConversationChannel = "widget" | "public_page" | "telegram" | "dashboard";

export interface ConversationProps {
  id: ConversationId;
  workflowId: WorkflowId;
  customerId: CustomerId;
  channel?: ConversationChannel;
  integrationRef?: string;
  status?: ConversationStatus;
  currentHandler?: ConversationHandler;
  startedAt?: Date;
  lastMessageAt?: Date;
}

export class Conversation {
  readonly id: ConversationId;
  readonly workflowId: WorkflowId;
  readonly customerId: CustomerId;
  readonly channel: ConversationChannel;
  readonly integrationRef: string | undefined;
  status: ConversationStatus;
  currentHandler: ConversationHandler;
  readonly startedAt: Date;
  lastMessageAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.workflowId = props.workflowId;
    this.customerId = props.customerId;
    this.channel = props.channel ?? "dashboard";
    this.integrationRef = props.integrationRef;
    this.status = props.status ?? "open";
    this.currentHandler = props.currentHandler ?? "human";
    this.startedAt = props.startedAt ?? new Date();
    this.lastMessageAt = props.lastMessageAt ?? new Date();
  }

  assignToAi(): void {
    if (!DataModelConstraints.manualResponseAlwaysAvailable) {
      throw new Error("Manual response path is required");
    }
    this.currentHandler = "ai";
  }

  handoffToHuman(): void {
    if (!DataModelConstraints.humanHandoffAlwaysAvailable) {
      throw new Error("Human handoff is required");
    }
    this.currentHandler = "human";
    this.status = "handoff";
  }
}
