import crypto from "node:crypto";

/**
 * Paystack integration helpers.
 *
 * Money in this app is stored as whole Kenyan Shillings (KES). Paystack expects
 * the amount in the currency subunit, so KES is multiplied by 100. All secret
 * key usage is server side only. Never trust a client reported success: every
 * confirmation runs through verifyTransaction or a signed webhook.
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export type PaystackConfig = {
  secretKey: string;
  publicKey: string;
};

export function getPaystackSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY;
}

export function isPaystackConfigured(): boolean {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  );
}

/** Convert whole shillings to the Paystack subunit (cents). */
export function toSubunit(kes: number): number {
  return Math.round(kes * 100);
}

/** Convert a Paystack subunit amount back to whole shillings. */
export function fromSubunit(subunit: number): number {
  return Math.round(subunit / 100);
}

export type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  gateway_response?: string;
  paid_at?: string | null;
  customer?: { email?: string };
};

/**
 * Pure decision helper, kept free of any network call so it can be unit tested.
 * A charge only counts as successful when Paystack reports "success", the
 * currency matches, and the amount paid is at least the order total. We accept
 * a higher amount defensively but never a lower one.
 */
export function isSuccessfulCharge(
  data:
    | Pick<PaystackVerifyData, "status" | "amount" | "currency">
    | null
    | undefined,
  expectedKes: number,
  currency = "KES",
): boolean {
  if (!data) return false;
  if (data.status !== "success") return false;
  if ((data.currency ?? "").toUpperCase() !== currency.toUpperCase())
    return false;
  return data.amount >= toSubunit(expectedKes);
}

/**
 * Verify a Paystack webhook signature. Paystack signs the raw request body with
 * HMAC SHA512 using the secret key and sends it as x-paystack-signature.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secretKey: string,
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export type InitializeParams = {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type InitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(
  params: InitializeParams,
): Promise<InitializeResult> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: toSubunit(params.amountKes),
      currency: params.currency ?? "KES",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status) {
    throw new Error(
      payload?.message ?? "Could not start the Paystack transaction.",
    );
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    reference: payload.data.reference,
  };
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerifyData> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status) {
    throw new Error(
      payload?.message ?? "Could not verify the Paystack transaction.",
    );
  }

  return payload.data as PaystackVerifyData;
}

/** A unique, readable Paystack reference for an order. */
export function generateReference(): string {
  return `SHAWN-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}
