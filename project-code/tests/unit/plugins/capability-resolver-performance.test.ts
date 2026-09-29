import { describe, expect, it, beforeEach } from "vitest";
import {
  registerPluginManifest,
  resetPluginManifests,
} from "@/plugins/integrations/plugin-manifest";
import { resolveCapability } from "@/plugins/integrations/capability-resolver";

describe("capability resolver performance", () => {
  beforeEach(() => {
    resetPluginManifests();
  });

  it("does not scan all plugins when resolving a specific capability", () => {
    // Register many plugins to simulate a large manifest.
    for (let i = 0; i < 100; i++) {
      registerPluginManifest({
        id: `plugin-${i}`,
        version: "1.0.0",
        permissions: i === 50 ? ["ai.assist"] : ["integration.manage"],
        lifecycle: "active",
        hooks: [],
        contracts: [],
      });
    }

    const start = performance.now();
    const resolved = resolveCapability("ai.assist", "plugin-50");
    const elapsed = performance.now() - start;

    expect(resolved).toBeDefined();
    expect(resolved?.plugin.id).toBe("plugin-50");

    // With a targeted pluginId the resolver must go directly to the manifest.
    // Budget: < 1ms for direct lookup even with 100 registered plugins.
    expect(elapsed).toBeLessThan(1);
  });

  it("stops at first matching capability for non-targeted resolution", () => {
    for (let i = 0; i < 100; i++) {
      registerPluginManifest({
        id: `plugin-${i}`,
        version: "1.0.0",
        permissions:
          i === 5 ? ["ai.assist"] : ["integration.manage"],
        lifecycle: "active",
        hooks: [],
        contracts: [],
      });
    }

    const start = performance.now();
    const resolved = resolveCapability("ai.assist");
    const elapsed = performance.now() - start;

    expect(resolved).toBeDefined();
    expect(resolved?.plugin.id).toBe("plugin-5");

    // Budget: < 1ms for first-match scan of 100 plugins.
    expect(elapsed).toBeLessThan(1);
  });
});
