// ── Chuẩn hoá số điện thoại — MỘT quy tắc duy nhất cho cả 3 nơi ─────
// createOrder (lúc tạo đơn), listOrders (tra cứu) và updateOrderStatus
// (hủy đơn) đều đi qua normalizePhone + PHONE_MIN_DIGITS ở đây, để
// không còn cảnh đơn tạo được bằng số 8 chữ số nhưng tra cứu/hủy lại
// đòi tối thiểu 9 (điểm chưa đạt số 3 trong rà soát 30/10/2026).
// Quy tắc: bỏ mọi ký tự không phải số; đầu "84" + 9 chữ số (số Việt
// Nam viết dạng quốc tế) được đưa về đầu "0". Số lưu vào database là
// số ĐÃ chuẩn hoá, nên tra cứu so khớp trực tiếp được.

export const PHONE_MIN_DIGITS = 9;
export const PHONE_MAX_DIGITS = 15;

export function normalizePhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("84")) {
    return "0" + digits.slice(2);
  }
  return digits;
}

export function isValidPhone(normalized: string): boolean {
  return normalized.length >= PHONE_MIN_DIGITS && normalized.length <= PHONE_MAX_DIGITS;
}
