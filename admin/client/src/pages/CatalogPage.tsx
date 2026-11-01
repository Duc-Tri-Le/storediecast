import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogKind, CatalogData, CatalogEntry } from "../types";
import { Icon, ICONS } from "../components/shared";
import { Pagination } from "../components/Pagination";
import {
  CATALOG_PAGE_CONFIG,
  CatalogEntryEditor,
} from "../components/CatalogEntryEditor";

export function CatalogPage({
  kind,
  catalog,
  loading,
  error,
}: {
  kind: CatalogKind;
  catalog: CatalogData | null;
  loading: boolean;
  error: string | null;
}) {
  const queryClient = useQueryClient();
  const cfg = CATALOG_PAGE_CONFIG[kind];
  const entries = catalog?.[kind] ?? [];
  const [editing, setEditing] = useState<CatalogEntry | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CatalogEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState(false);
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [kind]);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, currentPage]);

  const deleteMut = useMutation({
    mutationFn: (e: CatalogEntry) =>
      api.adminDeleteCatalogEntry({ catalog: kind, id: e.id }),
    onSuccess: (res, e) => {
      setConfirmDelete(null);
      if (res.ok) {
        setNoticeError(false);
        setNotice(`Đã xóa ${cfg.title.toLowerCase()} “${e.name}” khỏi danh mục.`);
        queryClient.invalidateQueries();
      } else {
        setNoticeError(true);
        setNotice(res.error ?? "Không xóa được mục này.");
      }
    },
    onError: (e) => {
      setNoticeError(true);
      setNotice(e instanceof Error ? e.message : String(e));
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">{cfg.title}</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Icon d={ICONS.plus} size={15} /> {cfg.addLabel}
        </button>
      </div>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--dim)]">{cfg.intro}</p>
      {notice && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            noticeError ? "bg-[#fbe3e3] text-[#9c2b2b]" : "bg-[var(--accent-soft)]"
          }`}
        >
          {notice}
        </p>
      )}
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải danh mục…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được danh mục từ database chung: {error}
        </p>
      )}
      {!loading && !error && entries.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">
          Danh mục này đang trống — thêm mục đầu tiên để dùng trong sản phẩm và bộ sưu tập.
        </p>
      )}
      {!loading && !error && entries.length > 0 && (
        <>
          <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)]">
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-[var(--dim)]">
                    <th className="px-4 py-3 font-medium">{cfg.nameLabel}</th>
                    {(cfg.codeLabel || cfg.codeAuto) && (
                      <th className="w-44 px-4 py-3 font-medium">Mã</th>
                    )}
                    <th className="w-44 px-4 py-3 font-medium">Sản phẩm đang dùng</th>
                    <th className="w-44 px-4 py-3 font-medium">Bộ sưu tập đang dùng</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setEditing(e)}
                      className="cursor-pointer border-b border-[var(--border)] last:border-0 hover:bg-[var(--sidebar)]"
                    >
                      <td className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => setEditing(e)}
                          aria-label={`Sửa ${cfg.title.toLowerCase()} ${e.name}`}
                          className="text-left font-medium"
                        >
                          {e.name}
                        </button>
                      </td>
                      {(cfg.codeLabel || cfg.codeAuto) && (
                        <td className="px-4 py-3">
                          <span className="font-mono text-[13px]">{e.code ?? "—"}</span>
                        </td>
                      )}
                      <td className="px-4 py-3">{e.productCount} sản phẩm</td>
                      <td className="px-4 py-3">{e.collectionCount} bộ sưu tập</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[var(--border)] md:hidden">
              {paginatedEntries.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setEditing(e)}
                  className="cursor-pointer px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(e)}
                      aria-label={`Sửa ${cfg.title.toLowerCase()} ${e.name}`}
                      className="text-left font-medium"
                    >
                      {e.name}
                    </button>
                    {(cfg.codeLabel || cfg.codeAuto) && (
                      <span className="font-mono text-[13px] text-[var(--dim)]">
                        {e.code ?? "—"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--dim)]">
                    {e.productCount} sản phẩm · {e.collectionCount} bộ sưu tập đang dùng
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={entries.length}
            pageSize={PAGE_SIZE}
            itemUnit="mục"
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
      <p className="mt-3 text-xs leading-5 text-[var(--dim)]">
        Bấm vào một dòng để mở hộp sửa — xóa mục ở trong hộp sửa. Không xóa được mục đang
        có sản phẩm hoặc bộ sưu tập dùng — hệ thống sẽ báo rõ đang dùng ở bao nhiêu sản
        phẩm / bộ sưu tập; hãy đổi các sản phẩm và bộ sưu tập đó sang mục khác trước.
      </p>

      {editing && (
        <CatalogEntryEditor
          key={editing === "new" ? "new" : editing.id}
          kind={kind}
          entry={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            setNoticeError(false);
            setNotice(msg);
          }}
          onDeleteRequest={
            editing === "new"
              ? undefined
              : () => {
                  const target = editing;
                  setEditing(null);
                  setConfirmDelete(target);
                }
          }
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Xóa ${cfg.title.toLowerCase()} ${confirmDelete.name}`}
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
            <h2 className="text-lg font-bold">
              Xóa {cfg.title.toLowerCase()} “{confirmDelete.name}”?
            </h2>
            <p className="mt-2 text-sm text-[var(--dim)]">
              {confirmDelete.productCount > 0 || confirmDelete.collectionCount > 0
                ? `Mục này đang được dùng bởi ${confirmDelete.productCount} sản phẩm và ${confirmDelete.collectionCount} bộ sưu tập nên sẽ không xóa được — hệ thống sẽ báo rõ khi bạn xác nhận.`
                : "Mục này không còn sản phẩm hay bộ sưu tập nào dùng, xóa được ngay. Các ô chọn trong sản phẩm và bộ sưu tập sẽ không còn mục này nữa."}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete)}
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

