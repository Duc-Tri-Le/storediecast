import type { ReactNode } from "react";
import type { Page, Product } from "../types";
import { defaultVariant, directImageSrc } from "../utils/format";

export function SafeAreaTopScrim(_props?: { backgroundColor?: string }) {
  return null;
}

export const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

export const labelCls = "mb-1 block text-xs font-medium tracking-wide text-[var(--dim)] uppercase";

export const cardCls = "rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] bg-white";

export const smallBtn =
  "rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--sidebar)] disabled:opacity-50";

export const editLink = "text-sm font-medium text-[var(--accent)]";

export function BackButton({
  label,
  onClick,
  ariaLabel,
  className = "",
}: {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || `Quay lại ${label}`}
      className={`group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold tracking-wider text-[var(--dim)] uppercase transition-colors hover:bg-[var(--sidebar)] hover:text-[var(--text)] ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform group-hover:-translate-x-0.5"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

export function Thumb({ product, size = 44 }: { product: Product; size?: number }) {
  const dv = defaultVariant(product);
  const src = dv ? directImageSrc(dv.imageKey) : null;
  if (src) {
    return (
      <img
        src={src}
        alt={`Ảnh ${product.name}`}
        loading="lazy"
        className="shrink-0 rounded-md border border-[var(--border)] object-cover shadow-2xs"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)]"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        className="h-5 w-5 opacity-40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

export function Chip({
  tone,
  children,
}: {
  tone: "amber" | "green" | "blue" | "gray" | "red";
  children: ReactNode;
}) {
  const styles: Record<string, string> = {
    amber: "bg-[#fdf0d3] text-[#8a5d08]",
    green: "bg-[#dcf2e3] text-[#14663c]",
    blue: "bg-[#e3effc] text-[#155a9e]",
    gray: "bg-[#e9f1f9] text-[#47617c]",
    red: "bg-[#fbe3e3] text-[#9c2b2b]",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  home: "M3 11.5 12 4l9 7.5 M5.5 10v9h13v-9",
  orders: "M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z M9 8h6 M9 12h6",
  products: "M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z M3.5 8 12 12.5 20.5 8 M12 12.5V20",
  inventory: "M4 8.5 12 5l8 3.5V19H4z M4 8.5 12 12l8-3.5 M9 19v-5h6v5",
  catalog: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  discounts: "M4 5a2 2 0 0 1 2-2h12v6a3 3 0 0 0 0 6v6H6a2 2 0 0 1-2-2z M13.5 7.5 16.5 16.5 M14 9h.01 M16 15h.01",
  store: "M4 10v10h16V10 M3 6.5 5 3h14l2 3.5a3.2 3.2 0 0 1-6 .5 3.2 3.2 0 0 1-6 0 3.2 3.2 0 0 1-6-.5z M9.5 20v-5h5v5",
  analytics: "M4 20h16 M6.5 20v-5 M11 20V6.5 M15.5 20v-8 M20 20V9",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M20 20l-3.8-3.8",
  plus: "M12 5v14 M5 12h14",
  chevron: "M9 6l6 6-6 6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  close: "M6 6l12 12 M18 6L6 18",
  collections:
    "M3.5 8.5A2.5 2.5 0 0 1 6 6h3l2 2.5h7A2.5 2.5 0 0 1 20.5 11v6A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17z",
  bulk: "M12 3.5 21 8.5l-9 5-9-5z M3.5 13.5 12 18l8.5-4.5 M3.5 17.5 12 22l8.5-4.5",
};

export const PAGE_LABELS: Record<Page, string> = {
  home: "Trang chủ",
  orders: "Đơn hàng",
  analytics: "Phân tích",
  products: "Tất cả sản phẩm",
  inventory: "Tồn kho",
  collections: "Bộ sưu tập",
  bulkUpdate: "Cập nhật hàng loạt",
  discounts: "Mã giảm giá",
  customerSite: "Xem web khách",
  catalogVehicleTypes: "Loại xe",
  catalogCarBrands: "Hãng xe",
  catalogModelMakers: "Hãng mô hình",
  catalogScales: "Tỉ lệ",
};

export function BulkDeleteBar({
  count,
  unit,
  deleting,
  onDelete,
  onClear,
}: {
  count: number;
  unit: string;
  deleting: boolean;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count <= 0) return null;
  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e3b3b3] bg-[#fdf3f3] px-4 py-3"
      role="region"
      aria-label={`Hành động cho ${count} ${unit} đã chọn`}
    >
      <p className="text-sm font-semibold">
        Đã chọn {count} {unit}
      </p>
      <span className="flex-1" />
      <button
        type="button"
        disabled={deleting}
        onClick={onDelete}
        aria-label={`Xóa ${count} ${unit} đã chọn`}
        className="rounded-lg bg-[#c0392b] px-3.5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {deleting ? "Đang xóa…" : "Xóa"}
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={onClear}
        className="text-sm text-[var(--accent)] underline disabled:opacity-50"
      >
        Bỏ chọn
      </button>
    </div>
  );
}

export function BulkDeleteConfirmDialog({
  title,
  names,
  consequence,
  deleting,
  onConfirm,
  onCancel,
}: {
  title: string;
  names: string[];
  consequence: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-[var(--dim)]">
          Bạn sắp xóa <strong className="text-[var(--text)]">{names.length} mục</strong>:
        </p>
        <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto rounded-lg bg-[var(--sidebar)] px-3 py-2 text-sm">
          {names.map((n, i) => (
            <li key={i} className="leading-6">
              • {n}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[#9c2b2b]">
          {consequence} Việc xóa này <strong>không thể hoàn tác</strong> và các mục trên sẽ
          mất ngay ở web bán hàng dùng chung database với web quản trị này.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#c0392b] py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting ? "Đang xóa…" : "Xóa hẳn"}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--border)] py-2 text-sm disabled:opacity-50"
          >
            Giữ lại
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnsavedChangesBar({
  visible,
  saving,
  onSave,
  onDiscard,
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (!visible) return null;
  return (
    <div
      className="sticky top-16 z-30 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[0_10px_34px_-14px_rgba(10,44,80,0.4)] lg:top-4"
      role="region"
      aria-label="Thay đổi chưa lưu"
    >
      <p className="text-base font-medium">Thay đổi chưa lưu</p>
      <span className="flex-1" />
      <button
        type="button"
        disabled={saving}
        onClick={onDiscard}
        aria-label="Hủy bỏ thay đổi chưa lưu"
        className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--sidebar)] disabled:opacity-50"
      >
        Hủy bỏ
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        aria-label="Lưu thay đổi"
        className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-50"
      >
        {saving ? "Đang lưu…" : "Lưu"}
      </button>
    </div>
  );
}
