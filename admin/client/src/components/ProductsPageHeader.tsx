import { type RefObject } from "react";
import { Icon, ICONS } from "./shared";
import { downloadCsv, parseFileToRows } from "../utils/productCsv";
import type { Product } from "../types";

export function ProductsPageHeader({
  allProducts,
  onAddNew,
  onOpenImport,
  fileRef,
  setNotice,
  setImportResults,
  setImportFileName,
  setImportRows,
}: {
  allProducts: Product[];
  onAddNew: () => void;
  onOpenImport: () => void;
  fileRef: RefObject<HTMLInputElement | null>;
  setNotice: (msg: string | null) => void;
  setImportResults: (r: string[] | null) => void;
  setImportFileName: (n: string) => void;
  setImportRows: (rows: string[][] | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="mr-auto text-2xl font-bold tracking-tight">Sản phẩm</h1>
      <button
        type="button"
        onClick={() => downloadCsv(allProducts)}
        title="Xuất toàn bộ sản phẩm ra file CSV (.csv)"
        className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium hover:bg-[var(--sidebar)]"
      >
        Xuất
      </button>
      <button
        type="button"
        onClick={onOpenImport}
        title="Nhập sản phẩm từ file CSV"
        className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium hover:bg-[var(--sidebar)]"
      >
        Nhập
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        aria-label="Chọn file CSV để nhập sản phẩm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (!f.name.toLowerCase().endsWith(".csv")) {
            setNotice("Hệ thống chỉ nhận file .csv. Vui lòng chọn file định dạng .csv.");
            return;
          }
          parseFileToRows(f)
            .then((rows) => {
              setImportResults(null);
              setImportFileName(f.name);
              setImportRows(rows);
              onOpenImport();
            })
            .catch((err) => {
              setNotice(
                `Không đọc được file: ${err instanceof Error ? err.message : String(err)}`,
              );
            });
        }}
      />
      <button
        type="button"
        onClick={onAddNew}
        className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
      >
        <Icon d={ICONS.plus} size={15} /> Thêm sản phẩm
      </button>
    </div>
  );
}

