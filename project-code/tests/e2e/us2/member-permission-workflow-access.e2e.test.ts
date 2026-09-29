import { describe, expect, it } from "vitest";
import { POST as inviteMember } from "@/app/api/accounts/[accountId]/members/invitations/route";
import { PATCH as patchAccess } from "@/app/api/accounts/[accountId]/members/[memberId]/access/route";
import { POST as grantAccess, DELETE as revokeAccess } from "@/app/api/accounts/[accountId]/workflows/[workflowId]/access/[memberId]/route";
import { POST as createAccount } from "@/app/api/accounts/route";
import { POST as createWorkflow } from "@/app/api/accounts/[accountId]/workflows/route";

function makeRequest(
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

function makePatchRequest(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
  body: unknown,
  params?: Record<string, string>
) {
  const req = new Request("http://localhost/api/placeholder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handler(req, { params: Promise.resolve(params ?? {}) });
}

describe("US2 E2E member permission and workflow access", () => {
  it("Scenario 2: invites member, assigns permissions, grants workflow A only", async () => {
    const accountRes = await makeRequest(createAccount, {
      name: "US2 Account",
      ownerIdentityRef: "owner_us2",
      ownerEmail: "owner@us2.example",
    });
    expect(accountRes.status).toBe(201);
    const accountJson = (await accountRes.json()) as {
      account: { id: string };
    };

    const workflowARes = await makeRequest(
      createWorkflow,
      { name: "Workflow A", currentActiveWorkflows: 0, maxWorkflows: 2 },
      { accountId: accountJson.account.id }
    );
    expect(workflowARes.status).toBe(201);
    const workflowAJson = (await workflowARes.json()) as {
      workflow: { id: string };
    };

    const workflowBRes = await makeRequest(
      createWorkflow,
      { name: "Workflow B", currentActiveWorkflows: 1, maxWorkflows: 2 },
      { accountId: accountJson.account.id }
    );
    expect(workflowBRes.status).toBe(201);
    const workflowBJson = (await workflowBRes.json()) as {
      workflow: { id: string };
    };

    const inviteRes = await makeRequest(
      inviteMember,
      { email: "member@us2.example", roleId: "role_member" },
      { accountId: accountJson.account.id }
    );
    expect(inviteRes.status).toBe(201);
    const inviteJson = (await inviteRes.json()) as {
      invitation: { id: string };
    };

    const accessRes = await makePatchRequest(
      patchAccess,
      { permissions: ["product.manage", "order.manage"] },
      { accountId: accountJson.account.id, memberId: inviteJson.invitation.id }
    );
    expect(accessRes.status).toBe(200);

    const grantARes = await makeRequest(
      grantAccess,
      { accessLevel: "write" },
      {
        accountId: accountJson.account.id,
        workflowId: workflowAJson.workflow.id,
        memberId: inviteJson.invitation.id,
      }
    );
    expect(grantARes.status).toBe(201);

    const revokeBRes = await makeRequest(
      revokeAccess,
      {},
      {
        accountId: accountJson.account.id,
        workflowId: workflowBJson.workflow.id,
        memberId: inviteJson.invitation.id,
      }
    );
    expect(revokeBRes.status).toBe(200);

    const accessJson = (await accessRes.json()) as {
      access: { permissions: string[] };
    };
    expect(accessJson.access.permissions).toContain("product.manage");
  });
});
