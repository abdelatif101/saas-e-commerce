import { createWorkflow } from "@/core/workflow/application/create-workflow";
import { NextResponse } from "next/server";
import type { AccountId, WorkflowId } from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { accountId } = await context.params;
    const body = (await request.json()) as {
      name: string;
      maxWorkflows?: number;
      currentActiveWorkflows?: number;
    };

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 });
    }

    const result = createWorkflow({
      id: crypto.randomUUID() as WorkflowId,
      accountId: accountId as AccountId,
      name: body.name,
      currentActiveWorkflows: body.currentActiveWorkflows ?? 0,
      maxWorkflows: body.maxWorkflows ?? 1,
    });

    return NextResponse.json(
      {
        workflow: {
          id: result.workflow.id,
          accountId: result.workflow.accountId,
          name: result.workflow.name,
          status: result.workflow.status,
          createdAt: result.workflow.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("maxWorkflows") ? 409 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
