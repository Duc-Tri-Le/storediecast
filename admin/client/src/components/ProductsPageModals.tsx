import type { Product } from "../types";
import { BulkDeleteConfirmDialog } from "./shared";
import {
  ProductCsvImportModal,
  ProductImportResultsModal,
} from "./ProductCsvDialogs";
import type { ImportPlan } from "../utils/productCsv";
import type { RefObject } from "react";

export interface ProductsPageModalsProps {
  confirmBulkDelete: boolean;
  selectedProducts: Product[];
  isBulkDeleting: boolean;
  onConfirmBulkDelete: () => void;
  onCancelBulkDelete: () => void;

  importOpen: boolean;
  importFileName: string;
  hasData: boolean;
  importPlan: ImportPlan | null;
  importOverwrite: boolean;
  setImportOverwrite: (val: boolean) => void;
  fileRef: RefObject<HTMLInputElement | null>;
  onCloseImport: () => void;
  onImport: () => void;
  isImporting: boolean;

  importResults: string[] | null;
  onCloseImportResults: () => void;

  notice: string | null;
  onCloseNotice: () => void;
}

export function ProductsPageModals({
  confirmBulkDelete,
  selectedProducts,
  isBulkDeleting,
  onConfirmBulkDelete,
  onCancelBulkDelete,

  importOpen,
  importFileName,
  hasData,
  importPlan,
  importOverwrite,
  setImportOverwrite,
  fileRef,
  onCloseImport,
  onImport,
  isImporting,

  importResults,
  onCloseImportResults,

  notice,
  onCloseNotice,
}: ProductsPageModalsProps) {
  return (
    <>
      {confirmBulkDelete && selectedProducts.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedProducts.length} sản phẩm đã chọn?`}
          names={selectedProducts.map(
            (p) => `${p.name} (${p.variants.length} màu · ${p.brand} · ${p.scale})`,
          )}
          consequence="Toàn bộ các sản phẩm trên cùng mọi biến thể màu của chúng sẽ bị xóa khỏi database chung."
          deleting={isBulkDeleting}
          onConfirm={onConfirmBulkDelete}
          onCancel={onCancelBulkDelete}
        />
      )}

      {importOpen && (
        <ProductCsvImportModal
          importFileName={importFileName}
          hasData={hasData}
          importPlan={importPlan}
          importOverwrite={importOverwrite}
          setImportOverwrite={setImportOverwrite}
          onPickFile={() => fileRef.current?.click()}
          onClose={onCloseImport}
          onDoImport={onImport}
          isPending={isImporting}
        />
      )}

      {importResults && (
        <ProductImportResultsModal
          results={importResults}
          onClose={onCloseImportResults}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-40 max-w-md rounded-xl border border-[var(--border)] bg-white p-4 shadow-lg text-sm"
        >
          <div className="flex items-start gap-2">
            <span className="text-[var(--accent)] font-bold">ℹ</span>
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={onCloseNotice}
              className="text-[var(--dim)] hover:text-[var(--text)] font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
