import type { Product } from "../types";
import type { CollectionCondition, MatchMode } from "../utils/collectionRules";
import {
  CONDITION_KIND_LABELS,
  CONDITION_OPERATOR_LABELS_EN,
} from "../utils/collectionRules";
import { defaultVariant, fmtVND } from "../utils/format";
import { Icon, ICONS, Thumb } from "./shared";

export type { BulkActionType, BulkMode, BulkActionDraft } from "../utils/bulkTypes";
export {
  BULK_ACTION_TYPE_LABELS,
  BULK_FIELD_ORDER,
  bulkModesFor,
  bulkActionLine,
  bulkDraftActionLine,
  selectCls,
} from "../utils/bulkTypes";
import { type BulkActionDraft, bulkDraftActionLine } from "../utils/bulkTypes";

export function BulkUpdatePreviewModal({
  matchMode,
  validConditions,
  variantMustMatch,
  bulkActions,
  matchedProducts,
  matchedVariantCount,
  onApply,
  onClose,
  isPending,
}: {
  matchMode: MatchMode;
  validConditions: CollectionCondition[];
  variantMustMatch: boolean;
  bulkActions: BulkActionDraft[];
  matchedProducts: Product[];
  matchedVariantCount: number;
  onApply: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07192f]/60 p-3 backdrop-blur-xs sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước cập nhật hàng loạt"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_25px_60px_-15px_rgba(7,25,47,0.4)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--table-head)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon
                d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
                size={20}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">
                Xem trước cập nhật hàng loạt
              </h2>
              <p className="text-xs text-[var(--dim)]">
                Kiểm tra kỹ danh sách sản phẩm và các thay đổi trước khi áp dụng
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng xem trước"
            disabled={isPending}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--dim)] transition-colors hover:bg-[var(--sidebar)] hover:text-[var(--text)] disabled:opacity-50"
          >
            <Icon d={ICONS.close} size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5">
          {/* Thông tin cảnh báo thân thiện */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-[#eef6ff] p-4 text-sm leading-relaxed text-[#144d82]">
            <span className="mt-0.5 text-[var(--accent)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
            <p>
              Hệ thống sẽ cập nhật trực tiếp vào cơ sở dữ liệu chung của cả web quản trị và web bán hàng. Hãy rà soát danh sách sản phẩm khớp bên dưới.
            </p>
          </div>

          {/* Grid 2 cột tóm tắt Điều kiện & Hành động */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Cột 1: Điều kiện lọc */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)] p-4">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                <h3 className="text-xs font-bold tracking-wider text-[var(--dim)] uppercase">
                  Điều kiện lọc
                </h3>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)] shadow-xs">
                  {matchMode === "all" ? "Khớp tất cả (VÀ)" : "Khớp bất kỳ (HOẶC)"}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {validConditions.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[var(--text)] shadow-xs"
                  >
                    <span className="rounded bg-[var(--sidebar)] px-1.5 py-0.5 font-bold text-[var(--dim)]">
                      {CONDITION_KIND_LABELS[c.kind]}
                    </span>
                    <span className="text-[var(--dim)]">
                      {CONDITION_OPERATOR_LABELS_EN[c.operator]}
                    </span>
                    <strong className="truncate font-semibold text-[var(--accent)]">
                      "{c.value}"
                    </strong>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--dim)]">
                Phạm vi áp dụng:{" "}
                <span className="font-semibold text-[var(--text)]">
                  {variantMustMatch
                    ? "Chỉ các biến thể khớp điều kiện"
                    : "Toàn bộ biến thể của sản phẩm khớp"}
                </span>
              </p>
            </div>

            {/* Cột 2: Hành động thay đổi */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)] p-4">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                <h3 className="text-xs font-bold tracking-wider text-[var(--dim)] uppercase">
                  Hành động sẽ thực hiện
                </h3>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-[#14663c] shadow-xs">
                  {bulkActions.length} thao tác
                </span>
              </div>
              <ol className="mt-3 space-y-2">
                {bulkActions.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[var(--text)] shadow-xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--accent)]">
                      {i + 1}
                    </span>
                    <span className="leading-tight">{bulkDraftActionLine(a)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Danh sách sản phẩm khớp */}
          <section aria-label="Sản phẩm khớp mẫu" className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text)]">Danh sách sản phẩm khớp</h3>
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                  {matchedProducts.length} sản phẩm
                </span>
                <span className="rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-xs font-semibold text-[var(--dim)]">
                  {matchedVariantCount} biến thể
                </span>
              </div>
            </div>

            {matchedProducts.length === 0 ? (
              <div className="my-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--sidebar)] px-4 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#94a9c2] shadow-xs">
                  <Icon d={ICONS.products} size={28} />
                </div>
                <p className="mt-3 text-base font-bold text-[var(--text)]">
                  Không tìm thấy sản phẩm nào khớp
                </p>
                <p className="mt-1 text-xs text-[var(--dim)]">
                  Vui lòng điều chỉnh lại bộ lọc điều kiện ở bước trước.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="mt-3 hidden max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--table-head)] text-xs font-semibold tracking-wider text-[var(--dim)] uppercase">
                      <tr>
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="w-28 px-4 py-3">Loại xe</th>
                        <th className="w-32 px-4 py-3">Hãng xe</th>
                        <th className="w-24 px-4 py-3">Tỉ lệ</th>
                        <th className="w-36 px-4 py-3 text-right">Giá hiện tại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-white">
                      {matchedProducts.map((p) => {
                        const dv = defaultVariant(p);
                        return (
                          <tr key={p.id} className="transition-colors hover:bg-[var(--sidebar)]">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <Thumb product={p} size={38} />
                                <div>
                                  <p className="font-semibold text-[var(--text)]">{p.name}</p>
                                  <p className="text-xs text-[var(--dim)]">Mã #{p.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="rounded bg-[var(--sidebar)] px-2 py-0.5 text-xs font-medium text-[var(--dim)]">
                                {p.vehicleType}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs font-medium text-[var(--text)]">
                              {p.brand}
                            </td>
                            <td className="px-4 py-2.5 text-xs font-bold text-[var(--dim)]">
                              {p.scale}
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              {dv ? (
                                dv.promoPrice != null ? (
                                  <div>
                                    <span className="font-bold text-[#b45309]">
                                      {fmtVND(dv.promoPrice)}
                                    </span>
                                    <span className="block text-[11px] text-[var(--dim)] line-through">
                                      {fmtVND(dv.price)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-[var(--text)]">
                                    {fmtVND(dv.price)}
                                  </span>
                                )
                              ) : (
                                <span className="text-[var(--dim)]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View List */}
                <div className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-white sm:hidden">
                  {matchedProducts.map((p) => {
                    const dv = defaultVariant(p);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3">
                        <Thumb product={p} size={44} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-sm text-[var(--text)]">{p.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--dim)]">
                            {p.vehicleType} · {p.brand} · {p.scale}
                          </p>
                          <div className="mt-1">
                            {dv ? (
                              dv.promoPrice != null ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="font-bold text-[#b45309]">
                                    {fmtVND(dv.promoPrice)}
                                  </span>
                                  <span className="text-[var(--dim)] line-through">
                                    {fmtVND(dv.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-[var(--text)]">
                                  {fmtVND(dv.price)}
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-[var(--dim)]">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--table-head)] px-6 py-4">
          <div className="text-xs text-[var(--dim)]">
            {matchedProducts.length > 0 ? (
              <span>
                Áp dụng cho <strong className="text-[var(--text)]">{matchedProducts.length}</strong> sản phẩm ({matchedVariantCount} biến thể)
              </span>
            ) : (
              <span>Không thể áp dụng khi chưa khớp sản phẩm</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-xs transition-colors hover:bg-[var(--sidebar)] disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={matchedProducts.length === 0 || isPending}
              onClick={onApply}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Đang áp dụng…</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Áp dụng cập nhật</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
