import type { AccountId } from "@/shared/contracts/core-types";

export type RoleName = "Owner" | "Admin" | "Member";

export interface RoleProps {
  id: string;
  accountId: AccountId;
  name: RoleName;
  isSystemRole?: boolean;
}

export class Role {
  readonly id: string;
  readonly accountId: AccountId;
  readonly name: RoleName;
  readonly isSystemRole: boolean;

  constructor(props: RoleProps) {
    if (!props.name) {
      throw new Error("Role name is required");
    }
    this.id = props.id;
    this.accountId = props.accountId;
    this.name = props.name;
    this.isSystemRole = props.isSystemRole ?? true;
  }

  static ownerRoleId(): string {
    return "role_owner";
  }

  static adminRoleId(): string {
    return "role_admin";
  }

  static memberRoleId(): string {
    return "role_member";
  }
}
