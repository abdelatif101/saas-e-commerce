import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type {
  AccountId,
  MemberId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export type AccessLevel = "read" | "write" | "admin";

export interface WorkflowAccessGrantProps {
  id: string;
  accountId: AccountId;
  workflowId: WorkflowId;
  memberId: MemberId;
  accessLevel?: AccessLevel;
  grantedByMemberId: MemberId;
  grantedAt?: Date;
}

export class WorkflowAccessGrant {
  readonly id: string;
  readonly accountId: AccountId;
  readonly workflowId: WorkflowId;
  readonly memberId: MemberId;
  readonly accessLevel: AccessLevel;
  readonly grantedByMemberId: MemberId;
  readonly grantedAt: Date;

  constructor(props: WorkflowAccessGrantProps) {
    if (
      DataModelConstraints.memberWorkflowSameAccount &&
      (!props.accountId || !props.workflowId || !props.memberId)
    ) {
      throw new Error("Member and workflow must belong to same account");
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.workflowId = props.workflowId;
    this.memberId = props.memberId;
    this.accessLevel = props.accessLevel ?? "write";
    this.grantedByMemberId = props.grantedByMemberId;
    this.grantedAt = props.grantedAt ?? new Date();
  }

  static uniqueKey(grant: { workflowId: WorkflowId; memberId: MemberId }): string {
    return `${grant.workflowId}:${grant.memberId}`;
  }
}
