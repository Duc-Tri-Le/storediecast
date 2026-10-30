import type { Overview, Page, OrderTab } from "../types";
import type { useShopData } from "../services/useShopData";
import { fmtVND, greeting } from "../utils/format";
import { Icon, ICONS } from "../components/shared";

export function HomePage({
  data,
  goOrders,
  setPage,
}: {
  data: ReturnType<typeof useShopData>;
  goOrders: (t: OrderTab) => void;
  setPage: (p: Page) => void;
}) {
  const ov: Overview | undefined = data.overview.data;
  const openOrders = ov ? ov.newOrders + ov.confirmedOrders : 0;

  const stat = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]">
      <p className="text-[28px] leading-8 font-bold tracking-tight text-[var(--accent-dark)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--dim)]">{label}</p>
      {sub && <p className="text-xs text-[var(--dim)]">{sub}</p>}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting()}, chủ shop
      </h1>
      {data.overview.isPending && (
        <p className="mt-6 text-sm text-[var(--dim)]">Đang tải số liệu…</p>
      )}
      {data.overview.error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được số liệu từ database chung:{" "}
          {String(data.overview.error.message ?? data.overview.error)}
        </p>
      )}
      {ov && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stat("Tổng doanh thu", fmtVND(ov.revenueDone), "Chỉ tính đơn đã chuyển khoản")}
            {stat("Tổng đơn hàng", String(ov.totalOrders))}
            {stat("Đơn đang mở", String(openOrders), "Mới + đã xác nhận")}
            {stat("Đơn mới", String(ov.newOrders), "Chờ xác nhận")}
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={() => goOrders("open")}
              className="flex w-full items-center gap-3 bg-[var(--sidebar)] px-4 py-3.5 text-left text-sm font-medium hover:bg-[var(--accent-soft)]"
            >
              <Icon d={ICONS.orders} size={16} />
              <span className="flex-1">{openOrders} đơn đang mở</span>
              <Icon d={ICONS.chevron} size={16} />
            </button>
            <button
              type="button"
              onClick={() => goOrders("hold")}
              className="flex w-full items-center gap-3 border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-3.5 text-left text-sm font-medium hover:bg-[var(--accent-soft)]"
            >
              <Icon d={ICONS.orders} size={16} />
              <span className="flex-1">
                {ov.newOrders} đơn chờ xác nhận / thanh toán
              </span>
              <Icon d={ICONS.chevron} size={16} />
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setPage("inventory")}
              className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-4 py-3 text-left hover:bg-[var(--sidebar)]"
            >
              <p className="text-lg font-bold">{ov.lowStockVariants + ov.outOfStockVariants}</p>
              <p className="text-sm text-[var(--dim)]">
                màu sắp hết / đã hết hàng (tổng tồn {ov.totalStock})
              </p>
            </button>
            <button
              type="button"
              onClick={() => setPage("products")}
              className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-4 py-3 text-left hover:bg-[var(--sidebar)]"
            >
              <p className="text-lg font-bold">{ov.incompleteSkuProducts}</p>
              <p className="text-sm text-[var(--dim)]">
                sản phẩm chưa có SKU hoàn chỉnh (thiếu hãng mô hình)
              </p>
            </button>
            <button
              type="button"
              onClick={() => setPage("discounts")}
              className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-4 py-3 text-left hover:bg-[var(--sidebar)]"
            >
              <p className="text-lg font-bold">
                {ov.activeDiscounts}/{ov.totalDiscounts}
              </p>
              <p className="text-sm text-[var(--dim)]">mã giảm giá đang bật</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

