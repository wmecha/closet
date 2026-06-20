"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatKsh } from "@/lib/format";
import { useCart } from "./cart-provider";
import { Wordmark } from "./lens";
import { ShawnButton } from "./button";

const navLinks = [
  { href: "/shop", label: "The Edit" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled
            ? "rgba(247, 242, 233, 0.86)"
            : "var(--surface-page)",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: "1px solid var(--line-hairline)",
          transition: "background var(--dur-base) var(--ease-standard)",
        }}
      >
        <div
          className="shawn-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          <Link href="/" aria-label="SHAWN home">
            <Wordmark division="Apparel" lensSize={22} />
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(18px, 3vw, 40px)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--fs-micro)",
                  fontWeight: 500,
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={cart.open}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--fs-micro)",
                fontWeight: 500,
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: "var(--text-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Bag ({cart.hydrated ? cart.count : 0})
            </button>
          </nav>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}

function CartDrawer() {
  const cart = useCart();

  return (
    <>
      <div
        onClick={cart.close}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(26, 23, 20, 0.32)",
          opacity: cart.isOpen ? 1 : 0,
          pointerEvents: cart.isOpen ? "auto" : "none",
          transition: "opacity var(--dur-base) var(--ease-standard)",
        }}
      />
      <aside
        aria-label="Shopping bag"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          width: "min(420px, 92vw)",
          background: "var(--surface-page)",
          borderLeft: "1px solid var(--line-hairline)",
          transform: cart.isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--dur-base) var(--ease-entrance)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 28px",
            borderBottom: "1px solid var(--line-hairline)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--fs-micro)",
              fontWeight: 500,
              letterSpacing: "var(--tracking-eyebrow)",
              textTransform: "uppercase",
            }}
          >
            Your bag
          </span>
          <button
            type="button"
            onClick={cart.close}
            aria-label="Close bag"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              display: "inline-flex",
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
          {cart.items.length === 0 ? (
            <p
              className="shawn-body"
              style={{ paddingTop: "32px", textAlign: "center" }}
            >
              Your bag is empty. The edit is waiting.
            </p>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--line-hairline)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    aspectRatio: "3 / 4",
                    background: item.imageColor ?? "var(--shawn-sand)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={cart.close}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--fs-body-lg)",
                      lineHeight: 1.2,
                      display: "block",
                    }}
                  >
                    {item.title}
                  </Link>
                  {item.size ? (
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "var(--tracking-label)",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Size {item.size}
                    </span>
                  ) : null}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {formatKsh(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => cart.remove(item.id)}
                      style={{
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
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 ? (
          <div
            style={{
              padding: "20px 28px 28px",
              borderTop: "1px solid var(--line-hairline)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-display)" }}>
                {formatKsh(cart.subtotal)}
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--fs-caption)",
                color: "var(--text-tertiary)",
                marginBottom: "16px",
              }}
            >
              Delivery is calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={cart.close}
              style={{ display: "block" }}
            >
              <ShawnButton fullWidth>Checkout</ShawnButton>
            </Link>
            <Link
              href="/cart"
              onClick={cart.close}
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "12px",
                fontSize: "var(--fs-micro)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
              }}
            >
              View bag
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
