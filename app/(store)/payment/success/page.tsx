import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ShawnButton } from "@/components/shawn/button";
import { ClearCart } from "@/components/shawn/clear-cart";
import { confirmPaymentByReference } from "@/lib/store/orders";
import { formatKsh } from "@/lib/format";

export const metadata: Metadata = {
  title: "Thank you",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref ?? "";

  const result = reference
    ? await confirmPaymentByReference(reference)
    : { status: "not_found" as const, order: null };

  if (result.status === "paid" && result.order) {
    const order = result.order;
    return (
      <section className="shawn-section">
        <ClearCart when />
        <div className="shawn-narrow" style={{ textAlign: "center" }}>
          <Eyebrow>Order confirmed</Eyebrow>
          <h1
            className="shawn-display"
            style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 0" }}
          >
            Thank you for choosing SHAWN.
          </h1>
          <p
            className="shawn-body"
            style={{ marginTop: "20px", fontSize: "var(--fs-body-lg)" }}
          >
            Your payment is confirmed and your piece is now yours alone. We will
            be in touch about delivery. Wear it well.
          </p>

          <div
            style={{
              marginTop: "40px",
              textAlign: "left",
              border: "1px solid var(--line-hairline)",
              background: "var(--surface-card)",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "var(--fs-micro)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              <span>Reference</span>
              <span>{order.paystackReference}</span>
            </div>
            <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.titleSnapshot}
                  </span>
                  <span>{formatKsh(item.priceSnapshot)}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--line-hairline)",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-title)",
              }}
            >
              <span>Total paid</span>
              <span>{formatKsh(order.total)}</span>
            </div>
          </div>

          <div style={{ marginTop: "32px" }}>
            <Link href="/shop">
              <ShawnButton variant="secondary">Continue the edit</ShawnButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (result.status === "pending") {
    return (
      <section className="shawn-section">
        <div className="shawn-narrow" style={{ textAlign: "center" }}>
          <Eyebrow>Almost there</Eyebrow>
          <h1
            className="shawn-display"
            style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 0" }}
          >
            We are confirming your payment.
          </h1>
          <p className="shawn-body" style={{ marginTop: "20px" }}>
            This usually takes a moment. Refresh this page shortly, or reach us
            if it does not update. Your reference is {reference}.
          </p>
          <div style={{ marginTop: "28px" }}>
            <Link
              href={`/payment/success?reference=${encodeURIComponent(reference)}`}
            >
              <ShawnButton>Refresh status</ShawnButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // failed or not found
  return (
    <section className="shawn-section">
      <div className="shawn-narrow" style={{ textAlign: "center" }}>
        <Eyebrow>Payment not completed</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 0" }}
        >
          That payment did not go through.
        </h1>
        <p className="shawn-body" style={{ marginTop: "20px" }}>
          No charge was made and nothing was reserved. You are welcome to try
          again. Each piece remains one of one.
        </p>
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <Link href="/checkout">
            <ShawnButton>Try again</ShawnButton>
          </Link>
          <Link href="/shop">
            <ShawnButton variant="secondary">Back to the edit</ShawnButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
