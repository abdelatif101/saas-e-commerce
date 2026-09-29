import { describe, expect, it, beforeEach } from "vitest";
import {
  registerPluginManifest,
  resetPluginManifests,
} from "@/plugins/integrations/plugin-manifest";
import {
  resolveCapability,
  resolveCapabilities,
} from "@/plugins/integrations/capability-resolver";
import { createJobEnvelope, incrementAttempt } from "@/shared/jobs/job-envelope";
import {
  computeNextAttemptDelay,
  shouldDeadLetter,
  shouldRetry,
} from "@/shared/jobs/job-policy";
import type { AccountId, JobId } from "@/shared/contracts/core-types";

const accountId = "acc_1" as AccountId;

describe("plugin capability resolver", () => {
  beforeEach(() => {
    resetPluginManifests();
  });

  it("loads only the requested capability without scanning all plugins", () => {
    registerPluginManifest({
      id: "telegram",
      version: "1.0.0",
      permissions: ["integration.manage"],
      lifecycle: "active",
      hooks: [],
      contracts: [],
    });

    const resolved = resolveCapability("integration.manage", "telegram");
    expect(resolved).toBeDefined();
    expect(resolved?.plugin.id).toBe("telegram");
    expect(resolved?.capability).toBe("integration.manage");
  });

  it("returns undefined for unauthorized plugin capability", () => {
    registerPluginManifest({
      id: "telegram",
      version: "1.0.0",
      permissions: ["integration.manage"],
      lifecycle: "active",
      hooks: [],
      contracts: [],
    });

    const resolved = resolveCapability("ai.assist", "telegram");
    expect(resolved).toBeUndefined();
  });

  it("resolves multiple requested capabilities", () => {
    registerPluginManifest({
      id: "ai",
      version: "1.0.0",
      permissions: ["ai.assist", "ai.manage"],
      lifecycle: "active",
      hooks: [],
      contracts: [],
    });

    const resolved = resolveCapabilities(["ai.assist", "ai.manage"]);
    expect(resolved).toHaveLength(2);
  });
});

describe("async job contracts", () => {
  it("creates an idempotent job envelope", () => {
    const envelope = createJobEnvelope(
      "send-message",
      "job_1" as JobId,
      accountId,
      "idem_1",
      { text: "hello" }
    );
    expect(envelope.jobType).toBe("send-message");
    expect(envelope.idempotencyKey).toBe("idem_1");
    expect(envelope.attempt).toBe(1);
    expect(envelope.scheduledAt).toBeInstanceOf(Date);
  });

  it("increments attempts", () => {
    const envelope = createJobEnvelope(
      "send-message",
      "job_1" as JobId,
      accountId,
      "idem_1",
      {}
    );
    const next = incrementAttempt(envelope);
    expect(next.attempt).toBe(2);
    expect(next.jobId).toBe(envelope.jobId);
  });

  it("computes exponential backoff", () => {
    const envelope = createJobEnvelope(
      "send-message",
      "job_1" as JobId,
      accountId,
      "idem_1",
      {}
    );
    const next = incrementAttempt(envelope);
    const delay = computeNextAttemptDelay(
      {
        maxAttempts: 5,
        timeoutMs: 30_000,
        backoff: "exponential",
        baseDelayMs: 100,
      },
      next
    );
    expect(delay).toBe(200);
  });

  it("stops retrying after max attempts and dead-letters", () => {
    const envelope = createJobEnvelope(
      "send-message",
      "job_1" as JobId,
      accountId,
      "idem_1",
      {}
    );
    let current = envelope;
    for (let i = 1; i < 3; i++) {
      current = incrementAttempt(current);
    }
    expect(shouldRetry({ maxAttempts: 3, timeoutMs: 1, backoff: "fixed", baseDelayMs: 1 }, current)).toBe(false);
    expect(shouldDeadLetter({ maxAttempts: 3, timeoutMs: 1, backoff: "fixed", baseDelayMs: 1 }, current)).toBe(true);
  });
});
