"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

/** Empties the bag once an order is confirmed paid. */
export function ClearCart({ when }: { when: boolean }) {
  const cart = useCart();
  useEffect(() => {
    if (when) cart.clear();
    // Only run on mount / when the paid flag flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [when]);
  return null;
}
