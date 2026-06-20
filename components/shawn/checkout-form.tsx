"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatKsh } from "@/lib/format";
import {
  checkoutCustomerSchema,
  type CheckoutCustomer,
} from "@/lib/store/schema";
import { startCheckout } from "@/app/(store)/actions";
import { useCart } from "./cart-provider";
import { ShawnButton } from "./button";
import { Eyebrow } from "./eyebrow";

export function CheckoutForm({
  deliveryFee,
  checkoutEnabled,
  whatsappNumber,
}: {
  deliveryFee: number;
  checkoutEnabled: boolean;
  whatsappNumber?: string;
}) {
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutCustomer>({
    resolver: zodResolver(checkoutCustomerSchema),
    defaultValues: { deliveryNotes: "" },
  });

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  if (cart.hydrated && cart.items.length === 0) {
    return (
      <div
        className="shawn-narrow"
        style={{ textAlign: "center", paddingBlock: "48px" }}
      >
        <Eyebrow>Checkout</Eyebrow>
        <h1
          className="shawn-serif"
          style={{ fontSize: "var(--fs-display-m)", marginTop: "12px" }}
        >
          Your bag is empty.
        </h1>
        <div style={{ marginTop: "24px" }}>
          <Link href="/shop">
            <ShawnButton>Shop the edit</ShawnButton>
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.subtotal + deliveryFee;

  async function onSubmit(values: CheckoutCustomer) {
    setSubmitting(true);
    try {
      const result = await startCheckout({
        ...values,
        productIds: cart.items.map((i) => i.id),
      });
      if (result.ok) {
        window.location.assign(result.authorizationUrl);
        return;
      }
      toast.error(result.error);
      if (result.soldOut) {
        toast.message("Please review your bag and try again.");
      }
      setSubmitting(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "clamp(32px, 6vw, 80px)",
        alignItems: "start",
      }}
      className="shawn-split"
    >
      <div>
        <Eyebrow>Delivery details</Eyebrow>
        <h1
          className="shawn-display"
          style={{ fontSize: "var(--fs-display-m)", margin: "12px 0 32px" }}
        >
          Where shall we send it?
        </h1>

        <div style={{ display: "grid", gap: "24px" }}>
          <Field label="Full name" error={errors.customerName?.message}>
            <input
              {...register("customerName")}
              style={inputStyle}
              autoComplete="name"
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
            className="shawn-split"
          >
            <Field label="Email" error={errors.customerEmail?.message}>
              <input
                {...register("customerEmail")}
                type="email"
                style={inputStyle}
                autoComplete="email"
              />
            </Field>
            <Field label="Phone" error={errors.customerPhone?.message}>
              <input
                {...register("customerPhone")}
                type="tel"
                style={inputStyle}
                autoComplete="tel"
              />
            </Field>
          </div>
          <Field
            label="Delivery location"
            error={errors.deliveryLocation?.message}
          >
            <input
              {...register("deliveryLocation")}
              style={inputStyle}
              placeholder="Estate, town, or pickup point"
            />
          </Field>
          <Field
            label="Delivery notes (optional)"
            error={errors.deliveryNotes?.message}
          >
            <textarea
              {...register("deliveryNotes")}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="A landmark, preferred time, or anything we should know."
            />
          </Field>
        </div>
      </div>

      {/* Summary */}
      <aside style={{ position: "sticky", top: "96px" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--line-hairline)",
            padding: "32px",
          }}
        >
          <Eyebrow>Order summary</Eyebrow>
          <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {item.title}
                </span>
                <span style={{ whiteSpace: "nowrap" }}>
                  {formatKsh(item.price)}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--line-hairline)",
              display: "grid",
              gap: "10px",
            }}
          >
            <Row label="Subtotal" value={formatKsh(cart.subtotal)} />
            <Row label="Delivery" value={formatKsh(deliveryFee)} />
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
            <span>Total</span>
            <span>{formatKsh(total)}</span>
          </div>

          <div style={{ marginTop: "24px" }}>
            {checkoutEnabled ? (
              <ShawnButton type="submit" fullWidth disabled={submitting}>
                {submitting ? "Taking you to payment" : "Pay with Paystack"}
              </ShawnButton>
            ) : (
              <>
                <ShawnButton type="button" fullWidth disabled>
                  Online payment unavailable
                </ShawnButton>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "14px",
                      fontSize: "var(--fs-micro)",
                      letterSpacing: "var(--tracking-label)",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Order on WhatsApp
                  </a>
                ) : null}
              </>
            )}
          </div>
          <p
            style={{
              marginTop: "16px",
              fontSize: "var(--fs-caption)",
              color: "var(--text-tertiary)",
              lineHeight: "var(--leading-body)",
            }}
          >
            Each piece is one of one. Your selection is held for 15 minutes
            while you pay. Prices in Kenyan Shillings.
          </p>
        </div>
      </aside>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--fs-body)",
  color: "var(--text-primary)",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid var(--line-soft)",
  padding: "8px 0",
  outline: "none",
  width: "100%",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </span>
      {children}
      {error ? (
        <span
          style={{ fontSize: "var(--fs-caption)", color: "var(--shawn-error)" }}
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
