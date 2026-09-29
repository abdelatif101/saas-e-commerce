import type { Capability } from "@/shared/contracts/core-types";

export type PluginLifecycle = "active" | "inactive" | "deprecated";

export interface PluginManifest {
  id: string;
  version: string;
  permissions: Capability[];
  lifecycle: PluginLifecycle;
  hooks: PluginLifecycleHook[];
  contracts: PluginContractDeclaration[];
}

export interface PluginLifecycleHook {
  hook: "install" | "enable" | "disable" | "uninstall";
  handlerId: string;
}

export interface PluginContractDeclaration {
  type: "consumed" | "provided";
  capability: Capability;
}

let _knownPlugins: PluginManifest[] = [];

export function getKnownPlugins(): readonly PluginManifest[] {
  return _knownPlugins;
}

export function registerPluginManifest(manifest: PluginManifest): void {
  const existingIndex = _knownPlugins.findIndex((p) => p.id === manifest.id);
  if (existingIndex >= 0) {
    _knownPlugins[existingIndex] = manifest;
  } else {
    _knownPlugins.push(manifest);
  }
}

export function getPluginManifest(pluginId: string): PluginManifest | undefined {
  return _knownPlugins.find((p) => p.id === pluginId);
}

export function resetPluginManifests(): void {
  _knownPlugins = [];
}
