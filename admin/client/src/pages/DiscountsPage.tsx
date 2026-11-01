import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Discount } from "../types";
import { fmtVND } from "../utils/format";
import { Icon, ICONS, Chip } from "../components/shared";
import { DiscountEditor } from "../components/DiscountEditor";
import { Pagination } from "../components/Pagination";

export function DiscountsPage({
  discounts,
  loading,
  error,
}: {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Discount | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Discount | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(discounts.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedDiscounts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return discounts.slice(start, start + PAGE_SIZE);
  }, [discounts, currentPage]);

  const toggleMut = useMutation({
    mutationFn: (d: Discount) =>
      api.adminUpsertDiscount({
        id: d.id,
        code: d.code,
        kind: d.kind as "percent" | "fixed",
        value: d.value,
        isActive: !d.isActive,
        note: d.note,
      }),
    onSuccess: (res) => {
      if (res.ok) queryClient.invalidateQueries();
      else setNotice(res.error ?? "Không đổi được trạng thái mã.");
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.adminDeleteDiscount({ discountId: id }),
    onSuccess: (res) => {
      setConfirmDelete(null);
      if (res.ok) {
        setNotice("Đã xóa mã khỏi database chung.");
        queryClient.invalidateQueries();
      } else setNotice(res.error ?? "Không xóa được mã.");
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">Mã giảm giá</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Icon d={ICONS.plus} size={15} /> Thêm mã
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Mã ở đây dùng chung với web khách: bật/tắt hay thêm mã là khách áp dụng được ngay.
      </p>
      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải mã giảm giá…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được mã: {error}
        </p>
      )}
      {!loading && !error && discounts.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">Chưa có mã giảm giá nào.</p>
      )}
      <div className="mt-5 space-y-2">
        {paginatedDiscounts.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] px-4 py-3"
          >
            <p className="font-mono text-base font-bold">{d.code}</p>
            <p className="text-sm">
              {d.kind === "percent" ? `Giảm ${d.value}%` : `Giảm ${fmtVND(d.value)}`}
            </p>
            {d.note && <p className="text-sm text-[var(--dim)]">{d.note}</p>}
            {d.isActive ? <Chip tone="green">Đang bật</Chip> : <Chip tone="gray">Đang tắt</Chip>}
            <span className="flex-1" />
            <button
              type="button"
              disabled={toggleMut.isPending}
              onClick={() => toggleMut.mutate(d)}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-sm disabled:opacity-50"
            >
              {d.isActive ? "Tắt mã" : "Bật mã"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(d)}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-sm"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(d)}
              className="rounded-lg border border-[#e3b3b3] px-2.5 py-1 text-sm text-[#9c2b2b]"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={discounts.length}
        pageSize={PAGE_SIZE}
        itemUnit="mã giảm giá"
        onPageChange={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {editing && (
        <DiscountEditor
          key={editing === "new" ? "new" : editing.id}
          discount={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            setNotice(msg);
          }}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Xóa mã giảm giá"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
            <h2 className="text-lg font-bold">Xóa mã {confirmDelete.code}?</h2>
            <p className="mt-2 text-sm text-[var(--dim)]">
              Khách sẽ không áp mã này được nữa. Đơn cũ đã dùng mã vẫn giữ nguyên thông tin giảm giá.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete.id)}
                className="flex-1 rounded-lg bg-[#c0392b] py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Xóa hẳn
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-[var(--border)] py-2 text-sm"
              >
                Giữ lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

