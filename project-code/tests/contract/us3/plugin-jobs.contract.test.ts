import { describe, expect, it } from "vitest";
import { PluginConnection } from "@/core/workflow/domain/plugin-connection";
import { executeMerchantCommand } from "@/plugins/telegram/application/execute-merchant-command";
import { createJobEnvelope } from "@/shared/jobs/job-envelope";
import {
  computeNextAttemptDelay,
  shouldDeadLetter,
  shouldRetry,
} from "@/shared/jobs/job-policy";
import type { AccountId, JobId, MemberId, PluginId, WorkflowId } from "@/shared/contracts/core-types";

const accountId = "acc_plugin_1" as AccountId;
const workflowId = "wf_plugin_1" as WorkflowId;
const memberId = "mem_plugin_1" as MemberId;

function makePluginConnection(status: "connected" | "disconnected") {
  return new PluginConnection({
    id: "conn_1",
    workflowId,
    pluginId: "telegram" as PluginId,
    status,
  });
}

describe("Plugin execution envelope contract", () => {
  it("allows authorized plugin command", () => {
    const result = executeMerchantCommand({
      pluginConnection: makePluginConnection("connected"),
      actorMemberId: memberId,
      workflowId,
      accountId,
      identityRef: "telegram:user_1",
      capabilities: ["order.manage"],
      workflowAccess: [workflowId],
      command: { command: "create-order", args: { productId: "prod_1" } },
      requiredCapability: "order.manage",
    });

    expect(result.allowed).toBe(true);
  });

  it("denies plugin command when plugin is disconnected", () => {
    const result = executeMerchantCommand({
      pluginConnection: makePluginConnection("disconnected"),
      actorMemberId: memberId,
      workflowId,
      accountId,
      identityRef: "telegram:user_1",
      capabilities: ["order.manage"],
      workflowAccess: [workflowId],
      command: { command: "create-order", args: {} },
      requiredCapability: "order.manage",
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Disconnected");
  });

  it("denies plugin command when member lacks capability", () => {
    const result = executeMerchantCommand({
      pluginConnection: makePluginConnection("connected"),
      actorMemberId: memberId,
      workflowId,
      accountId,
      identityRef: "telegram:user_1",
      capabilities: ["product.manage"],
      workflowAccess: [workflowId],
      command: { command: "create-order", args: {} },
      requiredCapability: "order.manage",
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Missing required capability");
  });
});

describe("Async job policy contract", () => {
  it("defines retry and dead-letter behavior", () => {
    const envelope = createJobEnvelope(
      "telegram-outbound",
      "job_plugin_1" as JobId,
      accountId,
      "idem_plugin_1",
      { command: "notify" }
    );

    const retryPolicy = {
      maxAttempts: 3,
      timeoutMs: 10_000,
      backoff: "exponential" as const,
      baseDelayMs: 100,
    };

    expect(shouldRetry(retryPolicy, envelope)).toBe(true);

    let current = envelope;
    for (let i = 1; i < 3; i++) {
      current = { ...current, attempt: current.attempt + 1 };
    }

    expect(shouldRetry(retryPolicy, current)).toBe(false);
    expect(shouldDeadLetter(retryPolicy, current)).toBe(true);
  });

  it("computes exponential backoff delays", () => {
    const envelope = createJobEnvelope(
      "telegram-outbound",
      "job_plugin_2" as JobId,
      accountId,
      "idem_plugin_2",
      {}
    );

    const attempt2 = { ...envelope, attempt: 2 };
    const attempt3 = { ...envelope, attempt: 3 };

    expect(computeNextAttemptDelay({ maxAttempts: 5, timeoutMs: 1, backoff: "exponential", baseDelayMs: 100 }, attempt2)).toBe(200);
    expect(computeNextAttemptDelay({ maxAttempts: 5, timeoutMs: 1, backoff: "exponential", baseDelayMs: 100 }, attempt3)).toBe(400);
  });
});
