import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, WorkflowId } from "@/shared/contracts/core-types";

export type WorkflowStatus = "active" | "inactive" | "archived";

export interface WorkflowProps {
  id: WorkflowId;
  accountId: AccountId;
  name: string;
  status?: WorkflowStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Workflow {
  readonly id: WorkflowId;
  readonly accountId: AccountId;
  readonly name: string;
  readonly status: WorkflowStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: WorkflowProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error(DataModelConstraints.nameRequired ? "Workflow name is required" : "Workflow name is required");
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.name = props.name.trim();
    this.status = props.status ?? "active";
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
