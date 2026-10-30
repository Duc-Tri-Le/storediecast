import type { Product, Variant } from "../types";
import { ProductRow } from "./ProductCards";

export function ProductRelatedSections({
  product,
  related,
  bestSelling,
  newest,
  onViewAllRelated,
  onViewAllBestSelling,
  onViewAllNewest,
  onDetail,
  onAdd,
  onBuyNow,
}: {
  product: Product;
  related: Product[];
  bestSelling: Product[];
  newest: Product[];
  onViewAllRelated: () => void;
  onViewAllBestSelling: () => void;
  onViewAllNewest: () => void;
  onDetail: (p: Product) => void;
  onAdd: (p: Product, qty?: number, variant?: Variant | null) => void;
  onBuyNow: (p: Product, qty: number, variant?: Variant | null) => void;
}) {
  return (
    <>
      {related.length > 0 && (
        <section aria-label="Sản phẩm liên quan" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight">Sản phẩm liên quan</h2>
            <button
              type="button"
              onClick={onViewAllRelated}
              aria-label={`Xem tất cả sản phẩm liên quan theo tỉ lệ ${product.scale} ở trang Sản phẩm`}
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Các mẫu cùng tỉ lệ {product.scale}, cùng loại {product.vehicleType.toLowerCase()} hoặc cùng hãng {product.brand} — bấm vào để xem chi tiết từng mẫu.
          </p>
          <div className="mt-5">
            <ProductRow products={related} sectionLabel="Sản phẩm liên quan" onDetail={onDetail} onAdd={onAdd} onBuyNow={(p) => onBuyNow(p, 1)} />
          </div>
        </section>
      )}

      {bestSelling.length > 0 && (
        <section aria-label="Sản phẩm bán chạy" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight">Sản phẩm bán chạy</h2>
            <button
              type="button"
              onClick={onViewAllBestSelling}
              aria-label="Xem tất cả sản phẩm bán chạy ở trang Sản phẩm với sắp xếp Nổi bật"
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Những mẫu mô hình được shop chọn lọc nổi bật nhất trên kệ.
          </p>
          <div className="mt-5">
            <ProductRow products={bestSelling} sectionLabel="Sản phẩm bán chạy" onDetail={onDetail} onAdd={onAdd} onBuyNow={(p) => onBuyNow(p, 1)} />
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section aria-label="Hàng mới về" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight">Hàng mới về</h2>
            <button
              type="button"
              onClick={onViewAllNewest}
              aria-label="Xem tất cả hàng mới về ở trang Sản phẩm"
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--dim)]">Các mẫu mới nhất vừa cập bến kệ shop.</p>
          <div className="mt-5">
            <ProductRow products={newest} sectionLabel="Hàng mới về" onDetail={onDetail} onAdd={onAdd} onBuyNow={(p) => onBuyNow(p, 1)} />
          </div>
        </section>
      )}
    </>
  );
}

