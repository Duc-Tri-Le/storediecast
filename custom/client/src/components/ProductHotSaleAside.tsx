import type { Product } from "../types";
import { SideSection } from "./ProductFilterSidebar";
import { MiniProductCard } from "./ProductCards";

export function ProductHotSaleAside({
  hotProducts,
  saleProducts,
  openHot,
  openSale,
  onToggleHot,
  onToggleSale,
  onDetail,
}: {
  hotProducts: Product[];
  saleProducts: Product[];
  openHot: boolean;
  openSale: boolean;
  onToggleHot: () => void;
  onToggleSale: () => void;
  onDetail: (p: Product) => void;
}) {
  return (
    <aside
      aria-label="Sản phẩm hot và đang giảm giá"
      className="order-3 min-w-0 lg:sticky lg:top-[5.5rem] lg:self-start"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <SideSection
            panelId="side-panel-hot"
            title="Sản phẩm hot"
            open={openHot}
            onToggle={onToggleHot}
          >
            {hotProducts.length === 0 ? (
              <p className="px-1 py-1 text-sm text-[var(--dim)]">Chưa có mẫu nổi bật nào.</p>
            ) : (
              <div className="flex flex-col">
                {hotProducts.map((p) => (
                  <MiniProductCard key={p.id} product={p} onDetail={onDetail} />
                ))}
              </div>
            )}
          </SideSection>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <SideSection
            panelId="side-panel-sale"
            title="Giảm giá"
            open={openSale}
            onToggle={onToggleSale}
          >
            {saleProducts.length === 0 ? (
              <p className="px-1 py-1 text-sm text-[var(--dim)]">
                Hiện chưa có mẫu nào đang giảm giá.
              </p>
            ) : (
              <div className="flex flex-col">
                {saleProducts.map((p) => (
                  <MiniProductCard key={p.id} product={p} onDetail={onDetail} preferSale />
                ))}
              </div>
            )}
          </SideSection>
        </div>
      </div>
    </aside>
  );
}

