import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Product, ProductInput, ShopCollection, Variant } from "../types";
import { BulkDeleteBar, BulkDeleteConfirmDialog, Icon, ICONS } from "../components/shared";
import { InventoryTable, productInputWithStocks } from "../components/InventoryTable";
import { ProductDetailPage } from "./ProductDetailPage";

export type StockFilter = "all" | "in" | "low" | "out";

export function InventoryPage({
  products,
  loading,
  error,
  collections,
  catalog,
  onGoProducts,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  collections: ShopCollection[];
  catalog: CatalogData | null;
  onGoProducts: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const saveMut = useMutation({
    mutationFn: (job: { input: ProductInput; variantIds: number[]; label: string }) =>
      api.adminUpsertProduct(job.input),
    onSuccess: (res, job) => {
      if (!res.ok) {
        setNotice(res.error ?? "Không lưu được tồn kho.");
        return;
      }
      setNotice(
        `Đã cập nhật tồn kho ${job.label} — ghi thẳng vào database chung, web khách thấy ngay.`,
      );
      setDrafts((d) => {
        const next = { ...d };
        for (const id of job.variantIds) delete next[id];
        return next;
      });
      queryClient.invalidateQueries();
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  const deleteVariantsMut = useMutation({
    mutationFn: (ids: number[]) => api.adminDeleteVariants({ variantIds: ids }),
    onSuccess: (res) => {
      setConfirmBulkDelete(false);
      if (res.ok) {
        setSelected([]);
        setNotice(
          `Đã xóa ${res.deleted} biến thể màu khỏi database chung` +
            (res.deletedProducts > 0
              ? ` — ${res.deletedProducts} sản phẩm đã hết biến thể nên cũng bị xóa hẳn.`
              : ".") +
            " Web khách không còn thấy các biến thể này.",
        );
        queryClient.invalidateQueries();
      } else {
        setNotice(res.error ?? "Không xóa được các biến thể đã chọn.");
      }
    },
    onError: (e) => {
      setConfirmBulkDelete(false);
      setNotice(e instanceof Error ? e.message : String(e));
    },
  });

  const allRows = useMemo(() => {
    const out: Array<{ product: Product; variant: Variant }> = [];
    for (const p of products) for (const v of p.variants) out.push({ product: p, variant: v });
    return out;
  }, [products]);

  const selectedRows = allRows.filter((r) => selected.includes(r.variant.id));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = allRows.filter(({ product, variant }) => {
      if (filter === "in" && variant.stock <= 0) return false;
      if (filter === "low" && !(variant.stock > 0 && variant.stock <= 3)) return false;
      if (filter === "out" && variant.stock > 0) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        variant.colorName.toLowerCase().includes(q) ||
        (variant.sku ?? "").toLowerCase().includes(q) ||
        (variant.internalCode ?? "").toLowerCase().includes(q)
      );
    });
    return filtered.sort((a, b) =>
      sortDir === "asc"
        ? a.variant.stock - b.variant.stock || a.product.name.localeCompare(b.product.name)
        : b.variant.stock - a.variant.stock || a.product.name.localeCompare(b.product.name),
    );
  }, [allRows, search, filter, sortDir]);

  const totalStockAll = allRows.reduce((s, r) => s + r.variant.stock, 0);

  const parsedDraft = (variantId: number): number | null => {
    const raw = drafts[variantId];
    if (raw == null || raw.trim() === "") return null;
    const n = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.trunc(n));
  };

  const targetFor = (variant: Variant): number | null => parsedDraft(variant.id);

  const stepDraft = (variant: Variant, delta: number) => {
    const shown = parsedDraft(variant.id) ?? variant.stock;
    const next = Math.max(0, shown + delta);
    setDrafts((d) => ({ ...d, [variant.id]: String(next) }));
  };

  const saveRow = (product: Product, variant: Variant) => {
    const target = targetFor(variant);
    if (target == null || target === variant.stock) return;
    saveMut.mutate({
      input: productInputWithStocks(product, new Map([[variant.id, target]])),
      variantIds: [variant.id],
      label: `“${product.name} — ${variant.colorName}” thành ${target} chiếc`,
    });
  };

  const toggleSelect = (variantId: number, checked: boolean) =>
    setSelected((s) =>
      checked ? [...new Set([...s, variantId])] : s.filter((x) => x !== variantId),
    );

  const visibleIds = rows.map((r) => r.variant.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const renderUpdateControls = (product: Product, variant: Variant) => {
    const target = targetFor(variant);
    const dirty = target != null && target !== variant.stock;
    return (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex w-fit items-center overflow-hidden rounded-lg border border-[var(--border)]"
            role="group"
            aria-label={`Cập nhật số lượng ${product.name} màu ${variant.colorName}`}
          >
            <button
              type="button"
              aria-label={`Giảm 1 số lượng cho ${product.name} màu ${variant.colorName}`}
              onClick={() => stepDraft(variant, -1)}
              className="px-3 py-1.5 text-base leading-6 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)]"
            >
              −
            </button>
            <input
              type="text"
              inputMode="numeric"
              aria-label={`Số lượng cập nhật cho ${product.name} màu ${variant.colorName}`}
              placeholder="0"
              value={drafts[variant.id] ?? String(variant.stock)}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, [variant.id]: e.target.value }))
              }
              className="w-[68px] border-x border-[var(--border)] bg-[var(--sidebar)] px-2 py-1.5 text-center text-sm outline-none focus:border-[var(--accent)] focus:bg-white"
            />
            <button
              type="button"
              aria-label={`Tăng 1 số lượng cho ${product.name} màu ${variant.colorName}`}
              onClick={() => stepDraft(variant, 1)}
              className="px-3 py-1.5 text-base leading-6 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)]"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!dirty || saveMut.isPending}
            onClick={() => saveRow(product, variant)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap hover:bg-[var(--sidebar)] disabled:opacity-40"
          >
            Lưu
          </button>
        </div>
        {target != null && (
          <p className="mt-1 text-xs text-[var(--dim)]">
            {dirty ? `Số lượng mới → sẽ thành ${target} chiếc` : "Đang bằng tồn hiện tại"}
          </p>
        )}
      </div>
    );
  };

  const detailProduct =
    detailProductId != null
      ? (products.find((p) => p.id === detailProductId) ?? null)
      : null;
  if (detailProduct) {
    return (
      <ProductDetailPage
        key={detailProduct.id}
        product={detailProduct}
        allProducts={products}
        collections={collections}
        catalog={catalog}
        backLabel="Tồn kho"
        onBack={() => setDetailProductId(null)}
        onSaved={(msg) => {
          setDetailProductId(null);
          setNotice(msg);
        }}
        onDeleted={(msg) => {
          setDetailProductId(null);
          setNotice(msg);
        }}
        onDuplicated={(msg) => {
          setDetailProductId(null);
          setNotice(msg);
        }}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onGoProducts}
        className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
      >
        ‹ Sản phẩm
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tồn kho</h1>
        <button
          type="button"
          onClick={onGoProducts}
          className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          Xem sản phẩm
        </button>
        <p className="ml-auto text-sm text-[var(--dim)]">
          {allRows.length} biến thể · Tổng tồn {totalStockAll} chiếc
        </p>
      </div>

      <div
        className="mt-5 flex gap-4 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Lọc tồn kho"
      >
        <button
          type="button"
          role="tab"
          aria-selected
          className="-mb-px border-b-2 border-[var(--accent)] px-1 pb-2 text-sm font-semibold whitespace-nowrap text-[var(--accent)]"
        >
          Tất cả ({allRows.length})
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
            <Icon d={ICONS.search} size={16} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm biến thể theo tên xe, màu, SKU"
            aria-label="Tìm kiếm biến thể"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--sidebar)] py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)] focus:bg-white"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Bộ lọc tồn kho</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StockFilter)}
            aria-label="Bộ lọc tồn kho"
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="all">Tất cả trạng thái tồn</option>
            <option value="in">Còn hàng</option>
            <option value="low">Sắp hết (còn ≤ 3)</option>
            <option value="out">Hết hàng</option>
          </select>
        </label>
      </div>

      <BulkDeleteBar
        count={selectedRows.length}
        unit="biến thể màu"
        deleting={deleteVariantsMut.isPending}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelected([])}
      />

      {confirmBulkDelete && selectedRows.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedRows.length} biến thể màu đã chọn?`}
          names={selectedRows.map(
            ({ product, variant }) =>
              `${product.name} — màu ${variant.colorName}${variant.sku ? ` (SKU ${variant.sku})` : ""}`,
          )}
          consequence="Các biến thể màu trên sẽ bị xóa khỏi sản phẩm của chúng; sản phẩm nào bị xóa hết biến thể thì sản phẩm đó cũng bị xóa hẳn."
          deleting={deleteVariantsMut.isPending}
          onConfirm={() =>
            deleteVariantsMut.mutate(selectedRows.map((r) => r.variant.id))
          }
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải tồn kho…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được tồn kho: {error}
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">
          Không có biến thể nào khớp.
        </p>
      )}

      {rows.length > 0 && (
        <InventoryTable
          rows={rows}
          selected={selected}
          allVisibleSelected={allVisibleSelected}
          sortDir={sortDir}
          setSortDir={setSortDir}
          toggleSelectAll={(checked) =>
            setSelected((s) =>
              checked ? [...new Set([...s, ...visibleIds])] : s.filter((id) => !visibleIds.includes(id)),
            )
          }
          toggleSelect={toggleSelect}
          onOpenDetail={(id) => setDetailProductId(id)}
          renderUpdateControls={renderUpdateControls}
        />
      )}
    </div>
  );
}

