import { Customer } from "@/core/commerce/customers/domain/customer";
import type { CustomerId, WorkflowId } from "@/shared/contracts/core-types";

export interface CreateCustomerInput {
  id: CustomerId;
  workflowId: WorkflowId;
  kind?: "guest" | "identified";
  name?: string;
  email?: string;
  phone?: string;
  sourceChannel?: "widget" | "public_page" | "telegram" | "manual";
}

export function createCustomer(input: CreateCustomerInput): Customer {
  return new Customer({
    id: input.id,
    workflowId: input.workflowId,
    kind: input.kind,
    name: input.name,
    email: input.email,
    phone: input.phone,
    sourceChannel: input.sourceChannel,
  });
}
