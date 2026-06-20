"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageColor: string | null;
  image: string | null;
  size: string | null;
  category: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  has: (id: string) => boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  hydrated: boolean;
};

const STORAGE_KEY = "shawn-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate the bag from localStorage on mount. The `hydrated` flag keeps the
    // server and first client render in sync so there is no hydration mismatch.
    let restored: CartItem[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as CartItem[];
    } catch {
      // ignore malformed storage
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(restored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be unavailable; cart still works for the session
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    // One of one: a piece is either in the bag or not. Never duplicated.
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev : [...prev, item],
    );
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      subtotal: items.reduce((sum, i) => sum + i.price, 0),
      has: (id: string) => items.some((i) => i.id === id),
      add,
      remove,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      hydrated,
    }),
    [items, isOpen, hydrated, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
