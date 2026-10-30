import { useEffect, useRef, useState } from "react";
import { avatarImg } from "../data/maps";
import { NAV_ITEMS, type NavItem } from "../data/collections";
import type { Page, Product, ScaleFilter } from "../types";

export function Header({
  page,
  onNavigate,
  onPickScale,
  onPickBrand,
  brandOptions,
  allProducts,
  search,
  onSearchChange,
  onSearchSubmit,
  cartCount,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onPickScale: (s: ScaleFilter) => void;
  onPickBrand: (b: string) => void;
  brandOptions: string[];
  allProducts: Product[];
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  cartCount: number;
}) {
  const [openMenu, setOpenMenu] = useState<"products" | "collection" | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  const navButton = (item: NavItem, extraClass = "") => {
    const isDrop = item.key === "products" || item.key === "collection";
    const dropKey = item.key === "products" ? "products" : item.key === "collection" ? "collection" : null;
    const expanded = dropKey != null && openMenu === dropKey;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          if (dropKey) {
            setOpenMenu((prev) => (prev === dropKey ? null : dropKey));
          } else {
            setOpenMenu(null);
            onNavigate(item.key);
          }
        }}
        aria-pressed={!isDrop ? page === item.key : undefined}
        aria-haspopup={isDrop ? "true" : undefined}
        aria-expanded={isDrop ? expanded : undefined}
        aria-current={page === item.key ? "page" : undefined}
        aria-label={
          item.key === "products"
            ? expanded
              ? "Sản phẩm — đóng khung danh sách hãng xe"
              : "Sản phẩm — mở khung danh sách hãng xe"
            : item.key === "collection"
              ? expanded
                ? "Bộ sưu tập — đóng khung danh sách bộ sưu tập"
                : "Bộ sưu tập — mở khung danh sách bộ sưu tập"
              : undefined
        }
        className={`flex min-h-[44px] shrink-0 items-center justify-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold ${extraClass} ${
          page === item.key || expanded ? "bg-[var(--dark)] text-white" : "text-[var(--dim)]"
        }`}
      >
        <span className="min-w-0">{item.label}</span>
        {isDrop && (
          <svg
            aria-hidden
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </button>
    );
  };

  const dropSquare = (
    <span
      aria-hidden
      className="inline-block h-3 w-3 shrink-0 rounded-[2px] border-[1.5px] border-current opacity-60"
    />
  );

  const headerDropdown = openMenu && (
    <div
      className="absolute inset-x-0 top-full z-40 px-4 pb-2"
      role="group"
      aria-label={openMenu === "products" ? "Danh sách hãng xe" : "Danh sách bộ sưu tập"}
    >
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[0_18px_44px_rgba(20,16,10,0.22)]">
          {openMenu === "products" ? (
            <div className="p-3 sm:p-4">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onPickScale("all");
                }}
                aria-label="Tất cả sản phẩm — sang trang Sản phẩm không lọc"
                className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--surface2)] px-3 py-2.5 text-left text-[15px] font-bold transition hover:text-[var(--accent)]"
              >
                {dropSquare}
                Tất cả sản phẩm
                <span aria-hidden className="ml-auto text-[var(--dim)]">→</span>
              </button>
              {brandOptions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-[var(--dim)]">Đang tải danh sách hãng xe…</p>
              ) : (
                <div className="mt-1 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                  {brandOptions.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onPickBrand(b);
                      }}
                      aria-label={`Xem sản phẩm hãng ${b} — sang trang Sản phẩm đã lọc theo hãng ${b}`}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] transition hover:bg-[var(--surface2)] hover:text-[var(--accent)]"
                    >
                      {dropSquare}
                      <span className="min-w-0">{b}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onNavigate("collection");
                }}
                aria-label="Tất cả bộ sưu tập — sang trang Bộ sưu tập"
                className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--surface2)] px-3 py-2.5 text-left text-[15px] font-bold transition hover:text-[var(--accent)]"
              >
                {dropSquare}
                Tất cả bộ sưu tập
                <span aria-hidden className="ml-auto text-[var(--dim)]">→</span>
              </button>
              <div className="mt-1 grid grid-cols-1 gap-x-8">
                {(["1:64", "1:32", "1:16"] as const).map((s) => {
                  const count = allProducts.filter((p) => p.scale === s).length;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onPickScale(s);
                      }}
                      aria-label={`Bộ sưu tập tỉ lệ ${s} — sang trang Sản phẩm đã lọc theo tỉ lệ ${s}`}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] transition hover:bg-[var(--surface2)] hover:text-[var(--accent)]"
                    >
                      {dropSquare}
                      <span className="min-w-0 font-semibold">Bộ sưu tập tỉ lệ {s}</span>
                      <span className="ml-auto shrink-0 text-sm tabular-nums text-[var(--dim)]">
                        {count} mẫu
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 pt-safe backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => {
              setOpenMenu(null);
              onNavigate("home");
            }}
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
              onClick={() => {
                setOpenMenu(null);
                onNavigate("cart");
              }}
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
      {headerDropdown}
    </header>
  );
}

