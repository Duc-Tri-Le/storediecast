import type { CatalogData } from "../types";
import type { AddVariant } from "../utils/productFormTypes";
import { cardCls, inputCls, labelCls, smallBtn } from "./shared";

export function AddProductPricingInventorySection({
  first,
  setFirst,
  variants,
  setVariant,
  inventoryPolicy,
  setInventoryPolicy,
  weightKg,
  setWeightKg,
}: {
  first: AddVariant;
  setFirst: (patch: Partial<AddVariant>) => void;
  variants: AddVariant[];
  setVariant: (i: number, patch: Partial<AddVariant>) => void;
  inventoryPolicy: "track_stop" | "no_track";
  setInventoryPolicy: (p: "track_stop" | "no_track") => void;
  weightKg: string;
  setWeightKg: (w: string) => void;
}) {
  return (
    <>
      <section className={cardCls} aria-label="Pricing">
        <h2 className="text-sm font-bold">Pricing</h2>
        <p className="mt-1 text-xs text-[var(--dim)]">
          Giá của màu mặc định (màu 1). Các màu khác đặt giá ngay trong mục Variants.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="ap-price">
              Giá bán (₫)
            </label>
            <input
              id="ap-price"
              className={inputCls}
              inputMode="numeric"
              value={first.sellPrice}
              onChange={(e) => setFirst({ sellPrice: e.target.value })}
              placeholder="449000"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ap-compare">
              Giá so sánh (₫)
            </label>
            <input
              id="ap-compare"
              className={inputCls}
              inputMode="numeric"
              value={first.compareAt}
              onChange={(e) => setFirst({ compareAt: e.target.value })}
              placeholder="499000 — trống = không khuyến mãi"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ap-cost">
              Giá vốn (₫, tùy chọn)
            </label>
            <input
              id="ap-cost"
              className={inputCls}
              inputMode="numeric"
              value={first.costPrice}
              onChange={(e) => setFirst({ costPrice: e.target.value })}
              placeholder="Chỉ quản trị thấy, khách không thấy"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--dim)]">
          Giá so sánh là giá gốc hiện gạch ngang khi khuyến mãi.
        </p>
      </section>

      <section className={cardCls} aria-label="Inventory">
        <h2 className="text-sm font-bold">Inventory</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <span className={labelCls}>SKU (mã nội bộ)</span>
            <p className="rounded-lg bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--dim)]">
              Tự sinh khi lưu, theo hãng mô hình + tỉ lệ + hãng xe + dòng xe + màu.
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="ap-barcode">
              Mã vạch (tùy chọn)
            </label>
            <input
              id="ap-barcode"
              className={inputCls}
              value={first.barcode}
              onChange={(e) => setFirst({ barcode: e.target.value })}
              placeholder="Mã vạch của màu mặc định"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-policy">
            Chính sách tồn kho
          </label>
          <select
            id="ap-policy"
            className={inputCls}
            value={inventoryPolicy}
            onChange={(e) =>
              setInventoryPolicy(e.target.value as "track_stop" | "no_track")
            }
          >
            <option value="track_stop">Theo dõi tồn kho — ngừng bán khi hết hàng</option>
            <option value="no_track">Không theo dõi tồn kho</option>
          </select>
        </div>
      </section>

      <section className={cardCls} aria-label="Shipping">
        <h2 className="text-sm font-bold">Shipping</h2>
        <div className="mt-3 max-w-xs">
          <label className={labelCls} htmlFor="ap-weight">
            Cân nặng (kg, áp dụng cho mọi màu)
          </label>
          <input
            id="ap-weight"
            className={inputCls}
            inputMode="decimal"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Ví dụ: 0,5"
          />
        </div>
      </section>

      <section className={cardCls} aria-label="Variant Tag">
        <h2 className="text-sm font-bold">Variant Tag</h2>
        <p className="mt-1 text-xs text-[var(--dim)]">
          Thẻ riêng theo từng biến thể (tùy chọn, chỉ quản trị thấy).
        </p>
        <div className="mt-3 space-y-2">
          {variants.map((v, i) => (
            <div key={i}>
              <label className={labelCls} htmlFor={`ap-vtag-${i}`}>
                Màu {i + 1}
                {v.colorName ? ` — ${v.colorName}` : ""}
              </label>
              <input
                id={`ap-vtag-${i}`}
                className={inputCls}
                value={v.variantTag}
                onChange={(e) => setVariant(i, { variantTag: e.target.value })}
                placeholder="Ví dụ: track-id-xxxx"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function AddProductSidebarSection({
  isFeatured,
  setIsFeatured,
  vehicleType,
  setVehicleType,
  brand,
  setBrand,
  modelMaker,
  setModelMaker,
  scale,
  setScale,
  tags,
  setTags,
  tagDraft,
  setTagDraft,
  addTag,
  catalog,
}: {
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
  vehicleType: string;
  setVehicleType: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  modelMaker: string;
  setModelMaker: (v: string) => void;
  scale: string;
  setScale: (v: string) => void;
  tags: string[];
  setTags: (t: string[]) => void;
  tagDraft: string;
  setTagDraft: (t: string) => void;
  addTag: () => void;
  catalog: CatalogData | null;
}) {
  return (
    <div className="space-y-4">
      <section className={cardCls} aria-label="Tình trạng hiển thị">
        <h2 className="text-sm font-bold">Tình trạng hiển thị</h2>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#d9a514]" />
          Chưa lưu — sẽ hiện trên web bán hàng ngay sau khi lưu
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          Sản phẩm nổi bật trên web khách
        </label>
      </section>

      <section className={cardCls} aria-label="Tổ chức">
        <h2 className="text-sm font-bold">Tổ chức</h2>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-type">
            Loại xe
          </label>
          <select
            id="ap-type"
            className={inputCls}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="">— Chọn loại xe —</option>
            {(catalog?.vehicleTypes ?? []).map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-brand">
            Hãng xe
          </label>
          <select
            id="ap-brand"
            className={inputCls}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">— Chọn hãng xe —</option>
            {(catalog?.carBrands ?? []).map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-maker">
            Hãng mô hình (để sinh SKU nội bộ)
          </label>
          <select
            id="ap-maker"
            className={inputCls}
            value={modelMaker}
            onChange={(e) => setModelMaker(e.target.value)}
          >
            <option value="">— Chưa chọn (SKU chưa hoàn thiện) —</option>
            {(catalog?.modelMakers ?? []).map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-scale">
            Tỉ lệ
          </label>
          <select
            id="ap-scale"
            className={inputCls}
            value={scale}
            onChange={(e) => setScale(e.target.value)}
          >
            <option value="">— Chọn tỉ lệ —</option>
            {(catalog?.scales ?? []).map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="ap-tag">
            Thẻ
          </label>
          <div className="flex gap-2">
            <input
              id="ap-tag"
              className={inputCls}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ví dụ: Mở cửa, capo, cốp"
            />
            <button type="button" onClick={addTag} className={smallBtn}>
              Thêm thẻ
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-sm"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Bỏ thẻ ${t}`}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-[var(--dim)] hover:text-[#9c2b2b]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export { AddProductSeoSection } from "./AddProductSeoSection";
