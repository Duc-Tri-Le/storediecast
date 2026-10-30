import { useState, type ReactNode } from "react";
import type { Product } from "../types";
import { defaultVariant, effectivePrice, fmt, saleDisplayVariant, variantPrice } from "../services/pricing";
import { resolveProductImage } from "../data/maps";

export function MiniProductCard({
  product: p,
  onDetail,
  preferSale = false,
}: {
  product: Product;
  onDetail: (p: Product) => void;
  preferSale?: boolean;
}) {
  // Ở mục Giảm giá, giá hiển thị là của màu đang khuyến mãi; các chỗ
  // khác hiện giá của màu mặc định.
  const v = preferSale ? saleDisplayVariant(p) : defaultVariant(p);
  const price = v ? variantPrice(v) : effectivePrice(p);
  const listPrice = v ? v.price : p.price;
  const promo = v ? v.promoPrice : p.promoPrice;
  const imgKey = v ? v.imageKey : p.imageKey;
  const colorName = v ? v.colorName : p.colorName;
  return (
    <button
      type="button"
      onClick={() => onDetail(p)}
      aria-label={`Xem chi tiết ${p.name}`}
      className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-[var(--surface2)]"
    >
      <img
        src={resolveProductImage(imgKey)}
        alt={`Mô hình ${p.name} màu ${colorName} tỉ lệ ${p.scale}`}
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-snug">{p.name}</span>
        {promo ? (
          <span className="mt-0.5 block text-xs tabular-nums text-[var(--dim)] line-through">
            {fmt(listPrice)}
          </span>
        ) : null}
        <span className="block text-[15px] font-black tabular-nums text-[var(--accent)]">
          {fmt(price)}
        </span>
      </span>
    </button>
  );
}

