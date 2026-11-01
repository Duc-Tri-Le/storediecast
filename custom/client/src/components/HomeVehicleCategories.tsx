import type { Product, VehicleFilter } from "../types";
import { CategoryRow } from "./ProductCards";
import { scale132Img, resolveProductImage } from "../data/maps";

export function HomeVehicleCategories({
  vehicleGroups,
  allProducts,
  loading,
  onOpenProducts,
  onPickVehicle,
}: {
  vehicleGroups: Array<{ key: string; desc: string }>;
  allProducts: Product[];
  loading: boolean;
  onOpenProducts: () => void;
  onPickVehicle: (v: VehicleFilter) => void;
}) {
  return (
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
            className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
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
                onClick={() => onPickVehicle(g.key as VehicleFilter)}
                aria-label={`Mua theo loại xe ${g.key}, ${count} mẫu — xem ở trang Sản phẩm đã lọc sẵn loại xe này`}
                className="block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left cursor-pointer transition hover:border-[var(--accent)]"
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
  );
}

