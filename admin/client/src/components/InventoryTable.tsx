import type { Product, Variant } from "../types";
import type { ProductInput } from "../types";
import { colorHex, directImageSrc, fmtVND } from "../utils/format";

export function VariantThumb({
  product,
  variant,
  size = 48,
}: {
  product: Product;
  variant: Variant;
  size?: number;
}) {
  const src = directImageSrc(variant.imageKey);
  if (src) {
    return (
      <img
        src={src}
        alt={`Ảnh ${product.name} — ${variant.colorName}`}
        loading="lazy"
        className="shrink-0 rounded-md border border-[var(--border)] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex shrink-0 flex-col items-center justify-center rounded-md border border-[var(--border)]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colorHex(variant.colorName)}33, ${colorHex(variant.colorName)}11)`,
      }}
    >
      <span
        className="block rounded-full border border-black/10"
        style={{
          width: size * 0.36,
          height: size * 0.36,
          background: colorHex(variant.colorName),
        }}
      />
      <span className="mt-0.5 text-[9px] font-semibold text-[var(--dim)]">
        {product.scale}
      </span>
    </div>
  );
}

export function productInputWithStocks(
  product: Product,
  stockByVariantId: Map<number, number>,
): ProductInput {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    scale: product.scale,
    vehicleType: product.vehicleType,
    description: product.description,
    features: product.features,
    isFeatured: product.isFeatured,
    modelMaker: product.modelMaker ?? "",
    variants: [...product.variants]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((v) => ({
        id: v.id,
        colorName: v.colorName,
        price: v.price,
        promoPrice: v.promoPrice,
        stock: stockByVariantId.get(v.id) ?? v.stock,
        imageKey: v.imageKey,
      })),
  };
}

export function InventoryTable({
  rows,
  selected,
  allVisibleSelected,
  sortDir,
  setSortDir,
  toggleSelectAll,
  toggleSelect,
  onOpenDetail,
  renderUpdateControls,
}: {
  rows: Array<{ product: Product; variant: Variant }>;
  selected: number[];
  allVisibleSelected: boolean;
  sortDir: "asc" | "desc";
  setSortDir: (fn: (d: "asc" | "desc") => "asc" | "desc") => void;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelect: (variantId: number, checked: boolean) => void;
  onOpenDetail: (productId: number) => void;
  renderUpdateControls: (product: Product, variant: Variant) => React.ReactNode;
}) {
  return (
    <>
      {/* Màn hình rộng */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-xs tracking-wide text-[var(--dim)] uppercase">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả biến thể đang hiện"
                  checked={allVisibleSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4 align-middle"
                />
              </th>
              <th className="px-2 py-3 font-medium">Biến thể sản phẩm</th>
              <th className="px-3 py-3 font-medium">SKU</th>
              <th className="px-3 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  aria-label={`Sắp xếp theo số lượng, hiện đang ${sortDir === "asc" ? "tăng dần" : "giảm dần"}`}
                  className="flex items-center gap-1 font-medium uppercase hover:text-[var(--text)]"
                >
                  Số lượng <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>
                </button>
              </th>
              <th className="px-3 py-3 font-medium">Cập nhật số lượng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, variant }) => (
              <tr key={variant.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-3 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Chọn biến thể ${product.name} màu ${variant.colorName}`}
                    checked={selected.includes(variant.id)}
                    onChange={(e) => toggleSelect(variant.id, e.target.checked)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Mở chi tiết sản phẩm ${product.name}`}
                      onClick={() => onOpenDetail(product.id)}
                      className="shrink-0 rounded-md transition-opacity hover:opacity-80"
                    >
                      <VariantThumb product={product} variant={variant} size={48} />
                    </button>
                    <div className="min-w-0">
                      <button
                        type="button"
                        aria-label={`Mở chi tiết sản phẩm ${product.name}`}
                        onClick={() => onOpenDetail(product.id)}
                        className="text-left font-semibold text-[var(--accent)] hover:underline"
                      >
                        {product.name}
                      </button>
                      <p className="text-sm text-[var(--dim)]">
                        {variant.colorName} / Tỉ lệ {product.scale} · {product.brand}
                      </p>
                      <p className="text-xs text-[var(--dim)]">
                        {fmtVND(variant.promoPrice ?? variant.price)}
                        {variant.promoPrice != null && (
                          <span className="line-through"> {fmtVND(variant.price)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className="font-mono text-xs break-all"
                    title={variant.sku ?? variant.internalCode ?? undefined}
                  >
                    {variant.sku ?? variant.internalCode ?? "Chưa có SKU"}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`text-base font-semibold ${variant.stock <= 0 ? "text-[#9c2b2b]" : ""}`}
                  >
                    {variant.stock}
                  </span>
                  {variant.stock <= 0 ? (
                    <span className="block text-xs text-[#9c2b2b]">Hết hàng</span>
                  ) : variant.stock <= 3 ? (
                    <span className="block text-xs text-[#8a5d08]">Sắp hết</span>
                  ) : null}
                </td>
                <td className="px-3 py-3 align-top">
                  {renderUpdateControls(product, variant)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thẻ điện thoại */}
      <div className="mt-4 space-y-3 lg:hidden">
        {rows.map(({ product, variant }) => (
          <div
            key={variant.id}
            className="rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Chọn biến thể ${product.name} màu ${variant.colorName}`}
                checked={selected.includes(variant.id)}
                onChange={(e) => toggleSelect(variant.id, e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0"
              />
              <button
                type="button"
                aria-label={`Mở chi tiết sản phẩm ${product.name}`}
                onClick={() => onOpenDetail(product.id)}
                className="shrink-0 rounded-md transition-opacity hover:opacity-80"
              >
                <VariantThumb product={product} variant={variant} size={48} />
              </button>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  aria-label={`Mở chi tiết sản phẩm ${product.name}`}
                  onClick={() => onOpenDetail(product.id)}
                  className="text-left font-semibold text-[var(--accent)] hover:underline"
                >
                  {product.name}
                </button>
                <p className="text-sm text-[var(--dim)]">
                  {variant.colorName} / Tỉ lệ {product.scale} · {product.brand}
                </p>
                <p className="font-mono text-xs break-all text-[var(--dim)]">
                  SKU: {variant.sku ?? variant.internalCode ?? "Chưa có SKU"}
                </p>
              </div>
              <p className="text-right">
                <span
                  className={`text-base font-semibold ${variant.stock <= 0 ? "text-[#9c2b2b]" : ""}`}
                >
                  {variant.stock}
                </span>
                <span className="block text-xs text-[var(--dim)]">chiếc</span>
              </p>
            </div>
            {(variant.stock <= 0 || (variant.stock > 0 && variant.stock <= 3)) && (
              <p className="mt-2 text-sm">
                {variant.stock <= 0 ? (
                  <span className="text-[#9c2b2b]">Đang hết hàng</span>
                ) : (
                  <span className="text-[#8a5d08]">Sắp hết</span>
                )}
              </p>
            )}
            <div className="mt-2">{renderUpdateControls(product, variant)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

