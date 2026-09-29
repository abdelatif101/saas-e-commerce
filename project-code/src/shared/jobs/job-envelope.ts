import type {
  AccountId,
  JobId,
  WorkflowId,
} from "@/shared/contracts/core-types";

export interface JobEnvelope<TPayload = unknown> {
  jobType: string;
  jobId: JobId;
  accountId: AccountId;
  workflowId?: WorkflowId;
  idempotencyKey: string;
  payload: TPayload;
  attempt: number;
  scheduledAt: Date;
}

export function createJobEnvelope<TPayload>(
  jobType: string,
  jobId: JobId,
  accountId: AccountId,
  idempotencyKey: string,
  payload: TPayload,
  options?: { workflowId?: WorkflowId; scheduledAt?: Date }
): JobEnvelope<TPayload> {
  return {
    jobType,
    jobId,
    accountId,
    workflowId: options?.workflowId,
    idempotencyKey,
    payload,
    attempt: 1,
    scheduledAt: options?.scheduledAt ?? new Date(),
  };
}

export function incrementAttempt<TPayload>(
  envelope: JobEnvelope<TPayload>
): JobEnvelope<TPayload> {
  return {
    ...envelope,
    attempt: envelope.attempt + 1,
  };
}
