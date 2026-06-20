"use client";

import Link from "next/link";
import { useState } from "react";
import { formatKsh } from "@/lib/format";
import { isProductAvailable, type Product } from "@/lib/store/types";

/** SHAWN ProductCard: image-first editorial tile with a slow hover zoom. */
export function ProductCard({ product }: { product: Product }) {
  const [hover, setHover] = useState(false);
  const available = isProductAvailable(product);
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "block", fontFamily: "var(--font-sans)" }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: product.imageColor ?? "var(--shawn-sand)",
          aspectRatio: "3 / 4",
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hover ? "scale(1.04)" : "scale(1)",
              transition: "transform var(--dur-slow) var(--ease-standard)",
              filter: available ? "none" : "grayscale(0.4) opacity(0.78)",
            }}
          />
        ) : null}
        {!available ? (
          <span
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              fontSize: "9.5px",
              fontWeight: 500,
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--shawn-ink)",
              background: "var(--shawn-ivory)",
              padding: "5px 10px",
            }}
          >
            Sold
          </span>
        ) : (
          <span
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              fontSize: "9.5px",
              fontWeight: 500,
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              background: "var(--shawn-ivory)",
              padding: "5px 10px",
            }}
          >
            One of one
          </span>
        )}
      </div>
      <div
        style={{
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {product.category ? (
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            {product.category}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-title)",
            color: "var(--text-primary)",
            lineHeight: 1.2,
          }}
        >
          {product.title}
        </span>
        <span
          style={{
            fontSize: "var(--fs-body)",
            color: available ? "var(--text-secondary)" : "var(--text-tertiary)",
            letterSpacing: "0.02em",
            textDecoration: available ? "none" : "line-through",
          }}
        >
          {formatKsh(product.price)}
        </span>
      </div>
    </Link>
  );
}
