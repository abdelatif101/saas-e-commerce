import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export type MemberAuditAction =
  | "member.invited"
  | "member.role_assigned"
  | "member.permission_assigned"
  | "member.removed";

export interface MemberAuditEvent {
  id: string;
  accountId: AccountId;
  actorMemberId: MemberId;
  action: MemberAuditAction;
  targetMemberId: MemberId;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export function recordMemberAuditEvent(
  event: Omit<MemberAuditEvent, "timestamp">
): MemberAuditEvent {
  if (!DataModelConstraints.auditRequiredForSensitiveActions) {
    throw new Error("Audit is required for sensitive member actions");
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
