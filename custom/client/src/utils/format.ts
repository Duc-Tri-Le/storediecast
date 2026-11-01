export function orderCode(id: number | string | null | undefined): string {
  if (id == null) return "";
  const s = String(id).trim();
  const num = parseInt(s.replace(/\D/g, ""), 10);
  if (isNaN(num)) return s;
  return `DCDT${String(num).padStart(4, "0")}`;
}

