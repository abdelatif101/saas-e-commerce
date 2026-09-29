import {
  grantWorkflowAccess,
  revokeWorkflowAccess,
} from "@/core/workflow/application/manage-workflow-access";
import { recordWorkflowAccessAuditEvent } from "@/core/workflow/application/audit-workflow-access";
import { WorkflowAccessGrant } from "@/core/workflow/domain/workflow-access-grant";
import { NextResponse } from "next/server";
import type {
  AccountId,
  MemberId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { accountId, workflowId, memberId } = await context.params;
    const body = (await request.json()) as {
      accessLevel?: "read" | "write" | "admin";
      grantedByMemberId?: MemberId;
    };

    const grant = grantWorkflowAccess({
      id: crypto.randomUUID(),
      accountId: accountId as AccountId,
      workflowId: workflowId as WorkflowId,
      memberId: memberId as MemberId,
      accessLevel: body.accessLevel,
      grantedByMemberId: body.grantedByMemberId ?? (crypto.randomUUID() as MemberId),
    });

    const auditEvent = recordWorkflowAccessAuditEvent({
      id: crypto.randomUUID(),
      accountId: grant.accountId,
      workflowId: grant.workflowId,
      actorMemberId: grant.grantedByMemberId,
      action: "workflow.access.granted",
      targetMemberId: grant.memberId,
      metadata: { accessLevel: grant.accessLevel },
    });

    return NextResponse.json(
      {
        grant: {
          id: grant.id,
          workflowId: grant.workflowId,
          memberId: grant.memberId,
          accessLevel: grant.accessLevel,
        },
        auditEvent: {
          id: auditEvent.id,
          action: auditEvent.action,
          timestamp: auditEvent.timestamp,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { accountId, workflowId, memberId } = await context.params;
    const grant = new WorkflowAccessGrant({
      id: crypto.randomUUID(),
      accountId: accountId as AccountId,
      workflowId: workflowId as WorkflowId,
      memberId: memberId as MemberId,
      grantedByMemberId: crypto.randomUUID() as MemberId,
    });

    const revoked = revokeWorkflowAccess({
      grant,
      revokedByMemberId: crypto.randomUUID() as MemberId,
    });

    const auditEvent = recordWorkflowAccessAuditEvent({
      id: crypto.randomUUID(),
      accountId: revoked.accountId,
      workflowId: revoked.workflowId,
      actorMemberId: revoked.grantedByMemberId,
      action: "workflow.access.revoked",
      targetMemberId: revoked.memberId,
      metadata: {},
    });

    return NextResponse.json(
      {
        revoked: {
          workflowId: revoked.workflowId,
          memberId: revoked.memberId,
        },
        auditEvent: {
          id: auditEvent.id,
          action: auditEvent.action,
          timestamp: auditEvent.timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
