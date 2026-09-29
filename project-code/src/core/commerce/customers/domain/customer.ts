import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export type CustomerKind = "guest" | "identified";
export type CustomerChannel = "widget" | "public_page" | "telegram" | "manual";

export interface CustomerProps {
  id: CustomerId;
  workflowId: WorkflowId;
  kind?: CustomerKind;
  name?: string;
  email?: string;
  phone?: string;
  sourceChannel?: CustomerChannel;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  readonly id: CustomerId;
  readonly workflowId: WorkflowId;
  kind: CustomerKind;
  readonly name: string | undefined;
  readonly email: string | undefined;
  readonly phone: string | undefined;
  readonly sourceChannel: CustomerChannel;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.workflowId = props.workflowId;
    this.kind = props.kind ?? "guest";
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.sourceChannel = props.sourceChannel ?? "manual";
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  matchesIdentity(other: Customer): boolean {
    if (DataModelConstraints.customerDeduplicationIdentifiers.includes("email") && this.email && other.email) {
      return this.email.toLowerCase() === other.email.toLowerCase();
    }
    if (DataModelConstraints.customerDeduplicationIdentifiers.includes("phone") && this.phone && other.phone) {
      return this.phone === other.phone;
    }
    return false;
  }

  promoteToIdentified(props: { name?: string; email?: string; phone?: string }): void {
    if (!DataModelConstraints.guestPromotionAllowed) {
      throw new Error("Guest promotion is not allowed");
    }
    if (!props.email && !props.phone) {
      throw new Error("Reliable identifier required to promote guest customer");
    }
    this.kind = "identified";
    if (props.name) (this as unknown as Record<string, unknown>).name = props.name;
    if (props.email) (this as unknown as Record<string, unknown>).email = props.email;
    if (props.phone) (this as unknown as Record<string, unknown>).phone = props.phone;
  }
}
