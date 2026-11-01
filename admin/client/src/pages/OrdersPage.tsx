import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Order, OrderTab, Product } from "../types";
import { Icon, ICONS } from "../components/shared";
import { OrderCard, OrderRow } from "../components/OrderComponents";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 50;

export function OrdersPage({
  products,
  tab: routeTab = "all",
  setTab,
  onOpenOrder,
  routePageNumber = 1,
  routeSearch = "",
  onNavigateRoute,
}: {
  orders: Order[];
  products: Product[];
  loading: boolean;
  error: string | null;
  tab: OrderTab;
  setTab: (t: OrderTab) => void;
  onOpenOrder: (id: number) => void;
  routePageNumber?: number;
  routeSearch?: string;
  onNavigateRoute?: (params: { pageNumber?: number; tab?: OrderTab; search?: string }) => void;
}) {
  const [tab, setTabLocal] = useState<OrderTab>(
    routeTab && ["all", "open", "hold", "closed"].includes(routeTab)
      ? (routeTab as OrderTab)
      : "all",
  );
  const [search, setSearchLocal] = useState(routeSearch || "");
  const [currentPage, setCurrentPageLocal] = useState(routePageNumber || 1);

  // Sync state when URL parameters change
  useEffect(() => {
    if (routePageNumber != null) setCurrentPageLocal(routePageNumber);
    if (routeTab != null && ["all", "open", "hold", "closed"].includes(routeTab)) {
      setTabLocal(routeTab as OrderTab);
    }
    if (routeSearch !== undefined) setSearchLocal(routeSearch);
  }, [routePageNumber, routeTab, routeSearch]);

  const updateRoute = (updates: {
    pageNumber?: number;
    tab?: OrderTab;
    search?: string;
  }) => {
    const nextTab = updates.tab !== undefined ? updates.tab : tab;
    const nextSearch = updates.search !== undefined ? updates.search : search;
    const nextPage = updates.pageNumber !== undefined ? updates.pageNumber : 1;

    setTab(nextTab);
    onNavigateRoute?.({
      pageNumber: nextPage,
      tab: nextTab,
      search: nextSearch,
    });
  };

  const handleTabChange = (t: OrderTab) => {
    setTabLocal(t);
    setCurrentPageLocal(1);
    updateRoute({ tab: t, pageNumber: 1 });
  };

  const handleSearchChange = (s: string) => {
    setSearchLocal(s);
    setCurrentPageLocal(1);
    updateRoute({ search: s, pageNumber: 1 });
  };

  const handlePageChange = (p: number) => {
    setCurrentPageLocal(p);
    updateRoute({ pageNumber: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FETCH ONLY CURRENT PAGE FROM SERVER (LIMIT 50 OFFSET ...)
  const ordersQ = useQuery({
    queryKey: ["admin-orders-paginated", currentPage, tab, search],
    queryFn: () =>
      api.adminListOrdersPaginated({
        page: currentPage,
        pageSize: PAGE_SIZE,
        tab,
        search,
      }),
  });

  const paginatedOrders = ordersQ.data?.orders ?? [];
  const total = ordersQ.data?.total ?? 0;
  const totalPages = ordersQ.data?.totalPages ?? 1;
  const counts = ordersQ.data?.counts ?? { all: 0, open: 0, hold: 0, closed: 0 };
  const loading = ordersQ.isLoading;
  const error = ordersQ.error
    ? ordersQ.error instanceof Error
      ? ordersQ.error.message
      : String(ordersQ.error)
    : null;

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
            onClick={() => handleTabChange(key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm whitespace-nowrap transition-colors ${
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
          onChange={(e) => handleSearchChange(e.target.value)}
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
      {!loading && !error && paginatedOrders.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">
          Không có đơn hàng nào khớp.
        </p>
      )}

      {paginatedOrders.length > 0 && (
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
                {paginatedOrders.map((o) => (
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
            {paginatedOrders.map((o) => (
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            itemUnit="đơn hàng"
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
