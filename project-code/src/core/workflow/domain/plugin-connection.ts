import { DataModelConstraints } from "@/shared/contracts/data-model-constraints";
import type { PluginId, WorkflowId } from "@/shared/contracts/core-types";

export type PluginConnectionStatus = "connected" | "disconnected" | "pending";

export interface PluginConnectionProps {
  id: string;
  workflowId: WorkflowId;
  pluginId: PluginId;
  status?: PluginConnectionStatus;
  externalAccountRef?: string;
  permissionsScope?: string[];
  connectedAt?: Date;
  updatedAt?: Date;
}

export class PluginConnection {
  readonly id: string;
  readonly workflowId: WorkflowId;
  readonly pluginId: PluginId;
  status: PluginConnectionStatus;
  readonly externalAccountRef: string | undefined;
  readonly permissionsScope: readonly string[];
  readonly connectedAt: Date;
  readonly updatedAt: Date;

  constructor(props: PluginConnectionProps) {
    this.id = props.id;
    this.workflowId = props.workflowId;
    this.pluginId = props.pluginId;
    this.status = props.status ?? "pending";
    this.externalAccountRef = props.externalAccountRef;
    this.permissionsScope = props.permissionsScope ?? [];
    this.connectedAt = props.connectedAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  canExecute(): boolean {
    if (DataModelConstraints.disconnectedPluginCannotExecute) {
      return this.status === "connected";
    }
    return true;
  }
}
