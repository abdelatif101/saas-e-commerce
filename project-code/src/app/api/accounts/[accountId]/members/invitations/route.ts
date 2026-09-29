import { inviteMember } from "@/core/account/application/manage-members";
import { recordMemberAuditEvent } from "@/core/account/application/audit-member-actions";
import { NextResponse } from "next/server";
import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { accountId } = await context.params;
    const body = (await request.json()) as {
      email: string;
      displayName?: string;
      roleId: string;
    };

    if (!body.email || !body.roleId) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const member = inviteMember({
      id: crypto.randomUUID() as MemberId,
      accountId: accountId as AccountId,
      email: body.email,
      displayName: body.displayName,
      roleId: body.roleId,
    });

    const auditEvent = recordMemberAuditEvent({
      id: crypto.randomUUID(),
      accountId: member.accountId,
      actorMemberId: crypto.randomUUID() as MemberId,
      action: "member.invited",
      targetMemberId: member.id,
      metadata: { roleId: member.roleId },
    });

    return NextResponse.json(
      {
        invitation: {
          id: member.id,
          accountId: member.accountId,
          email: member.email,
          roleId: member.roleId,
          status: member.status,
          invitedAt: member.invitedAt,
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
