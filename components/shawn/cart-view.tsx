"use client";

import Link from "next/link";
import { formatKsh } from "@/lib/format";
import { useCart } from "./cart-provider";
import { ShawnButton } from "./button";
import { Eyebrow } from "./eyebrow";

export function CartView({ deliveryFee }: { deliveryFee: number }) {
  const cart = useCart();

  if (cart.hydrated && cart.items.length === 0) {
    return (
      <div
        className="shawn-narrow"
        style={{ textAlign: "center", paddingBlock: "48px" }}
      >
        <Eyebrow>Your bag</Eyebrow>
        <h1
          className="shawn-serif"
          style={{ fontSize: "var(--fs-display-m)", marginTop: "12px" }}
        >
          Your bag is empty.
        </h1>
        <p className="shawn-body" style={{ marginTop: "16px" }}>
          The edit is short and each piece is one of one. Find yours.
        </p>
        <div style={{ marginTop: "28px" }}>
          <Link href="/shop">
            <ShawnButton>Shop the edit</ShawnButton>
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.subtotal + (cart.items.length > 0 ? deliveryFee : 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: "clamp(32px, 6vw, 80px)",
      }}
      className="shawn-split"
    >
      <div>
        <Eyebrow>Your bag</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-m)", margin: "12px 0 32px" }}
        >
          {cart.count} {cart.count === 1 ? "piece" : "pieces"}
        </h1>
        {cart.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "20px",
              padding: "20px 0",
              borderTop: "1px solid var(--line-hairline)",
            }}
          >
            <div
              style={{
                width: "92px",
                aspectRatio: "3 / 4",
                background: item.imageColor ?? "var(--shawn-sand)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              {item.category ? (
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "var(--tracking-label)",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {item.category}
                </span>
              ) : null}
              <Link
                href={`/product/${item.slug}`}
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-title)",
                  marginTop: "4px",
                }}
              >
                {item.title}
              </Link>
              {item.size ? (
                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "var(--fs-caption)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Size {item.size}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => cart.remove(item.id)}
                style={{
                  marginTop: "10px",
                  fontSize: "10px",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Remove
              </button>
            </div>
            <div style={{ fontFamily: "var(--font-display)" }}>
              {formatKsh(item.price)}
            </div>
          </div>
        ))}
      </div>

      <aside style={{ alignSelf: "start", position: "sticky", top: "96px" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--line-hairline)",
            padding: "32px",
          }}
        >
          <Eyebrow>Summary</Eyebrow>
          <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
            <Row label="Subtotal" value={formatKsh(cart.subtotal)} />
            <Row
              label="Delivery"
              value={
                deliveryFee > 0
                  ? formatKsh(deliveryFee)
                  : "Calculated at checkout"
              }
            />
            <div
              style={{
                borderTop: "1px solid var(--line-hairline)",
                marginTop: "8px",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-title)",
              }}
            >
              <span>Total</span>
              <span>{formatKsh(total)}</span>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <Link href="/checkout" style={{ display: "block" }}>
              <ShawnButton fullWidth>Checkout</ShawnButton>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
