import type { Order, Product } from "../types";
import {
  colorHex,
  defaultVariant,
  directImageSrc,
  fmtDate,
  fmtVND,
  orderCode,
} from "../utils/format";
import { Chip, Icon, ICONS } from "./shared";

export function deliveryChip(status: string) {
  switch (status) {
    case "new":
      return <Chip tone="amber">Chưa giao</Chip>;
    case "confirmed":
      return <Chip tone="blue">Đang chuẩn bị</Chip>;
    case "done":
      return <Chip tone="green">Đã giao</Chip>;
    default:
      return <Chip tone="gray">Đã hủy</Chip>;
  }
}

export function paymentChip(status: string) {
  switch (status) {
    case "new":
    case "confirmed":
      return <Chip tone="amber">Chờ chuyển khoản</Chip>;
    case "done":
      return <Chip tone="green">Đã thanh toán</Chip>;
    default:
      return <Chip tone="gray">Đã hủy</Chip>;
  }
}

export function OrderItemThumb({
  product,
  item,
  size = 48,
}: {
  product: Product | undefined;
  item: Order["items"][number];
  size?: number;
}) {
  const variant =
    product?.variants.find((v) => v.id === item.variantId) ??
    (product ? defaultVariant(product) : undefined);
  const src = variant ? directImageSrc(variant.imageKey) : null;
  if (src) {
    return (
      <img
        src={src}
        alt={`Ảnh ${item.productName}`}
        loading="lazy"
        className="shrink-0 rounded-md border border-[var(--border)] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  if (product) {
    return (
      <div
        aria-hidden
        className="flex shrink-0 flex-col items-center justify-center rounded-md border border-[var(--border)]"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${colorHex(item.colorName)}33, ${colorHex(item.colorName)}11)`,
        }}
      >
        <span
          className="block rounded-full border border-black/10"
          style={{
            width: size * 0.36,
            height: size * 0.36,
            background: colorHex(item.colorName),
          }}
        />
        <span className="mt-0.5 text-[9px] font-semibold text-[var(--dim)]">{item.scale}</span>
      </div>
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[9px] font-semibold text-[var(--dim)]"
      style={{ width: size, height: size }}
    >
      {item.scale}
    </span>
  );
}

export function OrderRow({
  order,
  products,
  expanded,
  onToggle,
  onOpen,
}: {
  order: Order;
  products: Product[];
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <>
      <tr className="border-b border-[var(--border)] hover:bg-[var(--sidebar)]">
        <td className="px-4 py-3 font-medium">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Xem chi tiết đơn ${orderCode(order.id)}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {orderCode(order.id)}
            </button>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? `Thu gọn sản phẩm đơn ${orderCode(order.id)}`
                  : `Mở rộng sản phẩm đơn ${orderCode(order.id)}`
              }
              className="shrink-0 rounded p-1 text-[var(--dim)] hover:bg-white hover:text-[var(--text)]"
            >
              <span
                className={`block transition-transform duration-200 ${expanded ? "-rotate-90" : "rotate-90"}`}
              >
                <Icon d={ICONS.chevron} size={16} />
              </span>
            </button>
          </div>
          <span className="block text-xs font-normal text-[var(--dim)]">
            {totalQty} sản phẩm
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
        <td className="px-4 py-3">
          {order.customerName}
          <span className="block text-xs text-[var(--dim)]">{order.customerPhone}</span>
        </td>
        <td className="px-4 py-3">{deliveryChip(order.status)}</td>
        <td className="px-4 py-3">{paymentChip(order.status)}</td>
        <td className="px-4 py-3 text-right font-medium">{fmtVND(order.total)}</td>
      </tr>
      {expanded &&
        (order.items.length === 0 ? (
          <tr className="border-b border-[var(--border)] bg-[#fbfdff]">
            <td colSpan={6} className="px-4 py-3 pl-14 text-sm text-[var(--dim)]">
              Đơn này chưa có dòng sản phẩm nào.
            </td>
          </tr>
        ) : (
          order.items.map((it) => {
            const product = products.find((p) => p.id === it.productId);
            const sku = it.variantSku ?? it.productSku ?? "—";
            const lineTotal = it.unitPrice * it.quantity;
            return (
              <tr
                key={it.id}
                className="border-b border-[var(--border)] bg-[#fbfdff] last:border-0"
              >
                <td colSpan={6} className="px-4 py-3">
                  <div className="flex items-center gap-3 pl-8">
                    <OrderItemThumb product={product} item={it} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-[var(--dim)]">{sku}</p>
                      <p className="truncate font-medium">{it.productName}</p>
                      <p className="text-sm text-[var(--dim)]">
                        {it.colorName} / Tỉ lệ {it.scale}
                      </p>
                    </div>
                    <div className="w-32 shrink-0 text-sm whitespace-nowrap text-[var(--dim)]">
                      {fmtVND(it.unitPrice)} × {it.quantity}
                    </div>
                    <div className="w-28 shrink-0 text-right text-sm font-medium whitespace-nowrap">
                      {fmtVND(lineTotal)}
                    </div>
                    <div className="w-32 shrink-0">{deliveryChip(order.status)}</div>
                  </div>
                </td>
              </tr>
            );
          })
        ))}
    </>
  );
}

export function OrderCard({
  order,
  products,
  expanded,
  onToggle,
  onOpen,
}: {
  order: Order;
  products: Product[];
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpen}
                aria-label={`Xem chi tiết đơn ${orderCode(order.id)}`}
                className="font-semibold text-[var(--accent)] hover:underline"
              >
                {orderCode(order.id)}
              </button>
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? `Thu gọn sản phẩm đơn ${orderCode(order.id)}`
                    : `Mở rộng sản phẩm đơn ${orderCode(order.id)}`
                }
                className="shrink-0 rounded p-1 text-[var(--dim)] hover:bg-[var(--sidebar)]"
              >
                <span
                  className={`block transition-transform duration-200 ${expanded ? "-rotate-90" : "rotate-90"}`}
                >
                  <Icon d={ICONS.chevron} size={18} />
                </span>
              </button>
            </div>
            <p className="font-semibold">{fmtVND(order.total)}</p>
          </div>
          <p className="mt-0.5 text-sm text-[var(--dim)]">
            {fmtDate(order.createdAt)} · {order.customerName} · {order.customerPhone}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {deliveryChip(order.status)}
            {paymentChip(order.status)}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {order.items.length === 0 ? (
            <p className="py-3 text-sm text-[var(--dim)]">Đơn này chưa có dòng sản phẩm nào.</p>
          ) : (
            order.items.map((it) => {
              const product = products.find((p) => p.id === it.productId);
              const sku = it.variantSku ?? it.productSku ?? "—";
              const lineTotal = it.unitPrice * it.quantity;
              return (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  <OrderItemThumb product={product} item={it} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-[var(--dim)]">{sku}</p>
                    <p className="font-medium">{it.productName}</p>
                    <p className="text-sm text-[var(--dim)]">
                      {it.colorName} / Tỉ lệ {it.scale}
                    </p>
                    <p className="text-sm text-[var(--dim)]">
                      {fmtVND(it.unitPrice)} × {it.quantity}
                    </p>
                    <div className="mt-1">{deliveryChip(order.status)}</div>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{fmtVND(lineTotal)}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

