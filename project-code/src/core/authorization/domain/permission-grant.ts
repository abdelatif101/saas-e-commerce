import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import {
  isValidCapability,
  type AccountId,
  type Capability,
  type MemberId,
} from "@/shared/contracts/core-types";

export interface PermissionGrantProps {
  id: string;
  accountId: AccountId;
  memberId: MemberId;
  capability: Capability;
  effect?: "allow";
  createdAt?: Date;
}

export class PermissionGrant {
  readonly id: string;
  readonly accountId: AccountId;
  readonly memberId: MemberId;
  readonly capability: Capability;
  readonly effect: "allow";
  readonly createdAt: Date;

  constructor(props: PermissionGrantProps) {
    if (DataModelConstraints.capabilityMustBeMvp && !isValidCapability(props.capability)) {
      throw new Error("Capability must be from allowed MVP capability set");
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.memberId = props.memberId;
    this.capability = props.capability;
    this.effect = props.effect ?? "allow";
    this.createdAt = props.createdAt ?? new Date();
  }

  static uniqueKey(grant: { memberId: MemberId; capability: Capability }): string {
    return `${grant.memberId}:${grant.capability}`;
  }
}
