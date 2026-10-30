import scale116Img from "../assets/scale116.jpg";
import scale132Img from "../assets/scale132.jpg";
import scale164Img from "../assets/scale164.jpg";
import type { Page } from "../types";

export type NavItem = {
  key: Page;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "products", label: "Sản phẩm" },
  { key: "collection", label: "Bộ sưu tập" },
  { key: "orders", label: "Tra cứu đơn hàng" },
  { key: "faq", label: "Hỏi đáp" },
  { key: "about", label: "Giới thiệu" },
];

export const COLLECTIONS: Array<{
  scale: "1:64" | "1:32" | "1:16";
  title: string;
  desc: string;
  size: string;
  img: string;
  alt: string;
}> = [
  {
    scale: "1:64",
    title: "Bộ bỏ túi 1:64",
    desc: "Nhỏ gọn khoảng 7 cm, dễ sưu tầm nhiều mẫu cùng lúc mà không tốn chỗ trưng bày. Hợp để bàn làm việc, kệ nhỏ hoặc sưu tầm theo bộ nhiều hãng.",
    size: "~7 cm · Sealed · 99.000–189.000₫",
    img: scale164Img,
    alt: "Ba mô hình xe đỏ tỉ lệ 1:64 cạnh đồng xu",
  },
  {
    scale: "1:32",
    title: "Bộ vừa tay 1:32",
    desc: "Cân bằng giữa chi tiết và kích thước trưng bày, khoảng 13–14 cm vừa tay và mở được cửa, capo hoặc cốp tùy mẫu. Hợp cho người mới chơi lẫn người sưu tầm muốn trưng gọn trên kệ vừa.",
    size: "~13 cm · Mở cửa · 349.000–549.000₫",
    img: scale132Img,
    alt: "Mô hình SUV đỏ tỉ lệ 1:32 mở cả bốn cửa",
  },
  {
    scale: "1:16",
    title: "Bộ sưu tầm 1:16",
    desc: "Kích thước lớn khoảng 28–30 cm với chi tiết rõ nhất, mở được nhiều chi tiết và kèm hộp, đế trưng bày tùy mẫu. Hợp làm tâm điểm kệ trưng bày hoặc quà tặng sưu tầm.",
    size: "~28 cm · Full mở · 1.490.000–2.490.000₫",
    img: scale116Img,
    alt: "Cận cảnh khoang máy mô hình xe đỏ cổ điển tỉ lệ 1:16",
  },
];

