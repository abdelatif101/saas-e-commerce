import { Account } from "@/core/account/domain/account";
import { Member } from "@/core/account/domain/member";
import { Role } from "@/core/account/domain/role";
import { Subscription } from "@/core/account/domain/subscription";
import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export interface CreateAccountInput {
  id: AccountId;
  name: string;
  ownerIdentityRef: string;
  ownerEmail: string;
  ownerMemberId: MemberId;
  subscriptionId: string;
  maxWorkflows?: number;
}

export interface CreateAccountResult {
  account: Account;
  subscription: Subscription;
  ownerRole: Role;
  ownerMember: Member;
}

export function createAccount(input: CreateAccountInput): CreateAccountResult {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error(DataModelConstraints.nameRequired ? "Account name is required" : "Account name is required");
  }

  const account = new Account({
    id: input.id,
    name: input.name,
  });

  const subscription = new Subscription({
    id: input.subscriptionId,
    accountId: account.id,
    maxWorkflows: input.maxWorkflows ?? 1,
  });

  const ownerRole = new Role({
    id: Role.ownerRoleId(),
    accountId: account.id,
    name: "Owner",
  });

  const ownerMember = new Member({
    id: input.ownerMemberId,
    accountId: account.id,
    userIdentityRef: input.ownerIdentityRef,
    email: input.ownerEmail,
    roleId: ownerRole.id,
    status: "active",
    joinedAt: new Date(),
  });

  return {
    account,
    subscription,
    ownerRole,
    ownerMember,
  };
}
