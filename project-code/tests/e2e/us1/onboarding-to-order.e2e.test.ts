import { describe, expect, it } from "vitest";
import { POST as createAccount } from "@/app/api/accounts/route";
import { POST as createWorkflow } from "@/app/api/accounts/[accountId]/workflows/route";
import { POST as createPurchaseIntent } from "@/app/api/workflows/[workflowId]/purchase-intents/route";
import { POST as createOrder } from "@/app/api/workflows/[workflowId]/orders/route";

type GenericRouteHandler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

function makeRequest(handler: GenericRouteHandler, body: unknown, params?: Record<string, string>) {
  const req = new Request("http://localhost/api/placeholder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handler(req, { params: Promise.resolve(params ?? {}) });
}

describe("US1 E2E onboarding to order", () => {
  it("Scenario 1 and 3: creates account, workflow, product intent, and order", async () => {
    const accountRes = await makeRequest(createAccount, {
      name: "E2E Merchant",
      ownerIdentityRef: "user_e2e",
      ownerEmail: "e2e@example.com",
    });
    expect(accountRes.status).toBe(201);
    const accountJson = (await accountRes.json()) as {
      account: { id: string };
      subscription: { maxWorkflows: number };
    };

    const workflowRes = await makeRequest(
      createWorkflow,
      { name: "E2E Workflow" },
      { accountId: accountJson.account.id }
    );
    expect(workflowRes.status).toBe(201);
    const workflowJson = (await workflowRes.json()) as {
      workflow: { id: string };
    };

    const intentRes = await makeRequest(
      createPurchaseIntent,
      {
        customer: { name: "E2E Customer", email: "e2e@example.com" },
        items: [{ productId: "prod_e2e_1", quantity: 1 }],
        channelContext: "public_page",
      },
      { workflowId: workflowJson.workflow.id }
    );
    expect(intentRes.status).toBe(201);
    const intentJson = (await intentRes.json()) as {
      intent: { customerId: string };
    };

    const orderRes = await makeRequest(
      createOrder,
      {
        customerId: intentJson.intent.customerId,
        orderType: "physical",
        items: [
          { productId: "prod_e2e_1", quantity: 1, unitPrice: 5000 },
        ],
      },
      { workflowId: workflowJson.workflow.id }
    );
    expect(orderRes.status).toBe(201);
    const orderJson = (await orderRes.json()) as {
      order: { status: string; totalAmount: number };
    };
    expect(orderJson.order.status).toBe("New");
    expect(orderJson.order.totalAmount).toBe(5000);
  });

  it("returns 409 when workflow limit is reached", async () => {
    const accountRes = await makeRequest(createAccount, {
      name: "Limited Merchant",
      ownerIdentityRef: "user_e2e_limited",
      ownerEmail: "limited@example.com",
    });
    expect(accountRes.status).toBe(201);
    const accountJson = (await accountRes.json()) as {
      account: { id: string };
    };

    const workflowRes = await makeRequest(
      createWorkflow,
      { name: "First Workflow", currentActiveWorkflows: 0, maxWorkflows: 1 },
      { accountId: accountJson.account.id }
    );
    expect(workflowRes.status).toBe(201);

    const secondRes = await makeRequest(
      createWorkflow,
      { name: "Second Workflow", currentActiveWorkflows: 1, maxWorkflows: 1 },
      { accountId: accountJson.account.id }
    );
    expect(secondRes.status).toBe(409);
  });
});
