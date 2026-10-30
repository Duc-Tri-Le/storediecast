import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogKind, CatalogEntry } from "../types";
import { labelCls, inputCls } from "./shared";

export const CATALOG_PAGE_CONFIG: Record<
  CatalogKind,
  {
    title: string;
    addLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string | null;
    codePlaceholder: string;
    codeAuto?: boolean;
    intro: string;
  }
> = {
  vehicleTypes: {
    title: "Loại xe",
    addLabel: "Thêm loại xe",
    nameLabel: "Tên loại xe",
    namePlaceholder: "Ví dụ: Ô tô, Xe máy, Xe bán tải…",
    codeLabel: null,
    codePlaceholder: "",
    codeAuto: true,
    intro:
      "Loại xe của mỗi sản phẩm được chọn từ danh sách này ở trang Thêm sản phẩm và Chi tiết sản phẩm. Đổi tên một loại xe ở đây thì mọi sản phẩm đang dùng loại đó đổi theo ngay. Mã loại xe tự sinh từ tên, viết hoa không dấu (ví dụ Ô tô → OTO, Xe máy → XM, Xe bán tải → XBT), không cần nhập tay — đổi tên là mã tự sinh lại theo tên mới.",
  },
  carBrands: {
    title: "Hãng xe",
    addLabel: "Thêm hãng xe",
    nameLabel: "Tên hãng xe",
    namePlaceholder: "Ví dụ: BMW, Mercedes-Benz, Ferrari…",
    codeLabel: "Mã hãng xe (dùng để sinh SKU)",
    codePlaceholder: "Ví dụ: BMW, MB, FER",
    intro:
      "Hãng xe được chọn từ danh sách này khi thêm/sửa sản phẩm. Mã đi vào SKU nội bộ (ví dụ BMW → BMW, Mercedes-Benz → MB, Ferrari → FER). Đổi tên hoặc đổi mã ở đây thì sản phẩm, điều kiện bộ sưu tập và SKU sinh sau đó đều dùng giá trị mới.",
  },
  modelMakers: {
    title: "Hãng mô hình",
    addLabel: "Thêm hãng mô hình",
    nameLabel: "Tên hãng mô hình",
    namePlaceholder: "Ví dụ: GT Spirit, Mini GT, Bburago…",
    codeLabel: "Mã hãng mô hình (dùng để sinh SKU)",
    codePlaceholder: "Ví dụ: GTS, MGT, BB",
    intro:
      "Hãng mô hình được chọn từ danh sách này khi thêm/sửa sản phẩm. Mã đi vào đầu SKU nội bộ (ví dụ GT Spirit → GTS, Mini GT → MGT, Bburago → BB). Đổi tên hoặc đổi mã ở đây thì sản phẩm và SKU sinh sau đó đều dùng giá trị mới.",
  },
  scales: {
    title: "Tỉ lệ",
    addLabel: "Thêm tỉ lệ",
    nameLabel: "Giá trị tỉ lệ",
    namePlaceholder: "Ví dụ: 1:18",
    codeLabel: "Mã tỉ lệ (dùng để sinh SKU)",
    codePlaceholder: "Ví dụ: 18",
    intro:
      "Tỉ lệ được chọn từ danh sách này khi thêm/sửa sản phẩm và khi đặt điều kiện bộ sưu tập. Mã tỉ lệ đi vào SKU nội bộ (ví dụ 1:64 → 64). Đổi giá trị hoặc đổi mã ở đây thì sản phẩm, bộ sưu tập theo tỉ lệ và SKU sinh sau đó đều dùng giá trị mới.",
  },
};

export function vehicleTypeCodePreview(rawName: string): string | null {
  const name = rawName.trim();
  if (!name) return null;
  const strip = (s: string) =>
    s
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const key = strip(name).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
  const known: Record<string, string> = {
    "O TO": "OTO",
    "XE MAY": "XM",
    "XE BAN TAI": "XBT",
  };
  if (known[key]) return known[key];
  const words = strip(name).split(/[^A-Za-z0-9]+/).filter((w) => w.length > 0);
  if (words.length === 0) return null;
  if (words.length === 1) return (words[0] ?? "").toUpperCase().slice(0, 3) || null;
  return words.map((w) => (strip(w)[0] ?? "").toUpperCase()).join("") || null;
}

