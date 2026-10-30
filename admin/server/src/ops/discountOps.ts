import { Database } from "bun:sqlite";
import { type Row, iso, num, str } from "./dbCommon";
import { ensureDefaultDiscounts } from "./catalogInit";

export function listDiscounts(db: Database): Row[] {
  ensureDefaultDiscounts(db);
  const rows = db
    .query("SELECT * FROM discount_codes ORDER BY id ASC")
    .all() as Row[];
  return rows.map((r) => ({
    id: num(r.id),
    code: str(r.code),
    kind: str(r.kind),
    value: num(r.value),
    isActive: num(r.is_active) === 1,
    note: str(r.note),
    createdAt: iso(r.created_at),
  }));
}

export function upsertDiscount(
  db: Database,
  input: {
    id: number | null;
    code: string;
    kind: string;
    value: number;
    isActive: boolean;
    note: string;
  },
): { ok: boolean; error: string | null; discountId: number | null } {
  ensureDefaultDiscounts(db);
  const code = input.code.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return {
      ok: false,
      error: "Mã chỉ gồm chữ, số, dấu - và _ (không khoảng trắng).",
      discountId: null,
    };
  }
  if (input.kind === "percent" && (input.value < 1 || input.value > 100)) {
    return { ok: false, error: "Mã giảm theo % phải từ 1 đến 100.", discountId: null };
  }
  const dup = db
    .query("SELECT id FROM discount_codes WHERE code = ?")
    .all(code) as Row[];
  if (dup.some((d) => num(d.id) !== input.id)) {
    return { ok: false, error: `Mã ${code} đã tồn tại.`, discountId: null };
  }
  if (input.id == null) {
    const ins = db
      .query(
        `INSERT INTO discount_codes (code, kind, value, is_active, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      )
      .get(code, input.kind, input.value, input.isActive ? 1 : 0, input.note.trim(), Date.now()) as Row | null;
    if (!ins) return { ok: false, error: "Không tạo được mã.", discountId: null };
    return { ok: true, error: null, discountId: num(ins.id) };
  }
  db.query(
    "UPDATE discount_codes SET code = ?, kind = ?, value = ?, is_active = ?, note = ? WHERE id = ?",
  ).run(code, input.kind, input.value, input.isActive ? 1 : 0, input.note.trim(), input.id);
  return { ok: true, error: null, discountId: input.id };
}

