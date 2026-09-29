import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId } from "@/shared/contracts/core-types";

export type AccountStatus = "active" | "suspended" | "inactive";

export interface AccountProps {
  id: AccountId;
  name: string;
  status?: AccountStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  readonly id: AccountId;
  readonly name: string;
  readonly status: AccountStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: AccountProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error(DataModelConstraints.nameRequired ? "Account name is required" : "Account name is required");
    }
    this.id = props.id;
    this.name = props.name.trim();
    this.status = props.status ?? "active";
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
