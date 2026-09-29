import { WorkflowAccessGrant } from "@/core/workflow/domain/workflow-access-grant";
import type { AccountId, MemberId, WorkflowId } from "@/shared/contracts/core-types";

export interface GrantWorkflowAccessInput {
  id: string;
  accountId: AccountId;
  workflowId: WorkflowId;
  memberId: MemberId;
  accessLevel?: "read" | "write" | "admin";
  grantedByMemberId: MemberId;
}

export interface RevokeWorkflowAccessInput {
  grant: WorkflowAccessGrant;
  revokedByMemberId: MemberId;
}

export function grantWorkflowAccess(
  input: GrantWorkflowAccessInput
): WorkflowAccessGrant {
  return new WorkflowAccessGrant({
    id: input.id,
    accountId: input.accountId,
    workflowId: input.workflowId,
    memberId: input.memberId,
    accessLevel: input.accessLevel,
    grantedByMemberId: input.grantedByMemberId,
  });
}

export function revokeWorkflowAccess(
  input: RevokeWorkflowAccessInput
): WorkflowAccessGrant {
  return new WorkflowAccessGrant({
    ...input.grant,
    grantedByMemberId: input.revokedByMemberId,
  });
}
