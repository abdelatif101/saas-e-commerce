import { createAccount } from "@/core/account/application/create-account";
import { NextResponse } from "next/server";
import type { AccountId, MemberId } from "@/shared/contracts/core-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name: string;
      ownerIdentityRef?: string;
      ownerEmail?: string;
    };

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Account name is required" }, { status: 400 });
    }

    const result = createAccount({
      id: crypto.randomUUID() as AccountId,
      name: body.name,
      ownerIdentityRef: body.ownerIdentityRef ?? "anonymous",
      ownerEmail: body.ownerEmail ?? "",
      ownerMemberId: crypto.randomUUID() as MemberId,
      subscriptionId: crypto.randomUUID(),
      maxWorkflows: 1,
    });

    return NextResponse.json(
      {
        account: {
          id: result.account.id,
          name: result.account.name,
          status: result.account.status,
          createdAt: result.account.createdAt,
        },
        subscription: {
          id: result.subscription.id,
          maxWorkflows: result.subscription.maxWorkflows,
          status: result.subscription.status,
        },
        ownerMember: {
          id: result.ownerMember.id,
          email: result.ownerMember.email,
          roleId: result.ownerMember.roleId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
