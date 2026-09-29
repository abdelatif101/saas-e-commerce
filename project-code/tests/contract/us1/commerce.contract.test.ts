import { describe, expect, it } from "vitest";
import { createProduct } from "@/core/commerce/products/application/create-product";
import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createConversation } from "@/core/commerce/conversations/application/create-conversation";
import { createPurchaseIntent } from "@/core/commerce/conversations/application/create-purchase-intent";
import { createOrder } from "@/core/commerce/orders/application/create-order";
import type {
  ConversationId,
  CustomerId,
  OrderId,
  ProductId,
  WorkflowId,
} from "@/shared/contracts/core-types";

const workflowId = "wf_commerce_1" as WorkflowId;

describe("POST /api/workflows/{workflowId}/purchase-intents contract", () => {
  it("captures a purchase intent with customer and items", () => {
    const customer = createCustomer({
      id: "cust_commerce_1" as CustomerId,
      workflowId,
      kind: "identified",
      email: "customer@example.com",
    });

    const intent = createPurchaseIntent({
      id: "intent_1",
      workflowId,
      customerId: customer.id,
      items: [
        { productId: "prod_1" as ProductId, quantity: 2 },
      ],
      channelContext: "widget",
    });

    expect(intent.workflowId).toBe(workflowId);
    expect(intent.customerId).toBe(customer.id);
    expect(intent.items).toHaveLength(1);
  });

  it("rejects an empty purchase intent", () => {
    expect(() =>
      createPurchaseIntent({
        id: "intent_2",
        workflowId,
        customerId: "cust_2" as CustomerId,
        items: [],
      })
    ).toThrow("at least one item");
  });
});

describe("POST /api/workflows/{workflowId}/orders contract", () => {
  it("creates an order in New status with line items", () => {
    const product = createProduct({
      id: "prod_order_1" as ProductId,
      workflowId,
      type: "physical",
      name: "Widget",
      priceAmount: 1000,
    });

    const customer = createCustomer({
      id: "cust_order_1" as CustomerId,
      workflowId,
      email: "buyer@example.com",
    });

    const conversation = createConversation({
      id: "conv_order_1" as ConversationId,
      workflowId,
      customerId: customer.id,
      channel: "widget",
    });

    const order = createOrder({
      id: "ord_1" as OrderId,
      workflowId,
      customerId: customer.id,
      sourceConversationId: conversation.id,
      orderType: "physical",
      items: [
        {
          id: "item_1",
          productId: product.id,
          quantity: 1,
          unitPrice: product.priceAmount,
        },
      ],
    });

    expect(order.status).toBe("New");
    expect(order.items).toHaveLength(1);
    expect(order.totalAmount).toBe(1000);
  });

  it("rejects an order without line items", () => {
    expect(() =>
      createOrder({
        id: "ord_2" as OrderId,
        workflowId,
        customerId: "cust_order_2" as CustomerId,
        orderType: "digital",
        items: [],
      })
    ).toThrow("at least one line item");
  });
});
