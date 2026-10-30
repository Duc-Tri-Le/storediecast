import type { Order, OrderTab, Product, Variant } from "../types";

export function fmtVND(n: number): string {
  return `${n.toLocaleString("vi-VN")}₫`;
}

export function fmtCompactVND(n: number): string {
  if (n >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export function orderCode(id: number): string {
  return `DCDT${String(id).padStart(4, "0")}`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 13) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export const COLOR_HEX_RULES: Array<[string, string]> = [
  ["xanh ngọc", "#0e9594"],
  ["xanh lá", "#4c9a4c"],
  ["xanh dương", "#2563eb"],
  ["xanh gp", "#2563eb"],
  ["xanh", "#2f7fd0"],
  ["đỏ", "#c8102e"],
  ["đen", "#1c1c1e"],
  ["trắng", "#e8e8e8"],
  ["bạc", "#c0c0c0"],
  ["xám", "#8e8e93"],
  ["vàng", "#e6b800"],
  ["cam", "#e07b26"],
  ["tím", "#7d4fc9"],
  ["nâu", "#8a5a33"],
  ["hồng", "#e58bb1"],
  ["be", "#ddd0ae"],
  ["kem", "#efe6cc"],
];

export function colorHex(colorName: string): string {
  const lower = colorName.toLowerCase();
  for (const [kw, hex] of COLOR_HEX_RULES) {
    if (lower.includes(kw)) return hex;
  }
  return "#b9c0c8";
}

export function directImageSrc(imageKey: string): string | null {
  const k = imageKey.trim();
  if (/^https?:\/\//i.test(k)) return k;
  if (/^data:image\//i.test(k)) return k;
  return null;
}

export function totalStock(p: Product): number {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function defaultVariant(p: Product): Variant | undefined {
  return [...p.variants].sort((a, b) => a.sortOrder - b.sortOrder)[0];
}

export function orderTabOf(o: Order): OrderTab[] {
  const tabs: OrderTab[] = ["all"];
  if (o.status === "new") tabs.push("open", "hold");
  if (o.status === "confirmed") tabs.push("open");
  if (o.status === "done" || o.status === "cancelled") tabs.push("closed");
  return tabs;
}

export const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  confirmed: "Đã xác nhận",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};
