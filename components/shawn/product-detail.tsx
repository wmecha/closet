"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatKsh } from "@/lib/format";
import { isProductAvailable, type Product } from "@/lib/store/types";
import { checkAvailability } from "@/app/(store)/actions";
import { useCart } from "./cart-provider";
import { ShawnButton } from "./button";
import { Eyebrow } from "./eyebrow";

export function ProductDetail({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber?: string;
}) {
  const cart = useCart();
  const [pending, startTransition] = useTransition();
  const [soldOut, setSoldOut] = useState(!isProductAvailable(product));
  const inBag = cart.has(product.id);

  const gallery = product.images.length > 0 ? product.images : [null];

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello SHAWN, I am interested in ${product.title} (${formatKsh(product.price)}). Is it still available?`,
      )}`
    : null;

  function handleAdd() {
    startTransition(async () => {
      const { available } = await checkAvailability(product.id);
      if (!available) {
        setSoldOut(true);
        toast.error("This piece has just been taken. It is one of one.");
        return;
      }
      cart.add({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        imageColor: product.imageColor,
        image: product.images[0] ?? null,
        size: product.size,
        category: product.category,
      });
      toast.success("Added to your bag.");
    });
  }

  return (
    <div
      className="shawn-split"
      style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr" }}
    >
      {/* Gallery */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {gallery.map((src, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "3 / 4",
              background: product.imageColor ?? "var(--shawn-sand)",
              overflow: "hidden",
            }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Details */}
      <div
        style={{
          padding: "clamp(8px, 4vw, 56px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "sticky", top: "96px" }}>
          {product.category ? <Eyebrow>{product.category}</Eyebrow> : null}
          <h1
            className="shawn-display"
            style={{ fontSize: "var(--fs-display-m)", margin: "14px 0 0" }}
          >
            {product.title}
          </h1>
          <p
            style={{
              marginTop: "16px",
              fontSize: "var(--fs-title)",
              color: soldOut ? "var(--text-tertiary)" : "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            {formatKsh(product.price)}
          </p>

          <p
            style={{
              marginTop: "8px",
              fontSize: "var(--fs-micro)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: soldOut ? "var(--text-tertiary)" : "var(--shawn-clay)",
            }}
          >
            {soldOut ? "Sold. One of one." : "One of one. Only one available."}
          </p>

          <p
            className="shawn-body"
            style={{ marginTop: "24px", fontSize: "var(--fs-body-lg)" }}
          >
            {product.description}
          </p>

          {/* Add to bag */}
          <div style={{ marginTop: "32px" }}>
            {soldOut ? (
              <ShawnButton fullWidth disabled>
                Sold
              </ShawnButton>
            ) : inBag ? (
              <Link href="/checkout" style={{ display: "block" }}>
                <ShawnButton fullWidth>Go to checkout</ShawnButton>
              </Link>
            ) : (
              <ShawnButton fullWidth onClick={handleAdd} disabled={pending}>
                {pending ? "Checking" : "Add to bag"}
              </ShawnButton>
            )}
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
                  borderBottom: "1px solid transparent",
                }}
              >
                Ask about this piece on WhatsApp
              </a>
            ) : null}
          </div>

          {/* Detail rows */}
          <dl style={{ marginTop: "40px" }}>
            {product.size ? (
              <DetailRow label="Size" value={product.size} />
            ) : null}
            {product.condition ? (
              <DetailRow label="Condition" value={product.condition} />
            ) : null}
            {Object.entries(product.measurements).map(([k, v]) => (
              <DetailRow key={k} label={k} value={v} />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid var(--line-hairline)",
        gap: "16px",
      }}
    >
      <dt
        style={{
          fontSize: "var(--fs-micro)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          color: "var(--text-secondary)",
          textAlign: "right",
        }}
      >
        {value}
      </dd>
    </div>
  );
}
