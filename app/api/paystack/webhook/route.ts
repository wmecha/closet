import { NextResponse } from "next/server";
import {
  createAdminClient,
  isStoreBackendConfigured,
} from "@/lib/supabase/admin";
import {
  getPaystackSecretKey,
  isSuccessfulCharge,
  verifyWebhookSignature,
} from "@/lib/paystack";
import { mapOrder } from "@/lib/store/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack webhook. This is the authoritative confirmation path: even if the
 * customer closes the browser before the callback, the webhook still settles
 * the order. The signature is verified before anything is trusted, and the
 * underlying SQL functions are idempotent so duplicate events are safe.
 */
export async function POST(request: Request) {
  const secretKey = getPaystackSecretKey();
  if (!secretKey || !isStoreBackendConfigured()) {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature, secretKey)) {
    return NextResponse.json({ status: "invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: "bad payload" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ status: "no reference" }, { status: 200 });
  }

  const supabase = createAdminClient();
  const { data: orderRow } = await supabase
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (!orderRow) {
    return NextResponse.json({ status: "unknown order" }, { status: 200 });
  }

  const order = mapOrder(orderRow);

  if (event.event === "charge.success") {
    // Re-check the amount and currency reported in the event before settling.
    if (
      isSuccessfulCharge(
        {
          status: event.data?.status ?? "success",
          amount: event.data?.amount ?? 0,
          currency: event.data?.currency ?? order.currency,
        },
        order.total,
        order.currency,
      )
    ) {
      await supabase.rpc("mark_order_paid", { p_reference: reference });
    }
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  if (event.event === "charge.failed") {
    await supabase.rpc("release_order", {
      p_reference: reference,
      p_status: "failed",
    });
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  return NextResponse.json({ status: "ignored" }, { status: 200 });
}