// Thẻ sản phẩm dạng danh sách (chế độ Xem = danh sách ở cột giữa): ảnh
// nằm trái, thông tin và nút thêm giỏ nằm phải — cùng dữ liệu với thẻ lưới.
export function ProductListCard({
  product: p,
  onDetail,
  onAdd,
  onBuyNow,
}: {
  product: Product;
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}) {
  const price = effectivePrice(p);
  const discount = p.promoPrice ? Math.round((1 - p.promoPrice / p.price) * 100) : 0;
  const out = p.stock <= 0;
  return (
    <article className="flex gap-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:gap-4">
      <button
        type="button"
        onClick={() => onDetail(p)}
        aria-label={`Xem chi tiết ${p.name}`}
        className="relative block w-32 shrink-0 self-start sm:w-44"
      >
        <img
          src={resolveProductImage(p.imageKey)}
          alt={`Mô hình ${p.name} màu ${p.colorName} tỉ lệ ${p.scale}`}
          className="aspect-[4/3] w-full rounded-xl object-cover"
          loading="lazy"
        />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-bold text-white">
          {p.scale}
        </span>
        {discount > 0 && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[var(--promo)] px-2 py-0.5 text-[11px] font-bold text-white">
            −{discount}%
          </span>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={() => onDetail(p)}
          className="mt-0.5 text-left text-[15px] font-bold leading-snug"
        >
          {p.name}
        </button>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <div>
            {p.promoPrice ? (
              <p className="text-xs tabular-nums text-[var(--dim)] line-through">{fmt(p.price)}</p>
            ) : null}
            <p className="text-lg font-black tabular-nums text-[var(--accent)]">{fmt(price)}</p>
            <p className="text-xs text-[var(--dim)]">
              {out ? "Tạm hết — nhắn shop hỏi đợt mới" : `Còn ${p.stock} chiếc`}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              disabled={out}
              onClick={() => onAdd(p)}
              aria-label={`Thêm ${p.name} vào giỏ`}
              className="min-h-[44px] rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--surface2)] disabled:text-[var(--dim)]"
            >
              {out ? "Hết hàng" : "Thêm vào giỏ"}
            </button>
            <button
              type="button"
              disabled={out}
              onClick={() => onBuyNow(p)}
              aria-label={`Mua ngay ${p.name} — mở hộp thoại đặt hàng riêng, không qua giỏ hàng`}
              className="min-h-[44px] rounded-full bg-[var(--dark)] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--surface2)] disabled:text-[var(--dim)]"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCard({
  product: p,
  onDetail,
  onAdd,
  onBuyNow,
}: {
  product: Product;
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}) {
  const price = effectivePrice(p);
  const discount = p.promoPrice ? Math.round((1 - p.promoPrice / p.price) * 100) : 0;
  const out = p.stock <= 0;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => onDetail(p)}
        aria-label={`Xem chi tiết ${p.name}`}
        className="relative block text-left"
      >
        <img
          src={resolveProductImage(p.imageKey)}
          alt={`Mô hình ${p.name} màu ${p.colorName} tỉ lệ ${p.scale}`}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white">
          {p.scale}
        </span>
        {discount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--promo)] px-2.5 py-1 text-[11px] font-bold text-white">
            −{discount}%
          </span>
        )}
        {out && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-xs font-bold text-white">
            HẾT HÀNG
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <button type="button" onClick={() => onDetail(p)} className="mt-0.5 text-left text-[15px] font-bold leading-snug">
          {p.name}
        </button>
        <div className="mt-auto pt-2.5">
          {p.promoPrice ? <p className="text-xs text-[var(--dim)] line-through">{fmt(p.price)}</p> : null}
          <p className="text-lg font-black tabular-nums text-[var(--accent)]">{fmt(price)}</p>
          <p className="text-xs text-[var(--dim)]">
            {out ? "Tạm hết — nhắn shop hỏi đợt mới" : `Còn ${p.stock} chiếc`}
          </p>
          <button
            type="button"
            disabled={out}
            onClick={() => onAdd(p)}
            aria-label={`Thêm ${p.name} vào giỏ`}
            className="mt-2 min-h-[44px] w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--surface2)] disabled:text-[var(--dim)]"
          >
            {out ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
          <button
            type="button"
            disabled={out}
            onClick={() => onBuyNow(p)}
            aria-label={`Mua ngay ${p.name} — mở hộp thoại đặt hàng riêng, không qua giỏ hàng`}
            className="mt-2 min-h-[44px] w-full rounded-full bg-[var(--dark)] py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[var(--surface2)] disabled:text-[var(--dim)]"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductRow({
  products,
  sectionLabel,
  onDetail,
  onAdd,
  onBuyNow,
}: {
  products: Product[];
  sectionLabel: string;
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}) {
  const items = products.slice(0, 8);
  const [pageIdx, setPageIdx] = useState(0);
  const pageCount = Math.ceil(items.length / 4);
  const safePage = Math.min(pageIdx, Math.max(0, pageCount - 1));
  const visible = items.slice(safePage * 4, safePage * 4 + 4);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;
  // Mũi tên NỔI trên thẻ sản phẩm (không phải cụm phân trang riêng, không có
  // chỉ số trang): → nằm ở mép phải của thẻ cuối đang hiện, chỉ hiện khi còn
  // 4 mẫu tiếp theo; ← nằm ở mép trái của thẻ đầu đang hiện, chỉ hiện khi
  // quay lại được. Mục có ≤4 mẫu thì không hiện mũi tên nào.
  const arrowBtn =
    "absolute top-[26%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-xl font-black shadow-[0_6px_18px_rgba(0,0,0,0.30)] transition hover:bg-[var(--accent)] hover:text-white";
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {visible.map((p, i) => (
        <div key={p.id} className="relative [&>article]:h-full">
          <ProductCard product={p} onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
          {i === 0 && canPrev ? (
            <button
              type="button"
              onClick={() => setPageIdx(safePage - 1)}
              aria-label={`Quay lại 4 mẫu trước của mục ${sectionLabel}`}
              className={`${arrowBtn} left-1.5`}
            >
              ←
            </button>
          ) : null}
          {i === visible.length - 1 && canNext ? (
            <button
              type="button"
              onClick={() => setPageIdx(safePage + 1)}
              aria-label={`Xem tiếp 4 mẫu nữa của mục ${sectionLabel}`}
              className={`${arrowBtn} right-1.5`}
            >
              →
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// Hàng Ô DANH MỤC dùng chung cho các mục Chọn theo tỉ lệ / Mua theo loại
// xe ở trang chủ — cùng quy tắc hiển thị như các dòng sản
// phẩm (ProductRow): 1 dòng, mỗi lần tối đa 4 ô, tối đa 8 ô mỗi mục, mũi
// tên NỔI trên ô cuối/đầu của dòng (không có chỉ số trang, không có cụm
// nút phân trang riêng). Mục có ≤4 ô thì hiện hết và không có mũi tên; ô
// vượt quá 8 xem qua nút "Xem tất cả" của mục đó sang trang đã lọc đầy đủ.
export function CategoryRow<T>({
  items,
  sectionLabel,
  getKey,
  renderItem,
  padForArrows = false,
}: {
  items: T[];
  sectionLabel: string;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  // Ô dạng chữ (hãng): khi mũi tên nổi hiện, ô đầu/cuối được thụt nội dung
  // vào trong để mũi tên không che mất tên. Ô dạng ảnh không cần vì mũi
  // tên nằm trên vùng ảnh, không có chữ.
  padForArrows?: boolean;
}) {
  const capped = items.slice(0, 8);
  const [pageIdx, setPageIdx] = useState(0);
  const pageCount = Math.ceil(capped.length / 4);
  const safePage = Math.min(pageIdx, Math.max(0, pageCount - 1));
  const visible = capped.slice(safePage * 4, safePage * 4 + 4);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;
  const arrowBtn =
    "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-xl font-black shadow-[0_6px_18px_rgba(0,0,0,0.30)] transition hover:bg-[var(--accent)] hover:text-white";
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {visible.map((item, i) => (
        <div
          key={getKey(item)}
          className={`relative [&>*]:h-full ${padForArrows && i === 0 && canPrev ? "[&>*]:pl-[3.25rem]" : ""} ${padForArrows && i === visible.length - 1 && canNext ? "[&>*]:pr-[3.25rem]" : ""}`}
        >
          {renderItem(item)}
          {i === 0 && canPrev ? (
            <button
              type="button"
              onClick={() => setPageIdx(safePage - 1)}
              aria-label={`Quay lại 4 ô trước của mục ${sectionLabel}`}
              className={`${arrowBtn} left-1.5`}
            >
              ←
            </button>
          ) : null}
          {i === visible.length - 1 && canNext ? (
            <button
              type="button"
              onClick={() => setPageIdx(safePage + 1)}
              aria-label={`Xem tiếp 4 ô nữa của mục ${sectionLabel}`}
              className={`${arrowBtn} right-1.5`}
            >
              →
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
