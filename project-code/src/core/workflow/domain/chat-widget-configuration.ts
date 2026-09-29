import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { WorkflowId } from "@/shared/contracts/core-types";

export interface RateLimitProfile {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
}

export interface ChatWidgetConfigurationProps {
  id: string;
  workflowId: WorkflowId;
  enabled?: boolean;
  allowedOrigins?: string[];
  rateLimitProfile?: RateLimitProfile;
  branding?: Record<string, unknown>;
  updatedAt?: Date;
}

export class ChatWidgetConfiguration {
  readonly id: string;
  readonly workflowId: WorkflowId;
  enabled: boolean;
  readonly allowedOrigins: readonly string[];
  readonly rateLimitProfile: RateLimitProfile;
  readonly branding: Record<string, unknown>;
  readonly updatedAt: Date;

  constructor(props: ChatWidgetConfigurationProps) {
    this.id = props.id;
    this.workflowId = props.workflowId;
    this.enabled = props.enabled ?? true;
    this.allowedOrigins = props.allowedOrigins ?? [];
    this.rateLimitProfile = props.rateLimitProfile ?? {
      maxRequestsPerMinute: 30,
      maxRequestsPerHour: 300,
    };
    this.branding = props.branding ?? {};
    this.updatedAt = props.updatedAt ?? new Date();
  }

  isOriginAllowed(origin: string): boolean {
    if (DataModelConstraints.widgetWorkflowResolution && this.allowedOrigins.length === 0) {
      return true;
    }
    return this.allowedOrigins.includes(origin);
  }
}
