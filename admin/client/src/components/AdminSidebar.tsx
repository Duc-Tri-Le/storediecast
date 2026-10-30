import type { Page } from "../types";
import { Icon, ICONS } from "./shared";

export function AdminSidebar({
  page,
  navTo,
  mobileNavOpen,
  onCloseMobileNav,
  totalOrdersBadge,
  productsOpen,
  onToggleProductsOpen,
  onOpenProducts,
  catalogOpen,
  onToggleCatalogOpen,
  onOpenCatalog,
  inProductGroup,
  inCatalogGroup,
}: {
  page: Page;
  navTo: (key: Page) => void;
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  totalOrdersBadge?: number;
  productsOpen: boolean;
  onToggleProductsOpen: () => void;
  onOpenProducts: () => void;
  catalogOpen: boolean;
  onToggleCatalogOpen: () => void;
  onOpenCatalog: () => void;
  inProductGroup: boolean;
  inCatalogGroup: boolean;
}) {
  const productChildItem = (key: Page, label: string) => {
    const active = page === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => navTo(key)}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 pl-11 text-left text-sm whitespace-nowrap transition-colors ${
          active
            ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-dark)] shadow-[inset_0_0_0_1px_rgba(31,122,224,0.28)]"
            : "text-[var(--text)] hover:bg-[var(--accent-hover)]"
        }`}
      >
        <span className="flex-1">{label}</span>
      </button>
    );
  };

  const navItem = (
    key: Page,
    label: string,
    icon: string,
    opts?: { badge?: number; sub?: boolean },
  ) => {
    const active = page === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => navTo(key)}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors ${
          opts?.sub ? "pl-11" : ""
        } ${
          active
            ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-dark)] shadow-[inset_0_0_0_1px_rgba(31,122,224,0.28)]"
            : "text-[var(--text)] hover:bg-[var(--accent-hover)]"
        }`}
      >
        {!opts?.sub && <Icon d={icon} />}
        <span className="flex-1">{label}</span>
        {opts?.badge != null && opts.badge > 0 && (
          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-dark)]">
            {opts.badge}
          </span>
        )}
      </button>
    );
  };

  const railItems: Array<{
    key: Page;
    label: string;
    icon: string;
    active: boolean;
  }> = [
    { key: "home", label: "Trang chủ", icon: ICONS.home, active: page === "home" },
    { key: "orders", label: "Đơn hàng", icon: ICONS.orders, active: page === "orders" },
    {
      key: "analytics",
      label: "Phân tích",
      icon: ICONS.analytics,
      active: page === "analytics",
    },
    {
      key: "products",
      label: "Sản phẩm",
      icon: ICONS.products,
      active: page === "products",
    },
    {
      key: "inventory",
      label: "Tồn kho",
      icon: ICONS.inventory,
      active: page === "inventory",
    },
    {
      key: "collections",
      label: "Bộ sưu tập",
      icon: ICONS.collections,
      active: page === "collections",
    },
    {
      key: "bulkUpdate",
      label: "Cập nhật",
      icon: ICONS.bulk,
      active: page === "bulkUpdate",
    },
    {
      key: "catalogVehicleTypes",
      label: "Danh mục",
      icon: ICONS.catalog,
      active: inCatalogGroup,
    },
    {
      key: "discounts",
      label: "Giảm giá",
      icon: ICONS.discounts,
      active: page === "discounts",
    },
    {
      key: "customerSite",
      label: "Web khách",
      icon: ICONS.store,
      active: page === "customerSite",
    },
  ];

  return (
    <>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
        >
          <button
            type="button"
            aria-label="Đóng menu điều hướng"
            onClick={onCloseMobileNav}
            className="absolute inset-0 h-full w-full bg-[#0a2c50]/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 pt-safe">
              <p className="flex-1 text-base font-semibold">Menu</p>
              <button
                type="button"
                onClick={onCloseMobileNav}
                aria-label="Đóng menu"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--dim)] hover:bg-[var(--sidebar)] hover:text-[var(--text)]"
              >
                <Icon d={ICONS.close} size={20} />
              </button>
            </div>
            <nav
              aria-label="Điều hướng quản trị trên điện thoại"
              className="flex-1 overflow-y-auto px-3 py-3 [&_button]:min-h-[44px]"
            >
              {navItem("home", "Trang chủ", ICONS.home)}
              {navItem("orders", "Đơn hàng", ICONS.orders, {
                badge: totalOrdersBadge,
              })}
              {navItem("analytics", "Phân tích", ICONS.analytics)}
              <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase">
                Sản phẩm
              </p>
              {productChildItem("products", "Tất cả sản phẩm")}
              {productChildItem("inventory", "Tồn kho")}
              {productChildItem("collections", "Bộ sưu tập")}
              {productChildItem("bulkUpdate", "Cập nhật hàng loạt")}
              <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase">
                Quản lý danh mục
              </p>
              {productChildItem("catalogVehicleTypes", "Loại xe")}
              {productChildItem("catalogCarBrands", "Hãng xe")}
              {productChildItem("catalogModelMakers", "Hãng mô hình")}
              {productChildItem("catalogScales", "Tỉ lệ")}
              <div className="pt-3">
                {navItem("discounts", "Mã giảm giá", ICONS.discounts)}
                {navItem("customerSite", "Xem web khách", ICONS.store)}
              </div>
            </nav>
          </div>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-white md:block lg:hidden">
        <nav aria-label="Điều hướng quản trị thu gọn" className="flex flex-col gap-1 px-2 py-4">
          {railItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navTo(item.key)}
              aria-current={item.active ? "page" : undefined}
              aria-label={item.label}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center transition-colors ${
                item.active
                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-dark)] shadow-[inset_0_0_0_1px_rgba(31,122,224,0.28)]"
                  : "text-[var(--text)] hover:bg-[var(--accent-hover)]"
              }`}
            >
              <span className="relative">
                <Icon d={item.icon} size={20} />
                {item.key === "orders" && (totalOrdersBadge ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-3 rounded-full bg-[var(--accent)] px-1 text-[9px] leading-3.5 font-bold text-white">
                    {totalOrdersBadge}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-3">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 shrink-0 border-r border-[var(--border)] bg-white lg:block">
        <nav
          aria-label="Điều hướng quản trị"
          className="flex max-h-screen flex-col gap-1 overflow-y-auto px-3 py-5"
        >
          {navItem("home", "Trang chủ", ICONS.home)}
          {navItem("orders", "Đơn hàng", ICONS.orders, {
            badge: totalOrdersBadge,
          })}
          {navItem("analytics", "Phân tích", ICONS.analytics)}

          <div
            className={`flex w-full items-center rounded-lg text-sm whitespace-nowrap transition-colors ${
              inProductGroup
                ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-dark)] shadow-[inset_0_0_0_1px_rgba(31,122,224,0.28)]"
                : "text-[var(--text)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            <button
              type="button"
              onClick={onOpenProducts}
              aria-current={inProductGroup ? "page" : undefined}
              className="flex flex-1 items-center gap-2.5 px-3 py-2 text-left"
            >
              <Icon d={ICONS.products} />
              <span className="flex-1">Sản phẩm</span>
            </button>
            <button
              type="button"
              onClick={onToggleProductsOpen}
              aria-expanded={productsOpen}
              aria-label={productsOpen ? "Thu gọn mục Sản phẩm" : "Mở rộng mục Sản phẩm"}
              className="px-2 py-2 text-[var(--dim)]"
            >
              <span
                className={`block transition-transform ${productsOpen ? "rotate-90" : ""}`}
              >
                <Icon d={ICONS.chevron} size={14} />
              </span>
            </button>
          </div>
          {productsOpen && (
            <>
              {productChildItem("products", "Tất cả sản phẩm")}
              {productChildItem("inventory", "Tồn kho")}
              {productChildItem("collections", "Bộ sưu tập")}
              {productChildItem("bulkUpdate", "Cập nhật hàng loạt")}
            </>
          )}

          <div
            className={`flex w-full items-center rounded-lg text-sm whitespace-nowrap transition-colors ${
              inCatalogGroup
                ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-dark)] shadow-[inset_0_0_0_1px_rgba(31,122,224,0.28)]"
                : "text-[var(--text)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            <button
              type="button"
              onClick={onOpenCatalog}
              aria-current={inCatalogGroup ? "page" : undefined}
              className="flex flex-1 items-center gap-2.5 px-3 py-2 text-left"
            >
              <Icon d={ICONS.catalog} />
              <span className="flex-1">Quản lý danh mục</span>
            </button>
            <button
              type="button"
              onClick={onToggleCatalogOpen}
              aria-expanded={catalogOpen}
              aria-label={
                catalogOpen
                  ? "Thu gọn mục Quản lý danh mục"
                  : "Mở rộng mục Quản lý danh mục"
              }
              className="px-2 py-2 text-[var(--dim)]"
            >
              <span
                className={`block transition-transform ${catalogOpen ? "rotate-90" : ""}`}
              >
                <Icon d={ICONS.chevron} size={14} />
              </span>
            </button>
          </div>
          {catalogOpen && (
            <>
              {productChildItem("catalogVehicleTypes", "Loại xe")}
              {productChildItem("catalogCarBrands", "Hãng xe")}
              {productChildItem("catalogModelMakers", "Hãng mô hình")}
              {productChildItem("catalogScales", "Tỉ lệ")}
            </>
          )}

          {navItem("discounts", "Mã giảm giá", ICONS.discounts)}
          {navItem("customerSite", "Xem web khách", ICONS.store)}
        </nav>
      </aside>
    </>
  );
}

