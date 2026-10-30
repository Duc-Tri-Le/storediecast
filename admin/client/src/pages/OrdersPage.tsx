import { useMemo, useState } from "react";
import type { Order, OrderTab, Product } from "../types";
import { orderCode, orderTabOf } from "../utils/format";
import { Icon, ICONS } from "../components/shared";
import { OrderCard, OrderRow } from "../components/OrderComponents";

export function OrdersPage({
  orders,
  products,
  loading,
  error,
  tab,
  setTab,
  onOpenOrder,
}: {
  orders: Order[];
  products: Product[];
  loading: boolean;
  error: string | null;
  tab: OrderTab;
  setTab: (t: OrderTab) => void;
  onOpenOrder: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  // Trạng thái mở rộng của từng đơn: mỗi đơn độc lập — mở/thu gọn một
  // đơn không làm mất trạng thái của các đơn khác, và không chuyển trang.
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = useMemo(() => {
    const c: Record<OrderTab, number> = { all: orders.length, open: 0, hold: 0, closed: 0 };
    for (const o of orders) for (const t of orderTabOf(o)) if (t !== "all") c[t]++;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (!orderTabOf(o).includes(tab)) return false;
      if (!q) return true;
      return (
        orderCode(o.id).toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.items.some((it) => it.productName.toLowerCase().includes(q))
      );
    });
  }, [orders, tab, search]);

  const tabs: Array<[OrderTab, string]> = [
    ["all", "Tất cả"],
    ["open", "Đang mở"],
    ["hold", "Đang giữ"],
    ["closed", "Đã đóng"],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>

      <div
        className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Lọc đơn hàng"
      >
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm whitespace-nowrap ${
              tab === key
                ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                : "border-transparent text-[var(--dim)] hover:text-[var(--text)]"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
          <Icon d={ICONS.search} size={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn, tên khách, số điện thoại, tên sản phẩm"
          aria-label="Tìm kiếm đơn hàng"
          className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
        />
      </div>

      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải đơn hàng…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được đơn hàng: {error}
        </p>
      )}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">
          Không có đơn hàng nào khớp.
        </p>
      )}

      {visible.length > 0 && (
        <>
          {/* Bảng trên màn hình rộng */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-xs tracking-wide text-[var(--dim)] uppercase">
                  <th className="px-4 py-3 font-medium">Đơn</th>
                  <th className="px-4 py-3 font-medium">Ngày</th>
                  <th className="px-4 py-3 font-medium">Khách hàng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái giao hàng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái thanh toán</th>
                  <th className="px-4 py-3 text-right font-medium">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <OrderRow
                    key={o.id}
                    order={o}
                    products={products}
                    expanded={expandedIds.has(o.id)}
                    onToggle={() => toggleExpanded(o.id)}
                    onOpen={() => onOpenOrder(o.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {/* Thẻ trên điện thoại */}
          <div className="mt-4 space-y-3 lg:hidden">
            {visible.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                products={products}
                expanded={expandedIds.has(o.id)}
                onToggle={() => toggleExpanded(o.id)}
                onOpen={() => onOpenOrder(o.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

