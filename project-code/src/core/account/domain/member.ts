import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export type MemberStatus = "invited" | "active" | "inactive";

export interface MemberProps {
  id: MemberId;
  accountId: AccountId;
  userIdentityRef: string;
  email: string;
  displayName?: string;
  roleId: string;
  status?: MemberStatus;
  invitedAt?: Date;
  joinedAt?: Date | null;
}

export class Member {
  readonly id: MemberId;
  readonly accountId: AccountId;
  readonly userIdentityRef: string;
  readonly email: string;
  readonly displayName: string | undefined;
  readonly roleId: string;
  readonly status: MemberStatus;
  readonly invitedAt: Date;
  readonly joinedAt: Date | null;

  constructor(props: MemberProps) {
    if (!props.userIdentityRef) {
      throw new Error("Member user identity reference is required");
    }
    if (!props.email) {
      throw new Error("Member email is required");
    }
    if (!props.roleId) {
      throw new Error("Member role is required");
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.userIdentityRef = props.userIdentityRef;
    this.email = props.email;
    this.displayName = props.displayName;
    this.roleId = props.roleId;
    this.status = props.status ?? "invited";
    this.invitedAt = props.invitedAt ?? new Date();
    this.joinedAt = props.joinedAt ?? null;
  }

  isActive(): boolean {
    return this.status === "active";
  }
}
