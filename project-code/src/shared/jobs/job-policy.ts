import type { JobEnvelope } from "./job-envelope";

export type BackoffStrategy = "fixed" | "exponential";

export interface RetryPolicy {
  maxAttempts: number;
  timeoutMs: number;
  backoff: BackoffStrategy;
  baseDelayMs: number;
  retryableErrors?: string[];
}

export interface DeadLetterConfig {
  queueName: string;
  preserveContext: boolean;
}

export interface JobTypePolicy {
  jobType: string;
  delivery: "at-least-once";
  idempotent: boolean;
  retry: RetryPolicy;
  deadLetter: DeadLetterConfig;
}

export function computeNextAttemptDelay(
  policy: RetryPolicy,
  envelope: JobEnvelope
): number {
  if (policy.backoff === "exponential") {
    return policy.baseDelayMs * 2 ** (envelope.attempt - 1);
  }
  return policy.baseDelayMs;
}

export function shouldRetry(
  policy: RetryPolicy,
  envelope: JobEnvelope,
  errorType?: string
): boolean {
  if (envelope.attempt >= policy.maxAttempts) {
    return false;
  }

  if (
    policy.retryableErrors &&
    errorType &&
    !policy.retryableErrors.includes(errorType)
  ) {
    return false;
  }

  return true;
}

export function shouldDeadLetter(
  policy: RetryPolicy,
  envelope: JobEnvelope
): boolean {
  return envelope.attempt >= policy.maxAttempts;
}
