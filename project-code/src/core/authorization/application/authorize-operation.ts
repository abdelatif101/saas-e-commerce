import type {
  AccountId,
  Capability,
  MemberId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export interface AuthorizationContext {
  identityRef: string;
  accountId: AccountId;
  memberId: MemberId;
  capabilities: Capability[];
  workflowAccess: WorkflowId[];
}

export interface ResourceRequest {
  accountId: AccountId;
  workflowId?: WorkflowId;
  requiredCapability: Capability;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

export function authorizeOperation(
  ctx: AuthorizationContext,
  request: ResourceRequest
): AuthorizationResult {
  if (ctx.accountId !== request.accountId) {
    return {
      allowed: false,
      reason: "Identity is not a member of the requested account",
    };
  }

  if (!ctx.capabilities.includes(request.requiredCapability)) {
    return {
      allowed: false,
      reason: `Missing required capability: ${request.requiredCapability}`,
    };
  }

  if (request.workflowId) {
    if (!ctx.workflowAccess.includes(request.workflowId)) {
      return {
        allowed: false,
        reason: "Member does not have access to the requested workflow",
      };
    }
  }

  return { allowed: true };
}
