import { useState } from "react";
import type { ImportPlan } from "../utils/productCsv";
import { downloadCsvTemplate } from "../utils/productCsv";

export function ProductCsvImportModal({
  importFileName,
  hasData,
  importPlan,
  importOverwrite,
  setImportOverwrite,
  onPickFile,
  onDoImport,
  onClose,
  isPending,
}: {
  importFileName: string;
  hasData: boolean;
  importPlan: ImportPlan | null;
  importOverwrite: boolean;
  setImportOverwrite: (v: boolean) => void;
  onPickFile: () => void;
  onDoImport: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [importHelp, setImportHelp] = useState(false);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Nhập sản phẩm từ file CSV"
    >
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">Nhập sản phẩm từ file CSV</h2>
          <button
            type="button"
            aria-label="Đóng hộp thoại nhập CSV"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={onPickFile}
            className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
          >
            Chọn file CSV
          </button>
          <span className="text-sm text-[var(--dim)]">
            {importFileName || "Chưa chọn file nào"}
          </span>
        </div>

        <p className="mt-3 text-sm text-[var(--dim)]">
          Tải{" "}
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="font-medium text-[var(--accent)] underline"
          >
            file mẫu CSV
          </button>{" "}
          để xem định dạng yêu cầu. Hoặc{" "}
          <button
            type="button"
            aria-expanded={importHelp}
            onClick={() => setImportHelp((s) => !s)}
            className="font-medium text-[var(--accent)] underline"
          >
            Tìm hiểu thêm
          </button>{" "}
          cách điền file chính xác.
        </p>
        {importHelp && (
          <div className="mt-2 space-y-1.5 rounded-lg bg-[var(--sidebar)] p-3 text-sm">
            <p>
              Mỗi dòng là một màu của một sản phẩm; các dòng cùng Tên sản phẩm + Hãng xe +
              Tỉ lệ được gộp thành một sản phẩm nhiều màu.
            </p>
            <p>
              Cột bắt buộc: <strong>Tên sản phẩm, Hãng xe, Tỉ lệ, Loại xe, Màu, Giá (VND)</strong>.
              Giá và Giá khuyến mãi điền số nguyên VND (giá khuyến mãi phải nhỏ hơn giá, để
              trống nếu không khuyến mãi).
            </p>
            <p>
              <strong>Hãng xe, Tỉ lệ, Loại xe và Hãng mô hình phải ghi đúng một mục đang có
              trong Quản lý danh mục</strong> — giá trị không có trong danh mục sẽ bị báo lỗi
              rõ theo từng dòng và dòng đó không được nhập; hệ thống không tự tạo mục mới.
              Thêm mục mới ở mục Quản lý danh mục trước nếu cần.
            </p>
            <p>
              <strong>Link ảnh</strong> là đường link ảnh http/https của màu đó (giống cách
              thêm ảnh từ link ở form thủ công); để trống thì dùng ảnh mặc định theo tỉ lệ.
              <strong> Nổi bật</strong> điền Có hoặc Không.
            </p>
            <p>
              Dòng ví dụ có [VÍ DỤ] trong file mẫu luôn bị bỏ qua, không nhập vào shop. Dòng
              nào lỗi sẽ được báo rõ ở phần xem trước và không được nhập.
            </p>
          </div>
        )}

        <label className="mt-3 flex items-start gap-2 border-t border-[var(--border)] pt-3 text-sm">
          <input
            type="checkbox"
            checked={importOverwrite}
            onChange={(e) => setImportOverwrite(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Ghi đè sản phẩm đã có cùng tên + hãng + tỉ lệ
            <span className="block text-xs text-[var(--dim)]">
              Không tích thì sản phẩm trùng sẽ bị bỏ qua và báo rõ số lượng ở phần xem trước.
            </span>
          </span>
        </label>

        {hasData && importPlan && (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-sm">
              Sẽ nhập <strong>{importPlan.items.length}</strong> sản phẩm (
              {importPlan.newCount} mới, {importPlan.updateCount} cập nhật) — nhập xong ghi
              thẳng vào database chung, web khách thấy ngay, SKU tự sinh theo quy ước của shop.
            </p>
            {importPlan.items.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-[var(--dim)]">
                {importPlan.items.map((it, i) => (
                  <li key={i}>
                    • {it.name} — {it.variants.length} màu{it.id ? " (cập nhật)" : " (mới)"}
                  </li>
                ))}
              </ul>
            )}
            {importPlan.skippedExampleRows > 0 && (
              <p className="mt-2 text-sm text-[var(--dim)]">
                Đã bỏ qua {importPlan.skippedExampleRows} dòng ví dụ trong file mẫu.
              </p>
            )}
            {importPlan.skippedDuplicates.length > 0 && (
              <p className="mt-2 rounded-lg bg-[#fdf0d3] px-3 py-2 text-sm text-[#8a5d08]">
                Bỏ qua {importPlan.skippedDuplicates.length} sản phẩm đã có (chưa tích Ghi
                đè): {importPlan.skippedDuplicates.join(", ")}.
              </p>
            )}
            {importPlan.errors.length > 0 && (
              <div className="mt-2 rounded-lg bg-[#fbe3e3] px-3 py-2 text-sm text-[#9c2b2b]">
                <p className="font-semibold">
                  {importPlan.errors.length} dòng lỗi — các dòng này sẽ KHÔNG được nhập:
                </p>
                {importPlan.errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            disabled={!importPlan || importPlan.items.length === 0 || isPending}
            onClick={onDoImport}
            className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Đang tải lên…" : "Tải lên file"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductImportResultsModal({
  results,
  onClose,
}: {
  results: string[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Kết quả nhập sản phẩm"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
        <h2 className="text-lg font-bold">Kết quả nhập</h2>
        <div className="mt-3 space-y-1 text-sm">
          {results.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] py-2 text-sm font-semibold text-white"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

