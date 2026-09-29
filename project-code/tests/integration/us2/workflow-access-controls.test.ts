import { describe, expect, it } from "vitest";
import {
  authorizeOperation,
  type AuthorizationContext,
  type ResourceRequest,
} from "@/core/authorization/application/authorize-operation";
import { createAccount } from "@/core/account/application/create-account";
import { createWorkflow } from "@/core/workflow/application/create-workflow";
import { inviteMember } from "@/core/account/application/manage-members";
import { grantWorkflowAccess } from "@/core/workflow/application/manage-workflow-access";
import type {
  AccountId,
  Capability,
  MemberId,
  WorkflowId,
} from "@/shared/contracts/core-types";

function buildAuthContext(
  accountId: AccountId,
  memberId: MemberId,
  capabilities: Capability[],
  workflowAccess: WorkflowId[]
): AuthorizationContext {
  return {
    identityRef: "user_1",
    accountId,
    memberId,
    capabilities,
    workflowAccess,
  };
}

describe("Cross-workflow authorization", () => {
  it("allows operation in granted workflow and denies in ungranted workflow", () => {
    const accountResult = createAccount({
      id: "acc_us2_auth" as AccountId,
      name: "Auth Test Account",
      ownerIdentityRef: "owner",
      ownerEmail: "owner@example.com",
      ownerMemberId: "mem_owner" as MemberId,
      subscriptionId: "sub_us2_auth",
      maxWorkflows: 2,
    });

    const workflowA = createWorkflow({
      id: "wf_a" as WorkflowId,
      accountId: accountResult.account.id,
      name: "Workflow A",
      currentActiveWorkflows: 0,
      maxWorkflows: 2,
    }).workflow;

    const workflowB = createWorkflow({
      id: "wf_b" as WorkflowId,
      accountId: accountResult.account.id,
      name: "Workflow B",
      currentActiveWorkflows: 1,
      maxWorkflows: 2,
    }).workflow;

    const member = inviteMember({
      id: "mem_limited" as MemberId,
      accountId: accountResult.account.id,
      email: "limited@example.com",
      roleId: "role_member",
    });

    grantWorkflowAccess({
      id: "grant_a",
      accountId: accountResult.account.id,
      workflowId: workflowA.id,
      memberId: member.id,
      accessLevel: "write",
      grantedByMemberId: accountResult.ownerMember.id,
    });

    const ctx = buildAuthContext(
      accountResult.account.id,
      member.id,
      ["product.manage"],
      [workflowA.id]
    );

    const allowed: ResourceRequest = {
      accountId: accountResult.account.id,
      workflowId: workflowA.id,
      requiredCapability: "product.manage",
    };

    const denied: ResourceRequest = {
      accountId: accountResult.account.id,
      workflowId: workflowB.id,
      requiredCapability: "product.manage",
    };

    expect(authorizeOperation(ctx, allowed).allowed).toBe(true);
    expect(authorizeOperation(ctx, denied).allowed).toBe(false);
  });
});
