import { Member } from "@/core/account/domain/member";
import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export interface InviteMemberInput {
  id: MemberId;
  accountId: AccountId;
  email: string;
  displayName?: string;
  roleId: string;
  userIdentityRef?: string;
}

export interface AssignRoleInput {
  member: Member;
  newRoleId: string;
}

export interface RemoveMemberInput {
  member: Member;
  allAccountMembers: Member[];
  requesterIsOwner: boolean;
}

export function inviteMember(input: InviteMemberInput): Member {
  if (!input.email || input.email.trim().length === 0) {
    throw new Error("Member email is required");
  }
  if (!input.roleId) {
    throw new Error("Member role is required");
  }

  return new Member({
    id: input.id,
    accountId: input.accountId,
    userIdentityRef: input.userIdentityRef ?? `pending:${input.email}`,
    email: input.email,
    displayName: input.displayName,
    roleId: input.roleId,
    status: "invited",
  });
}

export function assignRole(input: AssignRoleInput): Member {
  return new Member({
    ...input.member,
    roleId: input.newRoleId,
  });
}

export function removeMember(input: RemoveMemberInput): void {
  const { member, allAccountMembers, requesterIsOwner } = input;

  if (member.roleId === "role_owner") {
    const owners = allAccountMembers.filter((m) => m.roleId === "role_owner");
    if (owners.length <= 1) {
      throw new Error(DataModelConstraints.soleOwnerRemovalMessage);
    }
  }

  if (!requesterIsOwner) {
    throw new Error("Only account owners can remove members");
  }
}
