import { avatarImg } from "../data/maps";
import { NAV_ITEMS, type NavItem } from "../data/collections";
import type { Page, Product, ScaleFilter, ShopCollection } from "../types";

export function Header({
  page,
  onNavigate,
  onNavigateCollection,
  search,
  onSearchChange,
  onSearchSubmit,
  cartCount,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onPickScale?: (s: ScaleFilter) => void;
  onPickBrand?: (b: string) => void;
  brandOptions?: string[];
  allProducts?: Product[];
  collections?: ShopCollection[];
  onNavigateCollection?: (slugOrPath: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  cartCount: number;
}) {
  const navButton = (item: NavItem, extraClass = "") => {
    const active = page === item.key;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          if (item.key === "collection" && onNavigateCollection) {
            onNavigateCollection("");
          } else {
            onNavigate(item.key);
          }
        }}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold transition ${extraClass} ${
          active
            ? "bg-[var(--dark)] text-white"
            : "text-[var(--dim)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
        }`}
      >
        <span className="min-w-0">{item.label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 pt-safe backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            aria-label="XE ĐỎ Model Shop — bấm để về trang chủ"
            className="shrink-0 rounded-full py-1 pr-1"
          >
            <img
              src={avatarImg}
              alt="XE ĐỎ · Model Shop"
              className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--border)]"
            />
          </button>
          <nav aria-label="Menu chính" className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => navButton(item))}
          </nav>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:flex-none">
            <form
              role="search"
              className="relative min-w-0 flex-1 sm:max-w-[260px] lg:w-[240px] lg:flex-none"
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
              }}
            >
              <label className="sr-only" htmlFor="header-search-input">
                Tìm kiếm sản phẩm
              </label>
              <svg
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dim)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="header-search-input"
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm xe, hãng…"
                className="w-full min-w-0 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </form>
            <button
              type="button"
              onClick={() => onNavigate("cart")}
              aria-label={
                cartCount > 0
                  ? `Đi tới trang Giỏ hàng, ${cartCount} sản phẩm`
                  : "Đi tới trang Giỏ hàng, chưa có sản phẩm"
              }
              aria-current={page === "cart" || page === "checkout" ? "page" : undefined}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white shadow-sm"
            >
              <svg
                aria-hidden
                className="h-[22px] w-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" fill="currentColor" />
                <circle cx="20" cy="21" r="1" fill="currentColor" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark)] px-1 text-[11px] font-bold tabular-nums text-white ring-2 ring-[var(--bg)]"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav
          aria-label="Menu chính trên điện thoại"
          className="grid grid-cols-3 gap-1.5 pb-3 min-[560px]:grid-cols-5 lg:hidden"
        >
          {NAV_ITEMS.map((item) =>
            navButton(item, "w-full px-2 text-center leading-snug min-[560px]:px-3")
          )}
        </nav>
      </div>
    </header>
  );
}
