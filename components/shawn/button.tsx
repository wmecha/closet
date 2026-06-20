"use client";

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--shawn-ink)",
    color: "var(--shawn-ivory)",
    border: "1px solid var(--shawn-ink)",
  },
  secondary: {
    background: "transparent",
    color: "var(--shawn-ink)",
    border: "1px solid var(--line-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--shawn-ink)",
    border: "1px solid transparent",
    borderRadius: 0,
  },
};

/** SHAWN Button: quiet, editorial, uppercase with wide tracking. */
export function ShawnButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  style,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const pad =
    size === "sm" ? "10px 20px" : size === "lg" ? "18px 40px" : "14px 30px";
  const fs = size === "sm" ? "10.5px" : "11.5px";

  const base: CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: fs,
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: variant === "ghost" ? "8px 2px" : pad,
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition:
      "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)",
    opacity: disabled ? 0.4 : 1,
    lineHeight: 1,
  };

  const onEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === "primary") el.style.background = "var(--shawn-espresso)";
    if (variant === "secondary") el.style.borderColor = "var(--shawn-ink)";
    if (variant === "ghost") {
      el.style.opacity = "0.6";
      el.style.boxShadow = "inset 0 -1px 0 var(--shawn-ink)";
    }
  };
  const onLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === "primary") el.style.background = "var(--shawn-ink)";
    if (variant === "secondary") el.style.borderColor = "var(--line-strong)";
    if (variant === "ghost") {
      el.style.opacity = "1";
      el.style.boxShadow = "none";
    }
  };

  return (
    <button
      style={{ ...base, ...variantStyles[variant], ...style }}
      disabled={disabled}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </button>
  );
}
