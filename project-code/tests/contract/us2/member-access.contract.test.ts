import { describe, expect, it } from "vitest";
import { inviteMember, assignRole, removeMember } from "@/core/account/application/manage-members";
import { grantWorkflowAccess } from "@/core/workflow/application/manage-workflow-access";
import { Member } from "@/core/account/domain/member";
import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { AccountId, MemberId, WorkflowId } from "@/shared/contracts/core-types";

const accountId = "acc_us2" as AccountId;

describe("Member invite contract", () => {
  it("creates an invited member with required fields", () => {
    const member = inviteMember({
      id: "mem_invited" as MemberId,
      accountId,
      email: "new@example.com",
      roleId: "role_member",
    });

    expect(member.email).toBe("new@example.com");
    expect(member.roleId).toBe("role_member");
    expect(member.status).toBe("invited");
    expect(member.accountId).toBe(accountId);
  });

  it("rejects invitation without email", () => {
    expect(() =>
      inviteMember({
        id: "mem_bad" as MemberId,
        accountId,
        email: "",
        roleId: "role_member",
      })
    ).toThrow("email");
  });
});

describe("Role assignment contract", () => {
  it("updates member role", () => {
    const member = new Member({
      id: "mem_role" as MemberId,
      accountId,
      userIdentityRef: "user_1",
      email: "role@example.com",
      roleId: "role_member",
      status: "active",
    });

    const updated = assignRole({ member, newRoleId: "role_admin" });
    expect(updated.roleId).toBe("role_admin");
  });
});

describe("Sole owner removal contract", () => {
  it("prevents removing the only owner", () => {
    const owner = new Member({
      id: "mem_owner" as MemberId,
      accountId,
      userIdentityRef: "owner",
      email: "owner@example.com",
      roleId: "role_owner",
      status: "active",
    });

    expect(() =>
      removeMember({
        member: owner,
        allAccountMembers: [owner],
        requesterIsOwner: true,
      })
    ).toThrow(DataModelConstraints.soleOwnerRemovalMessage);
  });
});

describe("Workflow access grant contract", () => {
  it("grants workflow access with access level", () => {
    const grant = grantWorkflowAccess({
      id: "grant_1",
      accountId,
      workflowId: "wf_a" as WorkflowId,
      memberId: "mem_1" as MemberId,
      accessLevel: "write",
      grantedByMemberId: "mem_owner" as MemberId,
    });

    expect(grant.workflowId).toBe("wf_a");
    expect(grant.accessLevel).toBe("write");
  });
});
