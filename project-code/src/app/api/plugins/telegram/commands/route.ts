import { executeMerchantCommand } from "@/plugins/telegram/application/execute-merchant-command";
import { PluginConnection } from "@/core/workflow/domain/plugin-connection";
import { NextResponse } from "next/server";
import { createBrand, type AccountId, type Capability, type MemberId, type WorkflowId } from "@/shared/contracts/core-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pluginConnectionId?: string;
      pluginId?: string;
      workflowId?: string;
      accountId?: string;
      actorMemberId?: string;
      identityRef?: string;
      capabilities?: Capability[];
      workflowAccess?: string[];
      command?: { command: string; args: Record<string, unknown> };
      requiredCapability?: Capability;
    };

    if (!body.workflowId || !body.command || !body.requiredCapability) {
      return NextResponse.json(
        { error: "workflowId, command, and requiredCapability are required" },
        { status: 400 }
      );
    }

    const pluginConnection = new PluginConnection({
      id: body.pluginConnectionId ?? crypto.randomUUID(),
      workflowId: body.workflowId as WorkflowId,
      pluginId: (body.pluginId ?? "telegram") as import("@/shared/contracts/core-types").PluginId,
      status: "connected",
    });

    const result = executeMerchantCommand({
      pluginConnection,
      actorMemberId: (body.actorMemberId ?? crypto.randomUUID()) as MemberId,
      workflowId: body.workflowId as WorkflowId,
      accountId: createBrand<AccountId>(body.accountId ?? "unknown"),
      identityRef: body.identityRef ?? "telegram:user",
      capabilities: body.capabilities ?? [],
      workflowAccess: (body.workflowAccess ?? [body.workflowId]) as WorkflowId[],
      command: body.command,
      requiredCapability: body.requiredCapability,
    });

    return NextResponse.json(
      {
        allowed: result.allowed,
        reason: result.reason,
        command: result.command,
      },
      { status: result.allowed ? 200 : 403 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
