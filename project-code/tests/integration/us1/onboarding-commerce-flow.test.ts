import { describe, expect, it } from "vitest";
import { createAccount } from "@/core/account/application/create-account";
import { createWorkflow } from "@/core/workflow/application/create-workflow";
import { createProduct } from "@/core/commerce/products/application/create-product";
import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createConversation } from "@/core/commerce/conversations/application/create-conversation";
import { createPurchaseIntent } from "@/core/commerce/conversations/application/create-purchase-intent";
import { createOrder } from "@/core/commerce/orders/application/create-order";
import type {
  AccountId,
  ConversationId,
  CustomerId,
  MemberId,
  OrderId,
  ProductId,
  WorkflowId,
} from "@/shared/contracts/core-types";

describe("US1 onboarding → product → conversation → intent → order", () => {
  it("completes the full merchant onboarding-to-order journey", () => {
    const accountResult = createAccount({
      id: "acc_us1_1" as AccountId,
      name: "Merchant One",
      ownerIdentityRef: "user_merchant_1",
      ownerEmail: "merchant@example.com",
      ownerMemberId: "mem_us1_owner" as MemberId,
      subscriptionId: "sub_us1_1",
      maxWorkflows: 3,
    });

    expect(accountResult.account.name).toBe("Merchant One");
    expect(accountResult.subscription.maxWorkflows).toBe(3);
    expect(accountResult.ownerMember.roleId).toBe("role_owner");

    const workflowResult = createWorkflow({
      id: "wf_us1_1" as WorkflowId,
      accountId: accountResult.account.id,
      name: "Main Store",
      currentActiveWorkflows: 0,
      maxWorkflows: accountResult.subscription.maxWorkflows,
    });

    expect(workflowResult.workflow.accountId).toBe(accountResult.account.id);

    const product = createProduct({
      id: "prod_us1_1" as ProductId,
      workflowId: workflowResult.workflow.id,
      type: "physical",
      name: "T-Shirt",
      description: "Cotton t-shirt",
      priceAmount: 2500,
      currency: "USD",
      status: "active",
      publicPageEnabled: true,
    });

    expect(product.isPubliclyAvailable()).toBe(true);

    const customer = createCustomer({
      id: "cust_us1_1" as CustomerId,
      workflowId: workflowResult.workflow.id,
      kind: "guest",
      sourceChannel: "widget",
    });

    customer.promoteToIdentified({
      name: "Alice",
      email: "alice@example.com",
    });

    expect(customer.kind).toBe("identified");
    expect(customer.email).toBe("alice@example.com");

    const conversation = createConversation({
      id: "conv_us1_1" as ConversationId,
      workflowId: workflowResult.workflow.id,
      customerId: customer.id,
      channel: "widget",
    });

    conversation.assignToAi();
    expect(conversation.currentHandler).toBe("ai");

    conversation.handoffToHuman();
    expect(conversation.currentHandler).toBe("human");

    const intent = createPurchaseIntent({
      id: "intent_us1_1",
      workflowId: workflowResult.workflow.id,
      customerId: customer.id,
      items: [{ productId: product.id, quantity: 2 }],
      channelContext: "widget",
    });

    expect(intent.items[0].quantity).toBe(2);

    const order = createOrder({
      id: "ord_us1_1" as OrderId,
      workflowId: workflowResult.workflow.id,
      customerId: customer.id,
      sourceConversationId: conversation.id,
      orderType: "physical",
      items: [
        {
          id: "item_us1_1",
          productId: product.id,
          quantity: intent.items[0].quantity,
          unitPrice: product.priceAmount,
        },
      ],
    });

    expect(order.status).toBe("New");
    expect(order.totalAmount).toBe(5000);

    order.transitionStatus("Processing");
    expect(order.status).toBe("Processing");

    order.transitionStatus("Completed");
    expect(order.status).toBe("Completed");

    expect(() => order.transitionStatus("New")).toThrow("Invalid");
  });
});
