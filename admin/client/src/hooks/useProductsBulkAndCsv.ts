import { useState, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Product, ProductInput } from "../types";
import { planImport } from "../utils/productCsv";

export function useProductsBulkAndCsv({
  allProductsFallback,
  catalog,
  setNotice,
}: {
  allProductsFallback: Product[];
  catalog: CatalogData | null;
  setNotice: (msg: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [importResults, setImportResults] = useState<string[] | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<string[][] | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importOverwrite, setImportOverwrite] = useState(false);
  const importMetaRef = useRef<{ skipped: string[] }>({ skipped: [] });
  const fileRef = useRef<HTMLInputElement>(null);

  const importPlan = useMemo(
    () =>
      importRows != null
        ? planImport(importRows, allProductsFallback, importOverwrite, catalog)
        : null,
    [importRows, allProductsFallback, importOverwrite, catalog],
  );

  const closeImport = () => {
    setImportOpen(false);
    setImportRows(null);
    setImportFileName("");
  };

  const bulkDeleteMut = useMutation({
    mutationFn: (ids: number[]) => api.adminDeleteProductsBulk({ productIds: ids }),
    onSuccess: (res) => {
      setConfirmBulkDelete(false);
      if (res.ok) {
        setSelectedIds(new Set());
        setNotice(
          `Đã xóa ${res.deleted} sản phẩm cùng mọi biến thể màu của chúng khỏi database chung — web khách không còn thấy các sản phẩm này.`,
        );
        void queryClient.invalidateQueries({ queryKey: ["admin-products-paginated"] });
        void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else {
        setNotice(res.error ?? "Không xóa được các sản phẩm đã chọn.");
      }
    },
    onError: (e) => {
      setConfirmBulkDelete(false);
      setNotice(e instanceof Error ? e.message : String(e));
    },
  });

  const importMut = useMutation({
    mutationFn: (items: ProductInput[]) => api.adminImportProducts({ items }),
    onSuccess: (res, items) => {
      const lines = res.results.map((r, i) => {
        const name = items[i]?.name ?? `Sản phẩm ${i + 1}`;
        return r.ok ? `✓ ${name}` : `✗ ${name}: ${r.error ?? "lỗi không rõ"}`;
      });
      const skipped = importMetaRef.current.skipped;
      if (skipped.length > 0) {
        lines.push(
          `⊘ Đã bỏ qua ${skipped.length} sản phẩm trùng (chưa tích Ghi đè): ${skipped.join(", ")}`,
        );
      }
      setImportResults(lines);
      closeImport();
      void queryClient.invalidateQueries({ queryKey: ["admin-products-paginated"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => setImportResults([`✗ Lỗi nhập: ${e instanceof Error ? e.message : String(e)}`]),
  });

  const doImport = () => {
    if (!importPlan || importPlan.items.length === 0) return;
    importMetaRef.current = { skipped: importPlan.skippedDuplicates };
    importMut.mutate(importPlan.items);
  };

  const toggleSelected = (id: number, checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleSelectAllVisible = (paginatedIds: number[]) => (checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) for (const id of paginatedIds) next.add(id);
      else for (const id of paginatedIds) next.delete(id);
      return next;
    });

  return {
    selectedIds,
    setSelectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    bulkDeleteMut,
    importResults,
    setImportResults,
    importOpen,
    setImportOpen,
    importRows,
    setImportRows,
    importFileName,
    setImportFileName,
    importOverwrite,
    setImportOverwrite,
    importPlan,
    importMut,
    doImport,
    closeImport,
    fileRef,
    toggleSelected,
    toggleSelectAllVisible,
  };
}

