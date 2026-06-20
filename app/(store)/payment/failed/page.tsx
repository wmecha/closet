import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/shawn/eyebrow";
import { ShawnButton } from "@/components/shawn/button";
import { confirmPaymentByReference } from "@/lib/store/orders";

export const metadata: Metadata = {
  title: "Payment not completed",
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? "";

  // Make sure any hold is released so the piece returns to the edit.
  if (reference) {
    await confirmPaymentByReference(reference);
  }

  return (
    <section className="shawn-section">
      <div className="shawn-narrow" style={{ textAlign: "center" }}>
        <Eyebrow>Payment not completed</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-m)", margin: "16px 0 0" }}
        >
          Your payment was not completed.
        </h1>
        <p
          className="shawn-body"
          style={{ marginTop: "20px", fontSize: "var(--fs-body-lg)" }}
        >
          No charge was made. Your bag is still here whenever you are ready. If
          something went wrong, please reach us and we will help.
        </p>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/checkout">
            <ShawnButton>Try again</ShawnButton>
          </Link>
          <Link href="/contact">
            <ShawnButton variant="secondary">Contact us</ShawnButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
