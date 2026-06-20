import {
  createAdminClient,
  isStoreBackendConfigured,
} from "@/lib/supabase/admin";
import {
  generateReference,
  initializeTransaction,
  isPaystackConfigured,
  isSuccessfulCharge,
  verifyTransaction,
} from "@/lib/paystack";
import { mapOrder } from "./mappers";
import type { CheckoutInput } from "./schema";
import type { Order } from "./types";

export type CheckoutResult =
  | { ok: true; authorizationUrl: string; reference: string }
  | { ok: false; error: string; soldOut?: boolean };

/**
 * Translate a Postgres conflict raised by begin_checkout into calm,
 * customer-facing copy. The function tags conflicts as SOLD: / RESERVED: /
 * UNAVAILABLE: followed by the piece title.
 */
function describeConflict(message: string): string | null {
  const match = /(SOLD|RESERVED|UNAVAILABLE):(.*)/.exec(message);
  if (!match) return null;
  const title = match[2].trim();
  if (match[1] === "RESERVED") {
    return `${title} is in someone else's bag right now. Each piece is one of one, so it may not come back.`;
  }
  return `${title} has just been taken. Each piece is one of one, so it is no longer available.`;
}

/**
 * Reserve the cart server side, create an awaiting_payment order, and start a
 * Paystack transaction. The reservation and order creation are atomic in the
 * database, so two shoppers can never hold the same one of one piece.
 */
export async function createOrderAndInitialize(
  input: CheckoutInput,
  appUrl: string,
): Promise<CheckoutResult> {
  if (!isStoreBackendConfigured()) {
    return {
      ok: false,
      error: "Online checkout is not configured yet. Please order on WhatsApp.",
    };
  }
  if (!isPaystackConfigured()) {
    return {
      ok: false,
      error: "Payments are not configured yet. Please order on WhatsApp.",
    };
  }

  const supabase = createAdminClient();
  const reference = generateReference();

  const { data, error } = await supabase.rpc("begin_checkout", {
    p_product_ids: input.productIds,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_delivery_location: input.deliveryLocation,
    p_delivery_notes: input.deliveryNotes ?? "",
    p_reference: reference,
    p_reserve_minutes: 15,
  });

  if (error) {
    const friendly = describeConflict(error.message);
    if (friendly) return { ok: false, error: friendly, soldOut: true };
    return {
      ok: false,
      error: "We could not start your checkout. Please try again.",
    };
  }

  const order = mapOrder(data as Record<string, unknown>);

  try {
    const init = await initializeTransaction({
      email: order.customerEmail,
      amountKes: order.total,
      reference,
      callbackUrl: `${appUrl}/payment/success?reference=${encodeURIComponent(reference)}`,
      metadata: {
        order_id: order.id,
        customer_name: order.customerName,
        delivery_location: order.deliveryLocation,
      },
    });

    await supabase
      .from("orders")
      .update({ paystack_access_code: init.accessCode })
      .eq("id", order.id);

    return { ok: true, authorizationUrl: init.authorizationUrl, reference };
  } catch {
    // Could not reach Paystack: release the hold so the piece is buyable again.
    await supabase.rpc("release_order", {
      p_reference: reference,
      p_status: "failed",
    });
    return {
      ok: false,
      error: "We could not reach the payment provider. Please try again.",
    };
  }
}

export type ConfirmResult = {
  status: "paid" | "failed" | "pending" | "not_found";
  order: Order | null;
};

/**
 * Authoritative, server-side confirmation. Verifies the transaction with
 * Paystack and only then marks the order paid and the piece sold. Idempotent:
 * safe to call from both the success callback and the webhook.
 */
export async function confirmPaymentByReference(
  reference: string,
): Promise<ConfirmResult> {
  if (!isStoreBackendConfigured() || !isPaystackConfigured()) {
    return { status: "not_found", order: null };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (!existing) return { status: "not_found", order: null };

  let order = mapOrder(existing);

  // Already settled: no need to call Paystack again.
  if (order.status === "paid" || order.status === "fulfilled") {
    return { status: "paid", order };
  }

  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch {
    return { status: "pending", order };
  }

  if (isSuccessfulCharge(verified, order.total, order.currency)) {
    const { data: paid } = await supabase.rpc("mark_order_paid", {
      p_reference: reference,
    });
    if (paid) order = mapOrder(paid as Record<string, unknown>);
    return { status: "paid", order };
  }

  // Abandoned or failed at the gateway: release the hold, never mark sold.
  if (verified.status === "failed" || verified.status === "abandoned") {
    const { data: released } = await supabase.rpc("release_order", {
      p_reference: reference,
      p_status: "failed",
    });
    if (released) order = mapOrder(released as Record<string, unknown>);
    return { status: "failed", order };
  }

  return { status: "pending", order };
}

export async function getOrderByReference(
  reference: string,
): Promise<Order | null> {
  if (!isStoreBackendConfigured()) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("paystack_reference", reference)
    .maybeSingle();
  return data ? mapOrder(data) : null;
}
