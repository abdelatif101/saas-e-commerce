import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, MemberId, WorkflowId } from "@/shared/contracts/core-types";

export type WorkflowAccessAuditAction =
  | "workflow.access.granted"
  | "workflow.access.revoked";

export interface WorkflowAccessAuditEvent {
  id: string;
  accountId: AccountId;
  workflowId?: WorkflowId;
  actorMemberId: MemberId;
  action: WorkflowAccessAuditAction;
  targetMemberId: MemberId;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export function recordWorkflowAccessAuditEvent(
  event: Omit<WorkflowAccessAuditEvent, "timestamp">
): WorkflowAccessAuditEvent {
  if (!DataModelConstraints.auditRequiredForSensitiveActions) {
    throw new Error("Audit is required for sensitive access actions");
  }

  if (DataModelConstraints.noSecretsInMetadata) {
    for (const [key, value] of Object.entries(event.metadata)) {
      const valueString = typeof value === "string" ? value : JSON.stringify(value);
      if (
        /password|secret|token|key|credential|private/i.test(key) ||
        /password|secret|token|key|credential|private/i.test(valueString)
      ) {
        throw new Error("Must not store secrets in metadata");
      }
    }
  }

  return {
    ...event,
    timestamp: new Date(),
  };
}
