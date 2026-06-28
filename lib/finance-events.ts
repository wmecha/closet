/**
 * Finance event emitter for SHAWN/Closet. Sends normalized financial events
 * to the WM Finance intake API. SHAWN never writes directly to Finance tables.
 *
 * Idempotency: each call carries a deterministic key derived from the source
 * event ID so duplicate webhook deliveries are safely de-duplicated by Finance.
 */

export type ShawnFinanceEventType =
  | 'order.payment_succeeded'
  | 'order.payment_failed'
  | 'order.cancelled'
  | 'refund.issued'
  | 'payment.fee'

export interface ShawnPaymentContext {
  paystackEventId: string
  orderReference: string
  orderId: string
  currency: string
  grossAmount: number      // major currency units
  feeAmount?: number
  customerEmail?: string
  customerExternalId?: string
  productExternalIds?: string[]   // for one-of-one items: product/drop IDs
  dropId?: string
  occurredAt: string
}

const FINANCE_URL = process.env.FINANCE_EVENT_INTAKE_URL ?? ''
const FINANCE_SECRET = process.env.FINANCE_EVENT_INGEST_SECRET ?? ''

function idempotencyKey(eventType: ShawnFinanceEventType, sourceEventId: string): string {
  return `shawn:${eventType}:${sourceEventId}`
}

export async function emitShawnFinanceEvent(
  eventType: ShawnFinanceEventType,
  ctx: ShawnPaymentContext,
  rawPayload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  if (!FINANCE_URL || !FINANCE_SECRET) {
    console.warn('[finance-events] FINANCE_EVENT_INTAKE_URL or FINANCE_EVENT_INGEST_SECRET not set')
    return { ok: false, error: 'finance_not_configured' }
  }

  const netAmount = ctx.feeAmount != null ? ctx.grossAmount - ctx.feeAmount : ctx.grossAmount

  const body = {
    eventType,
    eventVersion: '1',
    sourceSystemCode: 'SHAWN',
    ventureCode: 'SHAWN',
    legalEntityCode: 'COGNEXA',
    currency: ctx.currency,
    grossAmount: ctx.grossAmount,
    netAmount,
    feeAmount: ctx.feeAmount ?? null,
    idempotencyKey: idempotencyKey(eventType, ctx.paystackEventId),
    sourceEventId: ctx.paystackEventId,
    externalId: ctx.orderReference,
    occurredAt: ctx.occurredAt,
    customerExternalId: ctx.customerExternalId ?? ctx.customerEmail ?? undefined,
    projectExternalId: ctx.orderId,
    productExternalId: ctx.productExternalIds?.[0] ?? undefined,
    rawPayload,
  }

  try {
    const res = await fetch(`${FINANCE_URL}/api/events/intake`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FINANCE_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'shawn-finance-emitter/1',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })

    if (res.status === 409) return { ok: true }   // duplicate, already recorded

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[finance-events] intake error', res.status, text)
      return { ok: false, error: `http_${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[finance-events] emit failed:', msg)
    return { ok: false, error: msg }
  }
}
