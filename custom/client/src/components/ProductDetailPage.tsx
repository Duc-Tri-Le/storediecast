import { useState, useMemo } from "react";
import type { Product, Variant } from "../types";
import {
  bulkSubtotalAfter,
  defaultVariant,
  effectivePrice,
  fmt,
  variantPrice,
} from "../services/pricing";
import { ProductInfoTabs, featureSegments } from "./ProductInfoTabs";
import { ProductComboSection, type BundleLine } from "./ProductComboSection";
import { ProductGallery } from "./ProductGallery";
import { ProductBulkDiscountSection } from "./ProductBulkDiscountSection";
import { ProductRelatedSections } from "./ProductRelatedSections";

export function ProductDetailPage({
  product,
  initialVariantId,
  allProducts,
  onGoProducts,
  onViewAllRelated,
  onViewAllBestSelling,
  onViewAllNewest,
  onDetail,
  onAdd,
  onAddMany,
  onBuyNow,
}: {
  product: Product;
  initialVariantId?: number | null;
  allProducts: Product[];
  onGoProducts: () => void;
  onViewAllRelated: () => void;
  onViewAllBestSelling: () => void;
  onViewAllNewest: () => void;
  onDetail: (p: Product) => void;
  onAdd: (p: Product, qty?: number, variant?: Variant | null) => void;
  onAddMany: (lines: Array<{ product: Product; variant?: Variant | null; qty?: number }>) => void;
  onBuyNow: (p: Product, qty: number, variant?: Variant | null) => void;
}) {
  const [qty, setQtyLocal] = useState(1);
  const [variantId, setVariantId] = useState<number | null>(() => {
    if (initialVariantId != null && product.variants.some((v) => v.id === initialVariantId)) {
      return initialVariantId;
    }
    return product.variants[0]?.id ?? null;
  });
  const variant =
    product.variants.find((v) => v.id === variantId) ?? defaultVariant(product);
  const hasVariants = product.variants.length > 1;

  const gallery = useMemo(() => {
    const imgs = product.images;
    const mine = imgs.filter((im) => im.variantId != null && im.variantId === variant?.id);
    const common = imgs.filter((im) => im.variantId == null);
    const others = imgs.filter((im) => im.variantId != null && im.variantId !== variant?.id);
    const ordered = [...mine, ...common, ...others];
    if (ordered.length === 0 && variant) {
      return [{ imageKey: variant.imageKey, variantId: variant.id }];
    }
    return ordered;
  }, [product.images, variant?.id]);

  const [mainImageKey, setMainImageKey] = useState<string | null>(null);

  function pickVariant(v: Variant) {
    setVariantId(v.id);
    setQtyLocal(1);
    const first = product.images.find((im) => im.variantId === v.id);
    setMainImageKey(first ? first.imageKey : v.imageKey);
  }

  const price = variant ? variantPrice(variant) : effectivePrice(product);
  const listPrice = variant ? variant.price : product.price;
  const promoPrice = variant ? variant.promoPrice : product.promoPrice;
  const stock = variant ? variant.stock : product.stock;
  const colorName = variant ? variant.colorName : product.colorName;
  const out = stock <= 0;
  const discount =
    promoPrice != null && listPrice > promoPrice
      ? Math.round((1 - promoPrice / listPrice) * 100)
      : 0;
  const saving = promoPrice != null ? listPrice - promoPrice : 0;
  const bullets = featureSegments(product);
  const bulkTotal = bulkSubtotalAfter(price * qty, qty);

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

  const qtySelector = (
    <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={qty <= 1}
        onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
        className="px-4 py-3 text-lg font-bold disabled:opacity-40"
      >
        −
      </button>
      <span aria-label={`Số lượng ${qty}`} className="min-w-8 text-center font-bold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        disabled={qty >= stock}
        onClick={() => setQtyLocal((q) => Math.min(stock, q + 1))}
        className="px-4 py-3 text-lg font-bold disabled:opacity-40"
      >
        +
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 md:pb-24">
      <nav aria-label="Đường dẫn trang" className="min-w-0 text-sm text-[var(--dim)]">
        <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
          <li>
            <button type="button" onClick={onGoProducts} className="font-semibold underline-offset-2 hover:text-[var(--text)] hover:underline">
              Sản phẩm
            </button>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="max-w-[70vw] truncate font-semibold text-[var(--text)]">
            {product.name.replace(" [MẪU]", "")}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery
          product={product}
          mainImageKey={mainImageKey}
          gallery={gallery}
          colorName={colorName}
          discount={discount}
          out={out}
          onSelectImage={setMainImageKey}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dim)]">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight">{product.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--dark)] px-3 py-1.5 text-xs font-bold text-white">
              Tỉ lệ {product.scale}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
              {product.vehicleType}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
              Màu {colorName}
            </span>
          </div>

          {hasVariants && (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-[var(--dim)]">
                Màu sắc: <span className="font-bold text-[var(--text)]">{colorName}</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Chọn màu cho ${product.name}`}>
                {product.variants.map((v) => {
                  const active = variant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => pickVariant(v)}
                      aria-pressed={active}
                      aria-label={`Chọn màu ${v.colorName} cho ${product.name}`}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/25"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      {v.colorName}
                      {v.stock <= 0 && <span className="text-xs font-bold">(Hết)</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-black tabular-nums text-[var(--accent)]">{fmt(price)}</p>
              {promoPrice ? (
                <p className="text-base tabular-nums text-[var(--dim)] line-through">{fmt(listPrice)}</p>
              ) : null}
            </div>
            {promoPrice ? (
              <p className="mt-1 text-sm font-bold text-[var(--promo)]">
                Giá khuyến mãi — tiết kiệm {fmt(saving)} (−{discount}%)
              </p>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-semibold" role="status">
            {out ? (
              <span className="text-[var(--accent)]">
                Màu {colorName} đang hết hàng — chọn màu khác hoặc nhắn shop hỏi đợt mới
              </span>
            ) : (
              <span>
                Còn hàng · <span className="tabular-nums">{stock} chiếc</span> sẵn sàng giao
              </span>
            )}
          </p>

          {!out ? (
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <span id="qty-label" className="text-sm font-semibold text-[var(--dim)]">
                  Số lượng
                </span>
                {qtySelector}
                <span className="text-xs text-[var(--dim)]">Tối đa {stock} chiếc</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onAdd(product, qty, variant)}
                  aria-label={`Thêm ${qty} chiếc ${product.name} màu ${colorName} vào giỏ`}
                  className="flex-1 rounded-full bg-[var(--accent)] py-3.5 text-base font-black text-white"
                >
                  Thêm vào giỏ · {fmt(bulkTotal)}
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow(product, qty, variant)}
                  aria-label={`Mua ngay ${qty} chiếc ${product.name} màu ${colorName}`}
                  className="flex-1 rounded-full bg-[var(--dark)] py-3.5 text-base font-black text-white"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-[var(--surface2)] p-4 text-sm leading-relaxed">
              {hasVariants
                ? `Màu ${colorName} của mẫu này đang hết hàng. Bạn chọn màu khác ở phần chọn màu phía trên, hoặc xem các mẫu khác cùng tỉ lệ ${product.scale} ở mục “Sản phẩm liên quan” bên dưới.`
                : `Mẫu này đang hết hàng. Bạn xem các mẫu khác cùng tỉ lệ ${product.scale} ở mục “Sản phẩm liên quan” bên dưới, hoặc quay lại trang Sản phẩm để chọn mẫu khác.`}
            </p>
          )}

          <div className="mt-5 space-y-2 rounded-2xl bg-[var(--surface2)] p-4 text-sm leading-relaxed">
            <p>
              <strong>Giao hàng toàn quốc</strong> — giao tới địa chỉ nhận hàng bạn đã đặt.
            </p>
            <p>
              Phí ship <strong>30.000₫</strong> · <strong>Freeship</strong> cho đơn từ{" "}
              <strong>1.000.000₫</strong>.
            </p>
            <p>Đóng gói chống sốc trước khi gửi.</p>
          </div>
        </div>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-10">
        <div className="min-w-0 md:col-start-2">
          <ProductBulkDiscountSection
            price={price}
            qty={qty}
            stock={stock}
            colorName={colorName}
            onSelectQty={setQtyLocal}
          />

          {bundleCompanions.length > 0 && (
            <ProductComboSection
              bundleLines={bundleLines}
              bundleTotal={bundleTotal}
              bundleCheckedCount={bundleCheckedCount}
              onToggleChecked={(id, chk) => setBundleChecked((prev) => ({ ...prev, [id]: chk }))}
              onChangeVariant={(id, vid) => {
                const target = bundleProducts.find((x) => x.id === id);
                const v = target?.variants.find((x) => x.id === vid);
                if (!v) return;
                if (id === product.id) pickVariant(v);
                else setBundleVariantIds((prev) => ({ ...prev, [id]: v.id }));
              }}
              onAddBundle={() =>
                onAddMany(
                  bundleLines
                    .filter((l) => l.checked)
                    .map((l) => ({ product: l.product, variant: l.variant, qty: 1 })),
                )
              }
            />
          )}
        </div>
      </div>

      <ProductInfoTabs product={product} colorName={colorName} bullets={bullets} />

      <ProductRelatedSections
        product={product}
        related={related}
        bestSelling={bestSelling}
        newest={newest}
        onViewAllRelated={onViewAllRelated}
        onViewAllBestSelling={onViewAllBestSelling}
        onViewAllNewest={onViewAllNewest}
        onDetail={onDetail}
        onAdd={onAdd}
        onBuyNow={onBuyNow}
      />
    </main>
  );
}
