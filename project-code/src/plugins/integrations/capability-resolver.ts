import type { Capability } from "@/shared/contracts/core-types";
import {
  getKnownPlugins,
  getPluginManifest,
  type PluginManifest,
} from "./plugin-manifest";

export interface ResolvedCapability {
  capability: Capability;
  plugin: PluginManifest;
  handlerId: string;
}

export function resolveCapability(
  capability: Capability,
  requestedPluginId?: string
): ResolvedCapability | undefined {
  if (requestedPluginId) {
    const plugin = getPluginManifest(requestedPluginId);
    if (!plugin) return undefined;
    if (!plugin.permissions.includes(capability)) return undefined;
    return {
      capability,
      plugin,
      handlerId: `${plugin.id}:${capability}`,
    };
  }

  for (const plugin of getActivePlugins()) {
    if (plugin.permissions.includes(capability)) {
      return {
        capability,
        plugin,
        handlerId: `${plugin.id}:${capability}`,
      };
    }
  }

  return undefined;
}

export function resolveCapabilities(
  capabilities: Capability[],
  requestedPluginId?: string
): ResolvedCapability[] {
  const resolved: ResolvedCapability[] = [];
  for (const capability of capabilities) {
    const result = resolveCapability(capability, requestedPluginId);
    if (result) resolved.push(result);
  }
  return resolved;
}

function getActivePlugins(): PluginManifest[] {
  return getKnownPlugins().filter((p) => p.lifecycle === "active");
}
