/**
 * Chuyển đổi tên tiếng Việt thành URL slug chuẩn SEO (không dấu, gạch nối)
 * Ví dụ: "Xe Mô Hình Ferrari F8 Tributo [MẪU]" -> "ferrari-f8-tributo"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\[mẫu\]/gi, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

