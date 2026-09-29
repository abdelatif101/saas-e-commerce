import { Workflow } from "@/core/workflow/domain/workflow";
import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, WorkflowId } from "@/shared/contracts/core-types";

export interface CreateWorkflowInput {
  id: WorkflowId;
  accountId: AccountId;
  name: string;
  currentActiveWorkflows: number;
  maxWorkflows: number;
}

export interface CreateWorkflowResult {
  workflow: Workflow;
}

export function createWorkflow(
  input: CreateWorkflowInput
): CreateWorkflowResult {
  if (input.currentActiveWorkflows >= input.maxWorkflows) {
    throw new Error(DataModelConstraints.workflowLimitReachedMessage);
  }

  const workflow = new Workflow({
    id: input.id,
    accountId: input.accountId,
    name: input.name,
  });

  return { workflow };
}
