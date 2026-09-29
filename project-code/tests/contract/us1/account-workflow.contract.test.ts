import { describe, expect, it } from "vitest";
import { createAccount } from "@/core/account/application/create-account";
import { createWorkflow } from "@/core/workflow/application/create-workflow";
import type { AccountId, MemberId, WorkflowId } from "@/shared/contracts/core-types";

const ownerIdentityRef = "user_owner";
const ownerEmail = "owner@example.com";

describe("POST /api/accounts contract", () => {
  it("returns account id, default subscription, and owner membership", () => {
    const result = createAccount({
      id: "acc_contract_1" as AccountId,
      name: "Contract Test Account",
      ownerIdentityRef,
      ownerEmail,
      ownerMemberId: "mem_contract_owner" as MemberId,
      subscriptionId: "sub_contract_1",
      maxWorkflows: 2,
    });

    expect(result.account.id).toBe("acc_contract_1");
    expect(result.account.name).toBe("Contract Test Account");
    expect(result.subscription.maxWorkflows).toBe(2);
    expect(result.ownerMember.roleId).toBe("role_owner");
  });

  it("rejects an account without a name", () => {
    expect(() =>
      createAccount({
        id: "acc_contract_2" as AccountId,
        name: "",
        ownerIdentityRef,
        ownerEmail,
        ownerMemberId: "mem_contract_owner_2" as MemberId,
        subscriptionId: "sub_contract_2",
      })
    ).toThrow("name");
  });
});

describe("POST /api/accounts/{accountId}/workflows contract", () => {
  it("creates a workflow when subscription capacity is available", () => {
    const result = createWorkflow({
      id: "wf_contract_1" as WorkflowId,
      accountId: "acc_contract_1" as AccountId,
      name: "Sales Workflow",
      currentActiveWorkflows: 0,
      maxWorkflows: 2,
    });

    expect(result.workflow.id).toBe("wf_contract_1");
    expect(result.workflow.name).toBe("Sales Workflow");
  });

  it("rejects workflow creation when subscription limit is reached", () => {
    expect(() =>
      createWorkflow({
        id: "wf_contract_2" as WorkflowId,
        accountId: "acc_contract_1" as AccountId,
        name: "Blocked Workflow",
        currentActiveWorkflows: 2,
        maxWorkflows: 2,
      })
    ).toThrow("maxWorkflows");
  });
});
