import type { Page, Order } from "../types";
import { orderCode } from "../utils/format";
import { Icon, ICONS, PAGE_LABELS } from "./shared";

export function AdminHeader({
  page,
  selectedOrder,
  newOrdersCount,
  onOpenMobileNav,
  onGoOrders,
}: {
  page: Page;
  selectedOrder: Order | null;
  newOrdersCount: number;
  onOpenMobileNav: () => void;
  onGoOrders: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[var(--border)] bg-white px-3 py-2 pt-safe md:hidden">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Mở menu điều hướng"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--accent-dark)] hover:bg-[var(--accent-soft)]"
      >
        <Icon d={ICONS.menu} size={22} />
      </button>
      <p className="min-w-0 flex-1 truncate text-base font-semibold">
        {selectedOrder && page === "orders"
          ? `Đơn ${orderCode(selectedOrder.id)}`
          : PAGE_LABELS[page]}
      </p>
      {page !== "orders" && newOrdersCount > 0 && (
        <button
          type="button"
          onClick={onGoOrders}
          aria-label={`${newOrdersCount} đơn mới chờ xác nhận`}
          className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)]"
        >
          {newOrdersCount} đơn mới
        </button>
      )}
    </header>
  );
}

