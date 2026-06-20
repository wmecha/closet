import Link from "next/link";
import { Wordmark } from "./lens";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "The current edit" },
      { href: "/about", label: "About SHAWN" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Care",
    links: [
      { href: "/returns", label: "Returns and exchange" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function Footer({ whatsappNumber }: { whatsappNumber?: string }) {
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <footer
      style={{
        background: "var(--surface-inverse)",
        color: "var(--text-on-inverse)",
        marginTop: "auto",
      }}
    >
      <div
        className="shawn-container"
        style={{ paddingBlock: "clamp(56px, 8vw, 96px)" }}
      >
        <div
          style={{
            display: "grid",
            gap: "48px",
            gridTemplateColumns: "1.4fr 1fr 1fr",
          }}
          className="shawn-footer-grid"
        >
          <div>
            <span style={{ color: "var(--text-on-inverse)" }}>
              <Wordmark division="Apparel" lensSize={26} />
            </span>
            <p
              style={{
                marginTop: "20px",
                maxWidth: "32ch",
                color: "var(--text-on-inverse-soft)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Curated modern living. A short edit of one of one pieces, found
              and restored, made to be kept.
            </p>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  fontSize: "var(--fs-micro)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  color: "var(--text-on-inverse)",
                  borderBottom: "1px solid var(--line-on-inverse)",
                  paddingBottom: "4px",
                }}
              >
                Order on WhatsApp
              </a>
            ) : null}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p
                style={{
                  fontSize: "var(--fs-micro)",
                  letterSpacing: "var(--tracking-eyebrow)",
                  textTransform: "uppercase",
                  color: "var(--text-on-inverse-soft)",
                  marginBottom: "18px",
                }}
              >
                {col.title}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link.href} style={{ marginBottom: "12px" }}>
                    <Link
                      href={link.href}
                      style={{ color: "var(--text-on-inverse-soft)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "64px",
            paddingTop: "24px",
            borderTop: "1px solid var(--line-on-inverse)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "var(--fs-caption)",
            color: "var(--text-on-inverse-soft)",
          }}
        >
          <span>SHAWN, {new Date().getFullYear()}. All rights reserved.</span>
          <span>Nairobi, Kenya. Prices in Kenyan Shillings.</span>
        </div>
      </div>
    </footer>
  );
}
