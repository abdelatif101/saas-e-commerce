import { assignRole } from "@/core/account/application/manage-members";
import { recordMemberAuditEvent } from "@/core/account/application/audit-member-actions";
import { PermissionGrant } from "@/core/authorization/domain/permission-grant";
import { NextResponse } from "next/server";
import type {
  AccountId,
  Capability,
  MemberId,
} from "@/shared/contracts/core-types";

export async function PATCH(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { accountId, memberId } = await context.params;
    const body = (await request.json()) as {
      roleId?: string;
      permissions?: Capability[];
    };

    if (!body.roleId && (!body.permissions || body.permissions.length === 0)) {
      return NextResponse.json(
        { error: "roleId or permissions are required" },
        { status: 400 }
      );
    }

    const updates: {
      roleId?: string;
      permissions?: PermissionGrant[];
    } = {};

    if (body.roleId) {
      const member = assignRole({
        member: {
          id: memberId as MemberId,
          accountId: accountId as AccountId,
          userIdentityRef: "",
          email: "",
          roleId: "role_member",
          status: "active",
        } as unknown as import("@/core/account/domain/member").Member,
        newRoleId: body.roleId,
      });
      updates.roleId = member.roleId;
    }

    if (body.permissions) {
      updates.permissions = body.permissions.map(
        (capability) =>
          new PermissionGrant({
            id: crypto.randomUUID(),
            accountId: accountId as AccountId,
            memberId: memberId as MemberId,
            capability,
          })
      );
    }

    const auditEvent = recordMemberAuditEvent({
      id: crypto.randomUUID(),
      accountId: accountId as AccountId,
      actorMemberId: crypto.randomUUID() as MemberId,
      action: body.roleId ? "member.role_assigned" : "member.permission_assigned",
      targetMemberId: memberId as MemberId,
      metadata: {
        roleId: updates.roleId,
        permissions: updates.permissions?.map((p) => p.capability),
      },
    });

    return NextResponse.json(
      {
        access: {
          accountId,
          memberId,
          roleId: updates.roleId,
          permissions: updates.permissions?.map((p) => p.capability),
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
