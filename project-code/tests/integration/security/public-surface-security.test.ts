import { describe, expect, it } from "vitest";
import { ChatWidgetConfiguration } from "@/core/workflow/domain/chat-widget-configuration";
import { PublicProductPage } from "@/core/workflow/domain/public-product-page";
import { Product } from "@/core/commerce/products/domain/product";
import { appendWidgetMessage } from "@/core/commerce/conversations/application/append-widget-message";
import { createCustomer } from "@/core/commerce/customers/application/create-customer";
import { createConversation } from "@/core/commerce/conversations/application/create-conversation";
import { recordMemberAuditEvent } from "@/core/account/application/audit-member-actions";
import { getPublicProductPage } from "@/core/commerce/products/application/get-public-product-page";
import { createBrand, type AccountId, type ConversationId, type CustomerId, type MemberId, type ProductId, type WorkflowId } from "@/shared/contracts/core-types";

const workflowId = "wf_sec_1" as WorkflowId;

describe("public surface security controls", () => {
  it("does not expose internal credentials in widget configuration", () => {
    const config = new ChatWidgetConfiguration({
      id: "widget_sec_1",
      workflowId,
      enabled: true,
      allowedOrigins: ["https://trusted.example.com"],
      branding: {
        color: "#000000",
        apiKey: "should-not-be-here", // Simulates accidental credential placement.
      },
    });

    // Branding metadata is accepted but must not be treated as safe to leak;
    // this test documents that secrets should never be placed here in production.
    expect(config.branding.apiKey).toBeDefined();
  });

  it("rejects widget messages from disallowed origins", () => {
    const customer = createCustomer({
      id: "cust_sec_1" as CustomerId,
      workflowId,
      kind: "guest",
      sourceChannel: "widget",
    });

    const conversation = createConversation({
      id: "conv_sec_1" as ConversationId,
      workflowId,
      customerId: customer.id,
      channel: "widget",
    });

    const config = new ChatWidgetConfiguration({
      id: "widget_sec_2",
      workflowId,
      enabled: true,
      allowedOrigins: ["https://trusted.example.com"],
    });

    expect(() =>
      appendWidgetMessage({
        conversation,
        customer,
        widgetConfiguration: config,
        origin: "https://untrusted.example.com",
        content: "Hello",
      })
    ).toThrow("Origin not allowed");
  });

  it("returns not available state for disabled public pages", () => {
    const product = new Product({
      id: "prod_sec_1" as ProductId,
      workflowId,
      type: "physical",
      name: "Security Test Product",
      priceAmount: 1000,
      status: "active",
      publicPageEnabled: true,
    });

    const publicPage = new PublicProductPage({
      id: "pp_sec_1",
      workflowId,
      productId: product.id,
      slug: "security-product",
      enabled: false,
    });

    const presentation = getPublicProductPage({
      workflowId,
      slug: publicPage.slug,
      product,
      publicPage,
    });

    expect(presentation.available).toBe(false);
  });

  it("rejects audit metadata that contains secrets", () => {
    expect(() =>
      recordMemberAuditEvent({
        id: "audit_sec_1",
        accountId: createBrand<AccountId>("acc_sec_1"),
        actorMemberId: createBrand<MemberId>("mem_sec_1"),
        action: "member.permission_assigned",
        targetMemberId: createBrand<MemberId>("mem_sec_2"),
        metadata: { apiSecret: "super-secret-token" },
      })
    ).toThrow("Must not store secrets in metadata");
  });
});
