import { useEffect, useMemo, useState } from "react";
import type { Product, Variant } from "../types";
import {
  bulkDiscountForTotal,
  couponDiscountAmount,
  defaultVariant,
  effectivePrice,
  orderBulkPct,
  variantPrice,
  type AppliedCoupon,
} from "./pricing";
import {
  cartKeyOf,
  loadCartMap,
  loadStoredCoupon,
  saveCartMap,
  saveStoredCoupon,
} from "./cart";

export function useCart(allProducts: Product[], onToast: (msg: string) => void) {
  const [cart, setCart] = useState<Record<string, number>>(() => loadCartMap());
  useEffect(() => {
    saveCartMap(cart);
  }, [cart]);

  const [cartCoupon, setCartCoupon] = useState<AppliedCoupon | null>(() => loadStoredCoupon());
  const cartCouponCode = cartCoupon?.code ?? null;
  useEffect(() => {
    saveStoredCoupon(cartCoupon);
  }, [cartCoupon]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([key, qty]) => {
        const [pidStr, vidStr] = key.split(":");
        const p = allProducts.find((x) => x.id === Number(pidStr));
        if (!p) return null;
        const variant =
          (vidStr != null ? p.variants.find((v) => v.id === Number(vidStr)) : undefined) ??
          defaultVariant(p);
        return { product: p, variant, qty, key: cartKeyOf(p.id, variant?.id ?? null) };
      })
      .filter(
        (x): x is { product: Product; variant: Variant | null; qty: number; key: string } =>
          x != null,
      );
  }, [cart, allProducts]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartBulkPct = orderBulkPct(cartCount);
  const cartSubtotalBefore = cartItems.reduce(
    (s, i) =>
      s + (i.variant ? variantPrice(i.variant) : effectivePrice(i.product)) * i.qty,
    0,
  );
  const cartBulkDiscount = bulkDiscountForTotal(cartSubtotalBefore, cartCount);
  const cartSubtotal = cartSubtotalBefore - cartBulkDiscount;
  const cartCouponDiscount = couponDiscountAmount(cartCoupon, cartSubtotal);
  const cartSubtotalAfterCoupon = cartSubtotal - cartCouponDiscount;
  const shipping =
    cartItems.length === 0 || cartSubtotalAfterCoupon >= 1000000 ? 0 : 30000;

  function addToCart(p: Product, qty = 1, variant?: Variant | null) {
    const v = variant ?? defaultVariant(p);
    const stock = v ? v.stock : p.stock;
    if (stock <= 0) return;
    const key = cartKeyOf(p.id, v?.id ?? null);
    setCart((prev) => {
      const cur = prev[key] ?? prev[`${p.id}`] ?? 0;
      const next = { ...prev };
      delete next[`${p.id}`];
      next[key] = Math.min(stock, cur + qty);
      return next;
    });
    onToast(
      `Đã thêm “${p.name.replace(" [MẪU]", "")}”${v ? ` màu ${v.colorName}` : ""} vào giỏ`,
    );
  }

  function addManyToCart(
    lines: Array<{ product: Product; variant?: Variant | null; qty?: number }>,
  ) {
    const usable = lines.filter((l) => {
      const v = l.variant ?? defaultVariant(l.product);
      return (v ? v.stock : l.product.stock) > 0;
    });
    if (usable.length === 0) return;
    setCart((prev) => {
      const next = { ...prev };
      for (const l of usable) {
        const v = l.variant ?? defaultVariant(l.product);
        const stock = v ? v.stock : l.product.stock;
        const key = cartKeyOf(l.product.id, v?.id ?? null);
        const cur = next[key] ?? next[`${l.product.id}`] ?? 0;
        delete next[`${l.product.id}`];
        next[key] = Math.min(stock, cur + (l.qty ?? 1));
      }
      return next;
    });
    onToast(`Đã thêm ${usable.length} sản phẩm vào giỏ`);
  }

  function setQty(key: string, qty: number, stock: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = Math.min(stock, qty);
      return next;
    });
  }

  function clearCart() {
    setCart({});
    setCartCoupon(null);
  }

  return {
    cart,
    setCart,
    cartCoupon,
    setCartCoupon,
    cartCouponCode,
    cartItems,
    cartCount,
    cartBulkPct,
    cartSubtotalBefore,
    cartBulkDiscount,
    cartSubtotal,
    cartCouponDiscount,
    cartSubtotalAfterCoupon,
    shipping,
    addToCart,
    addManyToCart,
    setQty,
    clearCart,
  };
}

