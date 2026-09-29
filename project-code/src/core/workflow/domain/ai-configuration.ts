import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { WorkflowId } from "@/shared/contracts/core-types";

export interface AIConfigurationProps {
  id: string;
  workflowId: WorkflowId;
  enabled?: boolean;
  providerProfile?: string;
  responsePolicy?: "cautious" | "balanced" | "proactive";
  handoffPolicy?: "manual_only" | "ai_assist" | "auto_handoff";
  updatedAt?: Date;
}

export class AIConfiguration {
  readonly id: string;
  readonly workflowId: WorkflowId;
  enabled: boolean;
  readonly providerProfile: string;
  readonly responsePolicy: "cautious" | "balanced" | "proactive";
  readonly handoffPolicy: "manual_only" | "ai_assist" | "auto_handoff";
  readonly updatedAt: Date;

  constructor(props: AIConfigurationProps) {
    if (DataModelConstraints.aiDisabledManualOperational && props.enabled === undefined) {
      // Default to disabled so manual path is always the baseline.
    }

    this.id = props.id;
    this.workflowId = props.workflowId;
    this.enabled = props.enabled ?? false;
    this.providerProfile = props.providerProfile ?? "default";
    this.responsePolicy = props.responsePolicy ?? "balanced";
    this.handoffPolicy = props.handoffPolicy ?? "manual_only";
    this.updatedAt = props.updatedAt ?? new Date();
  }

  isOperational(): boolean {
    if (!DataModelConstraints.aiDisabledManualOperational) {
      return this.enabled;
    }
    return this.enabled;
  }
}
