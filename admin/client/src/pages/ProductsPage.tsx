import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Order, Product, ProductInput, ShopCollection } from "../types";
import { defaultVariant, totalStock } from "../utils/format";
import { downloadCsv, planImport } from "../utils/productCsv";
import { BulkDeleteBar, BulkDeleteConfirmDialog, Icon, ICONS } from "../components/shared";
import {
  ProductCsvImportModal,
  ProductImportResultsModal,
} from "../components/ProductCsvDialogs";
import { ProductTable } from "../components/ProductTable";
import {
  ProductFilterBar,
  type ProductSort,
  type ProductTab,
} from "../components/ProductFilterBar";
import { AddProductPage } from "./AddProductPage";
import { ProductDetailPage } from "./ProductDetailPage";

export type { ProductTab, ProductSort };

export function ProductsPage({
  products,
  loading,
  error,
  collections,
  catalog,
  scaleFilter,
  setScaleFilter,
  extraFilter,
  setExtraFilter,
  openProductId,
  openRequestKey,
  onConsumeOpenRequest,
}: {
  products: Product[];
  orders: Order[];
  openProductId?: number | null;
  openRequestKey?: number;
  onConsumeOpenRequest?: () => void;
  loading: boolean;
  error: string | null;
  collections: ShopCollection[];
  catalog: CatalogData | null;
  scaleFilter: string | null;
  setScaleFilter: (s: string | null) => void;
  extraFilter: { kind: "brand" | "vehicleType"; value: string } | null;
  setExtraFilter: (f: { kind: "brand" | "vehicleType"; value: string } | null) => void;
}) {
  const [tab, setTab] = useState<ProductTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("default");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const handledOpenKeyRef = useRef(0);
  useEffect(() => {
    if (openProductId == null || !openRequestKey) return;
    if (handledOpenKeyRef.current === openRequestKey) return;
    const target = products.find((p) => p.id === openProductId);
    if (!target) return;
    handledOpenKeyRef.current = openRequestKey;
    setEditing(target);
    onConsumeOpenRequest?.();
  }, [openProductId, openRequestKey, products, onConsumeOpenRequest]);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<string[] | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importOverwrite, setImportOverwrite] = useState(false);
  const importMetaRef = useRef<{ skipped: string[] }>({ skipped: [] });
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const importPlan = useMemo(
    () =>
      importText != null
        ? planImport(importText, products, importOverwrite, catalog)
        : null,
    [importText, products, importOverwrite, catalog],
  );

  const closeImport = () => {
    setImportOpen(false);
    setImportText(null);
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
        queryClient.invalidateQueries();
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
      queryClient.invalidateQueries();
    },
    onError: (e) => setImportResults([`✗ Lỗi nhập: ${e instanceof Error ? e.message : String(e)}`]),
  });

  const doImport = () => {
    if (!importPlan || importPlan.items.length === 0) return;
    importMetaRef.current = { skipped: importPlan.skippedDuplicates };
    importMut.mutate(importPlan.items);
  };

  const counts = useMemo(
    () => ({
      all: products.length,
      in: products.filter((p) => totalStock(p) > 0).length,
      out: products.filter((p) => totalStock(p) <= 0).length,
    }),
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (tab === "in" && totalStock(p) <= 0) return false;
      if (tab === "out" && totalStock(p) > 0) return false;
      if (scaleFilter && p.scale !== scaleFilter) return false;
      if (extraFilter?.kind === "brand" && p.brand !== extraFilter.value) return false;
      if (extraFilter?.kind === "vehicleType" && p.vehicleType !== extraFilter.value)
        return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.modelMaker ?? "").toLowerCase().includes(q) ||
        p.variants.some((v) => (v.sku ?? "").toLowerCase().includes(q)) ||
        (p.sku ?? "").toLowerCase().includes(q)
      );
    });
    const effectivePrice = (p: Product) => {
      const dv = defaultVariant(p);
      return dv?.promoPrice ?? dv?.price ?? 0;
    };
    const newestFirst = (a: Product, b: Product) =>
      b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
    const sorted = [...filtered];
    switch (sort) {
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        break;
      case "priceDesc":
        sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a) || newestFirst(a, b));
        break;
      case "priceAsc":
        sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b) || newestFirst(a, b));
        break;
      default:
        sorted.sort(newestFirst);
        break;
    }
    return sorted;
  }, [products, tab, search, scaleFilter, extraFilter, sort]);

  const tabs: Array<[ProductTab, string]> = [
    ["all", "Tất cả"],
    ["in", "Còn hàng"],
    ["out", "Hết hàng"],
  ];

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  const visibleIds = visible.map((p) => p.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const toggleSelected = (id: number, checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const toggleSelectAllVisible = (checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) for (const id of visibleIds) next.add(id);
      else for (const id of visibleIds) next.delete(id);
      return next;
    });

  if (editing === "new") {
    return (
      <AddProductPage
        allProducts={products}
        catalog={catalog}
        onBack={() => setEditing(null)}
        onSaved={(msg) => {
          setEditing(null);
          setNotice(msg);
        }}
      />
    );
  }

  if (editing) {
    return (
      <ProductDetailPage
        key={editing.id}
        product={editing}
        allProducts={products}
        collections={collections}
        catalog={catalog}
        onBack={() => setEditing(null)}
        onSaved={(msg) => {
          setEditing(null);
          setNotice(msg);
        }}
        onDeleted={(msg) => {
          setEditing(null);
          setNotice(msg);
        }}
        onDuplicated={(msg) => {
          setEditing(null);
          setNotice(msg);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">Sản phẩm</h1>
        <button
          type="button"
          onClick={() => downloadCsv(products)}
          className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium hover:bg-[var(--sidebar)]"
        >
          Xuất
        </button>
        <button
          type="button"
          onClick={() => {
            setImportResults(null);
            setImportOpen(true);
          }}
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
            f.text().then((text) => {
              setImportResults(null);
              setImportFileName(f.name);
              setImportText(text);
              setImportOpen(true);
            });
          }}
        />
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Icon d={ICONS.plus} size={15} /> Thêm sản phẩm
        </button>
      </div>

      <ProductFilterBar
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        scaleFilter={scaleFilter}
        onClearScaleFilter={() => setScaleFilter(null)}
        extraFilter={extraFilter}
        onClearExtraFilter={() => setExtraFilter(null)}
      />

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}

      <BulkDeleteBar
        count={selectedProducts.length}
        unit="sản phẩm"
        deleting={bulkDeleteMut.isPending}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelectedIds(new Set())}
      />
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải sản phẩm…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được sản phẩm: {error}
        </p>
      )}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">Không có sản phẩm nào khớp.</p>
      )}

      {visible.length > 0 && (
        <ProductTable
          visible={visible}
          selectedIds={selectedIds}
          allVisibleSelected={allVisibleSelected}
          toggleSelectAllVisible={toggleSelectAllVisible}
          toggleSelected={toggleSelected}
          onEditProduct={(p) => setEditing(p)}
        />
      )}

      {confirmBulkDelete && selectedProducts.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedProducts.length} sản phẩm đã chọn?`}
          names={selectedProducts.map(
            (p) => `${p.name} (${p.variants.length} màu · ${p.brand} · ${p.scale})`,
          )}
          consequence="Toàn bộ các sản phẩm trên cùng mọi biến thể màu của chúng sẽ bị xóa khỏi database chung."
          deleting={bulkDeleteMut.isPending}
          onConfirm={() =>
            bulkDeleteMut.mutate(selectedProducts.map((p) => p.id))
          }
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {importOpen && (
        <ProductCsvImportModal
          importFileName={importFileName}
          importText={importText}
          importPlan={importPlan}
          importOverwrite={importOverwrite}
          setImportOverwrite={setImportOverwrite}
          onPickFile={() => fileRef.current?.click()}
          onDoImport={doImport}
          onClose={closeImport}
          isPending={importMut.isPending}
        />
      )}

      {importResults && (
        <ProductImportResultsModal
          results={importResults}
          onClose={() => setImportResults(null)}
        />
      )}
    </div>
  );
}
