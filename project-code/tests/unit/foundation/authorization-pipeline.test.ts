import { describe, expect, it } from "vitest";
import {
  authorizeOperation,
  type AuthorizationContext,
  type ResourceRequest,
} from "@/core/authorization/application/authorize-operation";
import { assertWorkflowContext } from "@/core/workflow/application/require-workflow-context";
import type { AccountId, Capability, MemberId, WorkflowId } from "@/shared/contracts/core-types";

const accountId = "acc_1" as AccountId;
const workflowA = "wf_a" as WorkflowId;
const workflowB = "wf_b" as WorkflowId;
const memberId = "mem_1" as MemberId;

function buildContext(
  capabilities: Capability[] = [],
  workflowAccess: WorkflowId[] = []
): AuthorizationContext {
  return {
    identityRef: "user_1",
    accountId,
    memberId,
    capabilities,
    workflowAccess,
  };
}

describe("authorizeOperation", () => {
  it("denies when account membership does not match", () => {
    const ctx = buildContext(["workflow.manage"], [workflowA]);
    const request: ResourceRequest = {
      accountId: "acc_2" as AccountId,
      requiredCapability: "workflow.manage",
    };
    const result = authorizeOperation(ctx, request);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not a member");
  });

  it("denies when capability is missing", () => {
    const ctx = buildContext([], [workflowA]);
    const request: ResourceRequest = {
      accountId,
      requiredCapability: "workflow.manage",
    };
    const result = authorizeOperation(ctx, request);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Missing required capability");
  });

  it("denies when workflow access is missing for workflow-scoped request", () => {
    const ctx = buildContext(["product.manage"], [workflowA]);
    const request: ResourceRequest = {
      accountId,
      workflowId: workflowB,
      requiredCapability: "product.manage",
    };
    const result = authorizeOperation(ctx, request);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("workflow");
  });

  it("allows account-scoped request when capability is present", () => {
    const ctx = buildContext(["member.manage"], []);
    const request: ResourceRequest = {
      accountId,
      requiredCapability: "member.manage",
    };
    const result = authorizeOperation(ctx, request);
    expect(result.allowed).toBe(true);
  });

  it("allows workflow-scoped request when capability and access are present", () => {
    const ctx = buildContext(["order.manage"], [workflowA]);
    const request: ResourceRequest = {
      accountId,
      workflowId: workflowA,
      requiredCapability: "order.manage",
    };
    const result = authorizeOperation(ctx, request);
    expect(result.allowed).toBe(true);
  });
});

describe("requireWorkflowContext", () => {
  it("asserts access when workflow is granted", () => {
    const context = assertWorkflowContext(accountId, workflowA, [workflowA]);
    expect(context.accountId).toBe(accountId);
    expect(context.workflowId).toBe(workflowA);
  });

  it("throws when workflow is not granted", () => {
    expect(() =>
      assertWorkflowContext(accountId, workflowB, [workflowA])
    ).toThrow("Workflow scope is missing");
  });
});
