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
import { emitShawnFinanceEvent } from "@/lib/finance-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack webhook. Authoritative payment confirmation path — runs even if
 * the customer closes the browser before the success redirect. Signature
 * verified before any trust is granted. SQL functions are idempotent.
 * After settling the order, a normalized Finance event is emitted to WM
 * Finance for revenue recognition and reconciliation.
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
    id?: string | number;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      currency?: string;
      fees?: number;
      customer?: { email?: string; customer_code?: string };
      metadata?: Record<string, unknown>;
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

  const paystackEventId = String(event.id ?? `${event.event}:${reference}`);
  const occurredAt = new Date().toISOString();

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
    const grossMinor = event.data?.amount ?? 0;
    const feeMinor = event.data?.fees ?? 0;
    const currency = (event.data?.currency ?? order.currency).toUpperCase();

    const isValid = isSuccessfulCharge(
      {
        status: event.data?.status ?? "success",
        amount: grossMinor,
        currency: event.data?.currency ?? order.currency,
      },
      order.total,
      order.currency,
    );

    if (isValid) {
      await supabase.rpc("mark_order_paid", { p_reference: reference });

      // Emit Finance event — non-blocking, failure does not affect order state
      await emitShawnFinanceEvent(
        "order.payment_succeeded",
        {
          paystackEventId,
          orderReference: reference,
          orderId: String(order.id),
          currency,
          grossAmount: grossMinor / 100,
          feeAmount: feeMinor > 0 ? feeMinor / 100 : undefined,
          customerEmail: event.data?.customer?.email,
          customerExternalId: event.data?.customer?.customer_code,
          occurredAt,
        },
        event.data ?? {},
      );
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  if (event.event === "charge.failed") {
    await supabase.rpc("release_order", {
      p_reference: reference,
      p_status: "failed",
    });

    await emitShawnFinanceEvent(
      "order.payment_failed",
      {
        paystackEventId,
        orderReference: reference,
        orderId: String(order.id),
        currency: (event.data?.currency ?? order.currency).toUpperCase(),
        grossAmount: Number(event.data?.amount ?? 0) / 100,
        customerEmail: event.data?.customer?.email,
        occurredAt,
      },
      event.data ?? {},
    );

    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  if (event.event === "refund.processed") {
    await emitShawnFinanceEvent(
      "refund.issued",
      {
        paystackEventId,
        orderReference: reference,
        orderId: String(order.id),
        currency: (event.data?.currency ?? order.currency).toUpperCase(),
        grossAmount: Number(event.data?.amount ?? 0) / 100,
        customerEmail: event.data?.customer?.email,
        occurredAt,
      },
      event.data ?? {},
    );
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  return NextResponse.json({ status: "ignored" }, { status: 200 });
}
