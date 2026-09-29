import { describe, expect, it } from "vitest";
import { GET as getPublicProduct } from "@/app/public/[workflowRef]/products/[productSlug]/route";
import { POST as startWidgetSession } from "@/app/widget/[workflowRef]/sessions/route";
import { POST as appendMessage } from "@/app/widget/[workflowRef]/conversations/[conversationId]/messages/route";
import { POST as executePluginCommand } from "@/app/api/plugins/telegram/commands/route";

function makeGet(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
  params: Record<string, string>
) {
  const req = new Request("http://localhost/public/placeholder", { method: "GET" });
  return handler(req, { params: Promise.resolve(params) });
}

function makePost(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
  body: unknown,
  params?: Record<string, string>
) {
  const req = new Request("http://localhost/api/placeholder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handler(req, { params: Promise.resolve(params ?? {}) });
}

describe("US3 E2E public, chat, AI, and plugin scenarios", () => {
  it("Scenario 4: public product page and widget session", async () => {
    const publicRes = await makeGet(getPublicProduct, {
      workflowRef: "wf_us3_public",
      productSlug: "sample-product",
    });
    expect(publicRes.status).toBe(200);
    const publicJson = (await publicRes.json()) as {
      product: { available: boolean; workflowId: string };
    };
    expect(publicJson.product.workflowId).toBe("wf_us3_public");

    const sessionRes = await makePost(
      startWidgetSession,
      { origin: "https://example.com" },
      { workflowRef: "wf_us3_public" }
    );
    expect(sessionRes.status).toBe(201);
    const sessionJson = (await sessionRes.json()) as {
      sessionToken: string;
      conversationId: string;
      customerId: string;
    };
    expect(sessionJson.sessionToken).toBeDefined();

    const messageRes = await makePost(
      appendMessage,
      { origin: "https://example.com", content: "Hello from widget", identity: { name: "Alice", email: "alice@example.com" } },
      { workflowRef: "wf_us3_public", conversationId: sessionJson.conversationId }
    );
    expect(messageRes.status).toBe(201);
    const messageJson = (await messageRes.json()) as {
      customer: { kind: string; email: string };
    };
    expect(messageJson.customer.kind).toBe("identified");
  });

  it("Scenario 6: plugin command authorization and deny path", async () => {
    const deniedRes = await makePost(executePluginCommand, {
      workflowId: "wf_us3_plugin",
      accountId: "acc_us3_plugin",
      actorMemberId: "mem_us3_limited",
      identityRef: "telegram:user_limited",
      capabilities: ["product.manage"],
      workflowAccess: ["wf_us3_plugin"],
      command: { command: "create-order", args: { productId: "prod_1" } },
      requiredCapability: "order.manage",
    });
    expect(deniedRes.status).toBe(403);
    const deniedJson = (await deniedRes.json()) as { reason?: string };
    expect(deniedJson.reason).toContain("Missing required capability");

    const allowedRes = await makePost(executePluginCommand, {
      workflowId: "wf_us3_plugin",
      accountId: "acc_us3_plugin",
      actorMemberId: "mem_us3_owner",
      identityRef: "telegram:user_owner",
      capabilities: ["order.manage"],
      workflowAccess: ["wf_us3_plugin"],
      command: { command: "create-order", args: { productId: "prod_1" } },
      requiredCapability: "order.manage",
    });
    expect(allowedRes.status).toBe(200);
    const allowedJson = (await allowedRes.json()) as { allowed: boolean };
    expect(allowedJson.allowed).toBe(true);
  });
});
