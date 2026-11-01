import { useMemo } from "react";
import type { Product, ScaleFilter, VehicleFilter, ShopCollection } from "../types";
import { BannerCarousel } from "../components/BannerCarousel";
import { PolicyStrip } from "../components/PolicyStrip";
import { CategoryRow, ProductRow } from "../components/ProductCards";
import { scale132Img, resolveProductImage } from "../data/maps";
import { HomeBrandGrid } from "../components/HomeBrandGrid";
import { HomeVehicleCategories } from "../components/HomeVehicleCategories";

export function HomePage({
  featured,
  newest,
  onSale,
  allProducts,
  loading,
  collections = [],
  vehicleOptions = [],
  scaleOptions = [],
  onOpenCollection,
  onOpenProducts,
  onPickScale,
  onPickVehicle,
  onPickBrand,
  onDetail,
  onAdd,
  onBuyNow,
  onOpenFaq,
}: {
  featured: Product[];
  newest: Product[];
  onSale: Product[];
  allProducts: Product[];
  loading: boolean;
  collections?: ShopCollection[];
  vehicleOptions?: string[];
  scaleOptions?: string[];
  onOpenCollection: () => void;
  onOpenProducts: () => void;
  onPickScale: (s: ScaleFilter) => void;
  onPickVehicle: (v: VehicleFilter) => void;
  onPickBrand: (b: string) => void;
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onOpenFaq: () => void;
}) {
  const vehicleGroups = useMemo(() => {
    const list =
      vehicleOptions && vehicleOptions.length > 0
        ? vehicleOptions
        : ["Ô tô", "Xe máy", "Xe bán tải"];
    return list.map((key) => {
      const desc =
        key === "Ô tô"
          ? "Sedan, SUV, siêu xe và xe thể thao"
          : key === "Xe máy"
            ? "Xe số, tay ga và mô tô phân khối lớn"
            : key === "Xe bán tải"
              ? "Bán tải cỡ nhỏ tới full-size"
              : `Mô hình ${key.toLowerCase()} chính hãng`;
      return { key, desc };
    });
  }, [vehicleOptions]);

  const displayCollections = useMemo<
    Array<{
      id: string | number;
      scale: ScaleFilter;
      title: string;
      size: string;
      img: any;
      alt: string;
    }>
  >(() => {
    if (collections && collections.length > 0) {
      return collections.map((c) => {
        const scaleMatch = c.title.match(/1:(64|32|16|\d+)/)?.[0];
        const matched = scaleMatch ? allProducts.filter((p) => p.scale === scaleMatch) : allProducts;
        const repr = matched.find((p) => p.isFeatured) ?? matched[0];
        const imgSrc = c.imageKey
          ? resolveProductImage(c.imageKey)
          : repr
            ? resolveProductImage(repr.imageKey)
            : scale132Img;
        return {
          id: c.id,
          scale: (scaleMatch || "all") as ScaleFilter,
          title: c.title,
          size: `${matched.length} mẫu xe`,
          img: imgSrc,
          alt: c.title,
        };
      });
    }
    const fallbackScales = scaleOptions && scaleOptions.length > 0 ? scaleOptions : ["1:64", "1:32", "1:16"];
    return fallbackScales.map((s) => {
      const matched = allProducts.filter((p) => p.scale === s);
      const repr = matched.find((p) => p.isFeatured) ?? matched[0];
      const imgSrc = repr ? resolveProductImage(repr.imageKey) : scale132Img;
      return {
        id: s,
        scale: s as ScaleFilter,
        title: `Tỉ lệ ${s}`,
        size: `${matched.length} mẫu xe`,
        img: imgSrc,
        alt: `Bộ sưu tập tỉ lệ ${s}`,
      };
    });
  }, [collections, scaleOptions, allProducts]);

  const brandStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allProducts) map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, "vi"));
  }, [allProducts]);

  return (
    <main className="pb-24">
      {/* BANNER — băng chuyền nhiều banner, chuyển qua lại được */}
      <BannerCarousel
        onOpenProducts={onOpenProducts}
        onOpenCollection={onOpenCollection}
        onPickScale={onPickScale}
      />

      <div className="mx-auto max-w-6xl px-4">
        {/* (2) Chọn theo tỉ lệ — dải gọn ngay dưới banner, là bộ lọc chính. */}
        <section aria-label="Chọn theo tỉ lệ" className="pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Chọn theo tỉ lệ</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Chưa biết chọn cỡ nào? Xem nhanh 3 bộ theo kích thước thật.</p>
            </div>
            {displayCollections.length > 8 ? (
              <button
                type="button"
                onClick={onOpenCollection}
                aria-label="Xem tất cả các bộ sưu tập ở trang Bộ sưu tập"
                className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
              >
                Xem tất cả →
              </button>
            ) : null}
          </div>
          <div className="mt-4">
            <CategoryRow
              items={displayCollections}
              sectionLabel="Chọn theo tỉ lệ"
              getKey={(g) => String(g.id || g.scale)}
              renderItem={(g) => (
                <button
                  type="button"
                  onClick={() => (g.scale !== "all" ? onPickScale(g.scale) : onOpenCollection())}
                  aria-label={`Xem bộ sưu tập ${g.title}`}
                  className="block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left cursor-pointer transition hover:border-[var(--accent)]"
                >
                  <img src={g.img} alt={g.alt} className="h-24 w-full object-cover md:h-36" loading="lazy" />
                  <span className="block px-3 py-2.5">
                    <span className="block text-base font-extrabold">{g.title}</span>
                    <span className="block text-xs text-[var(--dim)]">{g.size}</span>
                  </span>
                </button>
              )}
            />
          </div>
          <button
            type="button"
            onClick={onOpenCollection}
            className="mt-4 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold cursor-pointer"
          >
            Tìm hiểu từng bộ sưu tập →
          </button>
        </section>

        {/* (3) Nổi bật trên kệ — chỉ sản phẩm có cờ nổi bật */}
        <section aria-label="Nổi bật trên kệ" className="pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Nổi bật trên kệ</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Những mẫu được shop chọn lọc nổi bật nhất trên kệ.</p>
            </div>
            <button
              type="button"
              onClick={onOpenProducts}
              aria-label="Xem tất cả sản phẩm với sắp xếp Nổi bật"
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>
          {loading ? (
            <p className="mt-8 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
          ) : featured.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--dim)]">
              Chưa có mẫu nổi bật nào trên kệ.
            </p>
          ) : (
            <div className="mt-5">
              <ProductRow products={featured} sectionLabel="Nổi bật trên kệ" onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
            </div>
          )}
        </section>

        {/* (4) Đang giảm giá — chỉ mẫu có giá khuyến mãi */}
        <section aria-label="Đang giảm giá" className="pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Đang giảm giá</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Giá gốc gạch ngang, giá khuyến mãi là giá bạn phải trả.</p>
            </div>
            <button
              type="button"
              onClick={onOpenProducts}
              aria-label="Xem tất cả sản phẩm đang giảm giá ở trang Sản phẩm"
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>
          {loading ? (
            <p className="mt-8 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
          ) : onSale.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--dim)]">
              Hiện chưa có mẫu nào đang giảm giá.
            </p>
          ) : (
            <div className="mt-5">
              <ProductRow products={onSale} sectionLabel="Đang giảm giá" onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
            </div>
          )}
        </section>

        {/* (5) Hàng mới về — id cao nhất trước, khoảng 8 mẫu */}
        <section aria-label="Hàng mới về" className="pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Hàng mới về</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Các mẫu mới nhất vừa lên kệ.</p>
            </div>
            <button
              type="button"
              onClick={onOpenProducts}
              aria-label="Xem tất cả sản phẩm — tới trang Sản phẩm"
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>
          {loading ? (
            <p className="mt-8 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
          ) : newest.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--dim)]">
              Kệ đang trống — quay lại sau nhé.
            </p>
          ) : (
            <div className="mt-5">
              <ProductRow products={newest} sectionLabel="Hàng mới về" onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
            </div>
          )}
        </section>

        {/* (6) Mua theo loại xe */}
        <HomeVehicleCategories
          vehicleGroups={vehicleGroups}
          allProducts={allProducts}
          loading={loading}
          onOpenProducts={onOpenProducts}
          onPickVehicle={onPickVehicle}
        />

        {/* (7) Mua theo hãng */}
        <HomeBrandGrid
          brandStats={brandStats}
          loading={loading}
          onOpenProducts={onOpenProducts}
          onPickBrand={onPickBrand}
        />

        <div className="mt-10">
          <PolicyStrip />
        </div>

        <section aria-label="Câu hỏi thường gặp" className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-black">Lần đầu mua mô hình?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--dim)]">
            Xem phần Hỏi đáp để biết phí ship, cách tra cứu và hủy đơn, và cách phân biệt
            1:64 sealed với 1:32, 1:16 mở được cửa.
          </p>
          <button
            type="button"
            onClick={onOpenFaq}
            className="mt-3 rounded-full bg-[var(--dark)] px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
          >
            Đọc hỏi đáp
          </button>
        </section>
      </div>
    </main>
  );
}
