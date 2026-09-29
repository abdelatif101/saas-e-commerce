import { authorizeOperation, type AuthorizationContext, type ResourceRequest } from "@/core/authorization/application/authorize-operation";
import type { PluginConnection } from "@/core/workflow/domain/plugin-connection";
import type { Capability, MemberId, WorkflowId } from "@/shared/contracts/core-types";

export interface PluginCommandPayload {
  command: string;
  args: Record<string, unknown>;
}

export interface ExecuteMerchantCommandInput {
  pluginConnection: PluginConnection;
  actorMemberId: MemberId;
  workflowId: WorkflowId;
  accountId: string;
  identityRef: string;
  capabilities: Capability[];
  workflowAccess: WorkflowId[];
  command: PluginCommandPayload;
  requiredCapability: Capability;
}

export interface ExecuteMerchantCommandResult {
  allowed: boolean;
  reason?: string;
  command: PluginCommandPayload;
  executedAt: Date;
}

export function executeMerchantCommand(
  input: ExecuteMerchantCommandInput
): ExecuteMerchantCommandResult {
  if (!input.pluginConnection.canExecute()) {
    return {
      allowed: false,
      reason: "Disconnected plugin cannot execute operations",
      command: input.command,
      executedAt: new Date(),
    };
  }

  const authContext: AuthorizationContext = {
    identityRef: input.identityRef,
    accountId: input.accountId,
    memberId: input.actorMemberId,
    capabilities: input.capabilities,
    workflowAccess: input.workflowAccess,
  };

  const resourceRequest: ResourceRequest = {
    accountId: input.accountId,
    workflowId: input.workflowId,
    requiredCapability: input.requiredCapability,
  };

  const authResult = authorizeOperation(authContext, resourceRequest);

  return {
    allowed: authResult.allowed,
    reason: authResult.reason,
    command: input.command,
    executedAt: new Date(),
  };
}
