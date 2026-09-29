export type ResourceScope = "account" | "workflow";

export interface ScopedResource<TScope extends ResourceScope> {
  scope: TScope;
}

export interface AccountScoped extends ScopedResource<"account"> {
  accountId: string;
}

export interface WorkflowScoped extends ScopedResource<"workflow"> {
  accountId: string;
  workflowId: string;
}

export function ensureAccountScoped<T extends AccountScoped>(
  resource: T,
  accountId: string
): void {
  if (resource.scope !== "account" || resource.accountId !== accountId) {
    throw new Error("Resource is not account-scoped for the requested account");
  }
}

export function ensureWorkflowScoped<T extends WorkflowScoped>(
  resource: T,
  accountId: string,
  workflowId: string
): void {
  if (
    resource.scope !== "workflow" ||
    resource.accountId !== accountId ||
    resource.workflowId !== workflowId
  ) {
    throw new Error(
      "Resource is not workflow-scoped for the requested account/workflow"
    );
  }
}
