import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId } from "@/shared/contracts/core-types";

export type SubscriptionStatus = "active" | "trial" | "cancelled" | "past_due";
export type SubscriptionPlanCode = "mvp" | string;

export interface SubscriptionProps {
  id: string;
  accountId: AccountId;
  planCode?: SubscriptionPlanCode;
  maxWorkflows: number;
  status?: SubscriptionStatus;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}

export class Subscription {
  readonly id: string;
  readonly accountId: AccountId;
  readonly planCode: SubscriptionPlanCode;
  readonly maxWorkflows: number;
  readonly status: SubscriptionStatus;
  readonly effectiveFrom: Date;
  readonly effectiveTo: Date | null;

  constructor(props: SubscriptionProps) {
    if (props.maxWorkflows < DataModelConstraints.maxWorkflowsMin) {
      throw new Error("maxWorkflows must be >= 1");
    }

    this.id = props.id;
    this.accountId = props.accountId;
    this.planCode = props.planCode ?? "mvp";
    this.maxWorkflows = props.maxWorkflows;
    this.status = props.status ?? "active";
    this.effectiveFrom = props.effectiveFrom ?? new Date();
    this.effectiveTo = props.effectiveTo ?? null;
  }

  canCreateWorkflow(currentActiveWorkflows: number): boolean {
    return currentActiveWorkflows < this.maxWorkflows;
  }
}
