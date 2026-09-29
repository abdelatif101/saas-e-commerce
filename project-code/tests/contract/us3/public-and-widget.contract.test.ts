import { describe, expect, it } from "vitest";
import { Product } from "@/core/commerce/products/domain/product";
import { PublicProductPage } from "@/core/workflow/domain/public-product-page";
import { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";
import { getPublicProductPage } from "@/core/commerce/products/application/get-public-product-page";
import { startWidgetSession } from "@/core/commerce/conversations/application/start-widget-session";
import { appendWidgetMessage } from "@/core/commerce/conversations/application/append-widget-message";
import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createConversation } from "@/core/commerce/conversations/application/create-conversation";
import type { ConversationId, CustomerId, ProductId, WorkflowId } from "@/shared/contracts/core-types";

const workflowId = "wf_public_1" as WorkflowId;

function makeWidgetConfig(allowedOrigins: string[] = ["https://example.com"]) {
  return new ChatWidgetConfiguration({
    id: "widget_1",
    workflowId,
    enabled: true,
    allowedOrigins,
  });
}

describe("GET /public/{workflowRef}/products/{productSlug} contract", () => {
  it("returns public product presentation when available", () => {
    const product = new Product({
      id: "prod_public_1" as ProductId,
      workflowId,
      type: "digital",
      name: "Public Digital Product",
      priceAmount: 1500,
      currency: "USD",
      status: "active",
      publicPageEnabled: true,
      availability: "in_stock",
    });

    const publicPage = new PublicProductPage({
      id: "pp_1",
      workflowId,
      productId: product.id,
      slug: "public-digital-product",
      enabled: true,
      visibility: "public",
    });

    const presentation = getPublicProductPage({
      workflowId,
      slug: publicPage.slug,
      product,
      publicPage,
    });

    expect(presentation.available).toBe(true);
    expect(presentation.workflowId).toBe(workflowId);
    expect(presentation.slug).toBe("public-digital-product");
    expect(presentation.priceAmount).toBe(1500);
  });

  it("returns unavailable state when public page is disabled", () => {
    const product = new Product({
      id: "prod_public_2" as ProductId,
      workflowId,
      type: "physical",
      name: "Hidden Product",
      priceAmount: 1000,
      status: "active",
      publicPageEnabled: true,
    });

    const publicPage = new PublicProductPage({
      id: "pp_2",
      workflowId,
      productId: product.id,
      slug: "hidden-product",
      enabled: false,
      visibility: "public",
    });

    const presentation = getPublicProductPage({
      workflowId,
      slug: publicPage.slug,
      product,
      publicPage,
    });

    expect(presentation.available).toBe(false);
  });
});

describe("POST /widget/{workflowRef}/sessions contract", () => {
  it("starts a widget session from allowed origin", () => {
    const session = startWidgetSession({
      workflowId,
      origin: "https://example.com",
      widgetConfiguration: makeWidgetConfig(),
      createCustomer: (input) =>
        createCustomer({
          id: input.id,
          workflowId: input.workflowId,
          kind: "guest",
          sourceChannel: "widget",
        }),
      createConversation: (input) =>
        createConversation({
          id: input.id,
          workflowId: input.workflowId,
          customerId: input.customerId,
          channel: "widget",
        }),
      generateSessionToken: () => "token_123",
    });

    expect(session.sessionToken).toBe("token_123");
    expect(session.workflowId).toBe(workflowId);
  });

  it("rejects session from disallowed origin", () => {
    expect(() =>
      startWidgetSession({
        workflowId,
        origin: "https://evil.com",
        widgetConfiguration: makeWidgetConfig(),
        createCustomer: (input) =>
          createCustomer({
            id: input.id,
            workflowId: input.workflowId,
            kind: "guest",
            sourceChannel: "widget",
          }),
        createConversation: (input) =>
          createConversation({
            id: input.id,
            workflowId: input.workflowId,
            customerId: input.customerId,
            channel: "widget",
          }),
        generateSessionToken: () => "token_123",
      })
    ).toThrow("Origin not allowed");
  });
});

describe("POST /widget/{workflowRef}/conversations/{conversationId}/messages contract", () => {
  it("appends a customer message and returns current handler", () => {
    const customer = createCustomer({
      id: "cust_widget_1" as CustomerId,
      workflowId,
      kind: "guest",
      sourceChannel: "widget",
    });

    const conversation = createConversation({
      id: "conv_widget_1" as ConversationId,
      workflowId,
      customerId: customer.id,
      channel: "widget",
    });

    const result = appendWidgetMessage({
      conversation,
      customer,
      widgetConfiguration: makeWidgetConfig(),
      origin: "https://example.com",
      content: "Hello",
      identity: { name: "Alice", email: "alice@example.com" },
    });

    expect(result.message.content).toBe("Hello");
    expect(result.customer.kind).toBe("identified");
    expect(result.customer.email).toBe("alice@example.com");
    expect(result.currentHandler).toBe("human");
  });
});
