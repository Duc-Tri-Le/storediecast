import type { Product, ScaleFilter, VehicleFilter } from "../types";
import { BannerCarousel } from "./BannerCarousel";
import { PolicyStrip } from "./PolicyStrip";
import { CategoryRow, ProductRow } from "./ProductCards";
import { COLLECTIONS } from "../data/collections";
import { BRAND_LOGOS, scale132Img, resolveProductImage } from "../data/maps";

export function HomePage({
  featured,
  newest,
  onSale,
  allProducts,
  loading,
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
  const vehicleGroups: Array<{ key: Exclude<VehicleFilter, "all">; desc: string }> = [
    { key: "Ô tô", desc: "Sedan, SUV, siêu xe và xe thể thao" },
    { key: "Xe máy", desc: "Xe số, tay ga và mô tô phân khối lớn" },
    { key: "Xe bán tải", desc: "Bán tải cỡ nhỏ tới full-size" },
  ];
  const brandStats = (() => {
    const map = new Map<string, number>();
    for (const p of allProducts) map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, "vi"));
  })();

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
            {COLLECTIONS.length > 8 ? (
              <button
                type="button"
                onClick={onOpenCollection}
                aria-label="Xem tất cả các tỉ lệ ở trang Bộ sưu tập"
                className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Xem tất cả →
              </button>
            ) : null}
          </div>
          <div className="mt-4">
            <CategoryRow
              items={COLLECTIONS}
              sectionLabel="Chọn theo tỉ lệ"
              getKey={(g) => g.scale}
              renderItem={(g) => (
                <button
                  type="button"
                  onClick={() => onPickScale(g.scale)}
                  aria-label={`Lọc sản phẩm theo tỉ lệ ${g.scale}`}
                  className="block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left"
                >
                  <img src={g.img} alt={g.alt} className="h-24 w-full object-cover md:h-36" loading="lazy" />
                  <span className="block px-3 py-2.5">
                    <span className="block text-base font-extrabold">Tỉ lệ {g.scale}</span>
                    <span className="block text-xs text-[var(--dim)]">{g.size}</span>
                  </span>
                </button>
              )}
            />
          </div>
          <button
            type="button"
            onClick={onOpenCollection}
            className="mt-4 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold"
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
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
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
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
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
              className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
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

        {/* (6) Mua theo loại xe — dải gọn, 3 ô với số mẫu thật */}
        <section aria-label="Mua theo loại xe" className="pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Mua theo loại xe</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Chọn loại xe bạn thích — số mẫu tính từ kệ hiện tại.</p>
            </div>
            {vehicleGroups.length > 8 ? (
              <button
                type="button"
                onClick={onOpenProducts}
                aria-label="Xem tất cả loại xe ở trang Sản phẩm"
                className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Xem tất cả →
              </button>
            ) : null}
          </div>
          <div className="mt-4">
            <CategoryRow
              items={vehicleGroups}
              sectionLabel="Mua theo loại xe"
              getKey={(g) => g.key}
              renderItem={(g) => {
                const items = allProducts.filter((prod) => prod.vehicleType === g.key);
                const count = items.length;
                const repr = items[0];
                const imgSrc = repr ? resolveProductImage(repr.imageKey) : scale132Img;
                return (
                  <button
                    type="button"
                    onClick={() => onPickVehicle(g.key)}
                    aria-label={`Mua theo loại xe ${g.key}, ${count} mẫu — xem ở trang Sản phẩm đã lọc sẵn loại xe này`}
                    className="block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left"
                  >
                    <img src={imgSrc} alt={`Mô hình ${g.key} trên kệ`} className="h-24 w-full object-cover md:h-36" loading="lazy" />
                    <span className="block px-3 py-2.5">
                      <span className="block text-base font-extrabold leading-tight">{g.key}</span>
                      <span className="mt-0.5 block text-xs font-semibold text-[var(--accent)]">{loading ? "Đang đếm…" : `${count} mẫu`}</span>
                      <span className="mt-0.5 hidden text-xs leading-snug text-[var(--dim)] md:block">{g.desc}</span>
                    </span>
                  </button>
                );
              }}
            />
          </div>
        </section>

        {/* (7) Mua theo hãng */}
        <section aria-label="Mua theo hãng" className="pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Mua theo hãng</h2>
              <p className="mt-1 text-sm text-[var(--dim)]">Bấm vào hãng để xem các mẫu của hãng đó đã lọc sẵn ở trang Sản phẩm.</p>
            </div>
            {brandStats.length > 0 ? (
              <button
                type="button"
                onClick={onOpenProducts}
                aria-label="Xem tất cả — sang trang Sản phẩm đủ 50 mẫu không lọc"
                className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Xem tất cả →
              </button>
            ) : null}
          </div>
          {loading ? (
            <p className="mt-8 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
          ) : brandStats.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--dim)]">
              Chưa có hãng nào trên kệ.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 lg:grid-cols-10">
              {brandStats.slice(0, 20).map(({ brand }) => {
                const logo = BRAND_LOGOS[brand];
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => onPickBrand(brand)}
                    aria-label={`Mua theo hãng ${brand} — xem ở trang Sản phẩm đã lọc sẵn hãng này`}
                    title={brand}
                    className="flex h-16 w-full min-w-0 items-center justify-center px-1 transition hover:opacity-75 sm:h-20"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={brand}
                        title={brand}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="block max-w-full break-words text-center text-sm font-extrabold leading-tight">{brand}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

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
            className="mt-3 rounded-full bg-[var(--dark)] px-5 py-2.5 text-sm font-bold text-white"
          >
            Đọc hỏi đáp
          </button>
        </section>
      </div>
    </main>
  );
}

