import { useState, useMemo } from "react";
import type { Product, Variant } from "../types";
import { defaultVariant, effectivePrice, variantPrice } from "../services/pricing";
import type { BundleLine } from "../components/ProductComboSection";

export function useProductDetailCombo({
  product,
  variant,
  allProducts,
  onPickVariant,
}: {
  product: Product;
  variant: Variant | null;
  allProducts: Product[];
  onPickVariant: (v: Variant) => void;
}) {
  const bundleCompanions = useMemo(() => {
    const others = allProducts.filter(
      (p) => p.id !== product.id && (p.scale === product.scale || p.brand === product.brand),
    );
    const inStock = others.filter((p) => (defaultVariant(p)?.stock ?? p.stock) > 0);
    const outStock = others.filter((p) => (defaultVariant(p)?.stock ?? p.stock) <= 0);
    return [...inStock, ...outStock].slice(0, 2);
  }, [allProducts, product]);

  const bundleProducts = useMemo(
    () => [product, ...bundleCompanions],
    [product, bundleCompanions],
  );

  const [bundleVariantIds, setBundleVariantIds] = useState<Record<number, number | null>>(() => {
    const init: Record<number, number | null> = {};
    for (const p of bundleCompanions) init[p.id] = defaultVariant(p)?.id ?? null;
    return init;
  });

  const [bundleChecked, setBundleChecked] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (const p of bundleCompanions) init[p.id] = (defaultVariant(p)?.stock ?? p.stock) > 0;
    return init;
  });

  function bundleVariantFor(p: Product): Variant | null {
    if (p.id === product.id) return variant;
    const stored = bundleVariantIds[p.id];
    return p.variants.find((v) => v.id === stored) ?? defaultVariant(p);
  }

  const bundleLines: BundleLine[] = bundleProducts.map((p) => {
    const v = bundleVariantFor(p);
    const lineStock = v ? v.stock : p.stock;
    const linePrice = v ? variantPrice(v) : effectivePrice(p);
    const isSelf = p.id === product.id;
    const checked = lineStock > 0 && (isSelf || (bundleChecked[p.id] ?? false));
    return { product: p, variant: v, stock: lineStock, price: linePrice, isSelf, checked };
  });

  const bundleTotal = bundleLines
    .filter((l) => l.checked)
    .reduce((s, l) => s + l.price, 0);

  const bundleCheckedCount = bundleLines.filter((l) => l.checked).length;

  const handleToggleChecked = (id: number, chk: boolean) => {
    setBundleChecked((prev) => ({ ...prev, [id]: chk }));
  };

  const handleChangeVariant = (id: number, vid: number) => {
    const target = bundleProducts.find((x) => x.id === id);
    const v = target?.variants.find((x) => x.id === vid);
    if (!v) return;
    if (id === product.id) onPickVariant(v);
    else setBundleVariantIds((prev) => ({ ...prev, [id]: v.id }));
  };

  const related = useMemo(() => {
    const others = allProducts.filter((p) => p.id !== product.id);
    const used = new Set<number>();
    const pick = (pred: (p: Product) => boolean) =>
      others.filter((p) => {
        if (used.has(p.id) || !pred(p)) return false;
        used.add(p.id);
        return true;
      });
    return pick((p) => p.scale === product.scale)
      .concat(pick((p) => p.vehicleType === product.vehicleType))
      .concat(pick((p) => p.brand === product.brand))
      .slice(0, 8);
  }, [allProducts, product]);

  const bestSelling = useMemo(
    () => allProducts.filter((p) => p.isFeatured).slice(0, 8),
    [allProducts],
  );

  const newest = useMemo(
    () => [...allProducts].sort((a, b) => b.id - a.id).slice(0, 8),
    [allProducts],
  );

  return {
    bundleCompanions,
    bundleProducts,
    bundleLines,
    bundleTotal,
    bundleCheckedCount,
    handleToggleChecked,
    handleChangeVariant,
    related,
    bestSelling,
    newest,
  };
}

