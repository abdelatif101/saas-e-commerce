import type {
  AccountId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export interface WorkflowContext {
  accountId: AccountId;
  workflowId: WorkflowId;
}

export interface WorkflowContextResult {
  ok: true;
  context: WorkflowContext;
}

export interface WorkflowContextDenied {
  ok: false;
  reason: string;
}

export type WorkflowContextCheckResult =
  | WorkflowContextResult
  | WorkflowContextDenied;

export function requireWorkflowContext(
  requestedAccountId: AccountId,
  requestedWorkflowId: WorkflowId,
  availableWorkflowIds: WorkflowId[]
): WorkflowContextCheckResult {
  if (!availableWorkflowIds.includes(requestedWorkflowId)) {
    return {
      ok: false,
      reason: "Workflow scope is missing or not granted to the member",
    };
  }

  return {
    ok: true,
    context: {
      accountId: requestedAccountId,
      workflowId: requestedWorkflowId,
    },
  };
}

export function assertWorkflowContext(
  requestedAccountId: AccountId,
  requestedWorkflowId: WorkflowId,
  availableWorkflowIds: WorkflowId[]
): WorkflowContext {
  const result = requireWorkflowContext(
    requestedAccountId,
    requestedWorkflowId,
    availableWorkflowIds
  );
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return result.context;
}