export function CatalogEntryEditor({
  kind,
  entry,
  onClose,
  onSaved,
  onDeleteRequest,
}: {
  kind: CatalogKind;
  entry: CatalogEntry | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
  onDeleteRequest?: () => void;
}) {
  const queryClient = useQueryClient();
  const cfg = CATALOG_PAGE_CONFIG[kind];
  const [name, setName] = useState(entry?.name ?? "");
  const [code, setCode] = useState(entry?.code ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: () =>
      entry
        ? api.adminUpdateCatalogEntry({
            catalog: kind,
            id: entry.id,
            name: name.trim(),
            code: code.trim(),
          })
        : api.adminCreateCatalogEntry({
            catalog: kind,
            name: name.trim(),
            code: code.trim(),
          }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được mục danh mục.");
        return;
      }
      queryClient.invalidateQueries();
      onSaved(
        entry
          ? `Đã lưu ${cfg.title.toLowerCase()} “${name.trim()}” — sản phẩm, bộ sưu tập và SKU liên quan đã dùng giá trị mới.`
          : `Đã thêm ${cfg.title.toLowerCase()} “${name.trim()}” vào danh mục — các ô chọn trong sản phẩm và bộ sưu tập đã có mục này.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    if (!name.trim()) return setFormError(`Thiếu ${cfg.nameLabel.toLowerCase()}.`);
    if (kind === "scales" && !/^\d+:\d+$/.test(name.trim()))
      return setFormError("Giá trị tỉ lệ phải theo dạng 1:64 (số:số).");
    if (cfg.codeLabel && !code.trim())
      return setFormError("Thiếu mã — mã dùng để sinh SKU nên không để trống.");
    setFormError(null);
    saveMut.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={entry ? `Sửa ${cfg.title.toLowerCase()}` : cfg.addLabel}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)] sm:rounded-2xl">
        <h2 className="text-lg font-bold">
          {entry ? `Sửa ${cfg.title.toLowerCase()}` : cfg.addLabel}
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className={labelCls} htmlFor="cat-name">
              {cfg.nameLabel}
            </label>
            <input
              id="cat-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={cfg.namePlaceholder}
            />
          </div>
          {cfg.codeLabel && (
            <div>
              <label className={labelCls} htmlFor="cat-code">
                {cfg.codeLabel}
              </label>
              <input
                id="cat-code"
                className={inputCls}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={cfg.codePlaceholder}
              />
              <p className="mt-1 text-xs text-[var(--dim)]">
                Chỉ chữ, số, dấu - và _; không khoảng trắng, không bắt đầu bằng số 0.
              </p>
            </div>
          )}
          {cfg.codeAuto && (
            <div>
              <span className={labelCls}>Mã loại xe (tự sinh từ tên)</span>
              <p className="rounded-lg border border-[var(--border)] bg-[var(--sidebar)] px-3 py-2.5 font-mono text-sm">
                {vehicleTypeCodePreview(name) ?? "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--dim)]">
                Mã tự sinh từ tên loại xe ở trên, viết hoa không dấu — không cần nhập tay,
                đổi tên là mã sinh lại theo tên mới.
              </p>
            </div>
          )}
          {entry && (entry.productCount > 0 || entry.collectionCount > 0) && (
            <p className="rounded-lg bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--dim)]">
              Mục này đang được {entry.productCount} sản phẩm và {entry.collectionCount} bộ
              sưu tập dùng —{" "}
              {cfg.codeAuto
                ? "đổi tên ở đây thì các sản phẩm và bộ sưu tập đó đổi theo, mã loại xe tự sinh lại theo tên mới."
                : "đổi tên hoặc đổi mã ở đây thì các sản phẩm và bộ sưu tập đó đổi theo, SKU liên quan được sinh lại theo mã mới."}
            </p>
          )}
        </div>
        {formError && (
          <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
            {formError}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={saveMut.isPending}
            onClick={submit}
            className="flex-1 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saveMut.isPending ? "Đang lưu…" : "Lưu"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm"
          >
            Hủy
          </button>
        </div>
        {entry && onDeleteRequest && (
          <button
            type="button"
            onClick={onDeleteRequest}
            className="mt-2 w-full rounded-lg border border-[#e3b3b3] bg-[#fdf0f0] py-2.5 text-sm font-semibold text-[#9c2b2b]"
          >
            Xóa {cfg.title.toLowerCase()} này
          </button>
        )}
      </div>
    </div>
  );
}

