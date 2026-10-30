import { Database } from "bun:sqlite";
import {
  type BulkAction,
  type CollectionCondition,
  type Row,
  iso,
  nullableNum,
  num,
  str,
} from "./dbCommon";
import { ensureBulkUpdates, ensureCatalog } from "./catalogInit";
import { parseConditions, validateBulkConditions } from "./collectionHelpers";

export const BULK_ACTION_TYPES = ["price", "promoPrice", "stock", "description"];
export const BULK_PRICE_MODES = ["set", "add", "subtract", "percentAdd", "percentSubtract"];
export const BULK_PROMO_MODES = [...BULK_PRICE_MODES, "clear"];
export const BULK_STOCK_MODES = ["set", "add", "subtract"];

export function sanitizeBulkActions(raw: unknown): { actions: BulkAction[] } | { error: string } {
  const list = Array.isArray(raw) ? raw : [];
  if (list.length === 0) return { error: "Chưa có hành động nào — thêm ít nhất một hành động." };
  const out: BulkAction[] = [];
  for (const item of list) {
    const type = str((item as Row | null)?.type) as any;
    if (!BULK_ACTION_TYPES.includes(type)) {
      return { error: `Loại hành động “${type}” không hợp lệ.` };
    }
    if (type === "description") {
      const text = str((item as Row | null)?.text);
      if (text.length > 5000) return { error: "Mô tả mới dài hơn 5000 ký tự." };
      if (!text.trim()) return { error: "Hành động đổi mô tả đang trống — nhập mô tả mới." };
      out.push({ type, mode: "set", value: null, text });
      continue;
    }
    const mode = str((item as Row | null)?.mode) as any;
    const modes =
      type === "price" ? BULK_PRICE_MODES : type === "promoPrice" ? BULK_PROMO_MODES : BULK_STOCK_MODES;
    if (!modes.includes(mode)) {
      return { error: `Cách áp dụng “${mode}” không hợp lệ cho hành động này.` };
    }
    if (mode === "clear") {
      out.push({ type, mode, value: null, text: "" });
      continue;
    }
    const value = (item as Row | null)?.value;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n) || n < 0) {
      return { error: "Giá trị của hành động phải là số từ 0 trở lên." };
    }
    if ((mode === "percentAdd" || mode === "percentSubtract") && n > 1000) {
      return { error: "Phần trăm của hành động không được quá 1000%." };
    }
    if (type === "stock" && !Number.isInteger(n)) {
      return { error: "Giá trị tồn kho phải là số nguyên." };
    }
    out.push({ type, mode, value: n, text: "" });
  }
  return { actions: out };
}

export function applyNumericAction(current: number | null, action: BulkAction): number | null {
  if (action.mode === "clear") return null;
  const v = action.value ?? 0;
  const base = current ?? 0;
  switch (action.mode) {
    case "set":
      return v;
    case "add":
      return base + v;
    case "subtract":
      return base - v;
    case "percentAdd":
      return Math.round(base * (1 + v / 100));
    case "percentSubtract":
      return Math.round(base * (1 - v / 100));
    default:
      return base;
  }
}

export function bulkRowMatchesCondition(p: Row, c: CollectionCondition): boolean {
  const target = c.value.trim().toLowerCase();
  if (c.kind === "tag") {
    const tags = str(p.features)
      .split("·")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    switch (c.operator) {
      case "neq":
        return !tags.some((t) => t === target);
      case "contains":
        return tags.some((t) => t.includes(target));
      case "notContains":
        return !tags.some((t) => t.includes(target));
      default:
        return tags.some((t) => t === target);
    }
  }
  const field = (
    c.kind === "scale"
      ? str(p.scale)
      : c.kind === "brand"
        ? str(p.brand)
        : c.kind === "vehicleType"
          ? str(p.vehicle_type)
          : str(p.model_maker)
  )
    .trim()
    .toLowerCase();
  switch (c.operator) {
    case "neq":
      return field !== target;
    case "contains":
      return field.includes(target);
    case "notContains":
      return !field.includes(target);
    default:
      return field === target;
  }
}

export function parseBulkActions(raw: unknown): BulkAction[] {
  try {
    const parsed = JSON.parse(str(raw) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is BulkAction =>
          typeof x === "object" && x != null && typeof (x as BulkAction).type === "string",
      )
      .map((x) => ({
        type: x.type as any,
        mode: (typeof x.mode === "string" ? x.mode : "set") as any,
        value: typeof x.value === "number" ? x.value : null,
        text: typeof x.text === "string" ? x.text : "",
      }));
  } catch {
    return [];
  }
}

export function listBulkUpdates(db: Database): Row {
  ensureBulkUpdates(db);
  const rows = db
    .query("SELECT * FROM bulk_updates ORDER BY id DESC")
    .all() as Row[];
  return {
    updates: rows.map((r) => ({
      id: num(r.id),
      conditions: parseConditions(r.conditions),
      matchMode: str(r.match_mode) === "any" ? "any" : "all",
      variantMustMatch: num(r.variant_must_match) === 1,
      actions: parseBulkActions(r.actions),
      updatedProducts: num(r.updated_products),
      updatedVariants: num(r.updated_variants),
      status: str(r.status),
      createdAt: iso(r.created_at),
    })),
  };
}

export function applyBulkUpdate(
  db: Database,
  input: { conditions: unknown; matchMode: string; variantMustMatch: boolean; actions: unknown },
): Row {
  ensureBulkUpdates(db);
  ensureCatalog(db);
  const checked = validateBulkConditions(input.conditions);
  if ("error" in checked) return { ok: false, error: checked.error, updateId: null, updatedProducts: 0, updatedVariants: 0 };
  const conditions = checked.conditions;
  if (conditions.length === 0) {
    return { ok: false, error: "Chưa có điều kiện lọc nào có giá trị — nhập giá trị cho ít nhất một điều kiện.", updateId: null, updatedProducts: 0, updatedVariants: 0 };
  }
  const sanitized = sanitizeBulkActions(input.actions);
  if ("error" in sanitized) return { ok: false, error: sanitized.error, updateId: null, updatedProducts: 0, updatedVariants: 0 };
  const actions = sanitized.actions;
  const matchMode = input.matchMode === "any" ? "any" : "all";

  const prods = db.query("SELECT * FROM products ORDER BY id ASC").all() as Row[];
  const vars = db
    .query("SELECT * FROM product_variants ORDER BY sort_order ASC, id ASC")
    .all() as Row[];
  const varsByProduct = new Map<number, Row[]>();
  for (const v of vars) {
    const arr = varsByProduct.get(num(v.product_id)) ?? [];
    arr.push(v);
    varsByProduct.set(num(v.product_id), arr);
  }

  const matched = prods.filter((p) =>
    matchMode === "all"
      ? conditions.every((c) => bulkRowMatchesCondition(p, c))
      : conditions.some((c) => bulkRowMatchesCondition(p, c)),
  );
  if (matched.length === 0) {
    return { ok: false, error: "Không có sản phẩm nào khớp điều kiện lọc — chưa áp dụng gì.", updateId: null, updatedProducts: 0, updatedVariants: 0 };
  }

  const variantActions = actions.filter((a) => a.type !== "description");
  const descAction = actions.find((a) => a.type === "description") ?? null;

  type VariantPlan = { id: number; productId: number; price: number; promoPrice: number | null; stock: number };
  const plans: VariantPlan[] = [];
  const changedProductIds = new Set<number>();
  for (const p of matched) {
    const pvars = varsByProduct.get(num(p.id)) ?? [];
    for (const v of pvars) {
      if (input.variantMustMatch) {
        const ok =
          matchMode === "all"
            ? conditions.every((c) => bulkRowMatchesCondition(p, c))
            : conditions.some((c) => bulkRowMatchesCondition(p, c));
        if (!ok) continue;
      }
      let price = num(v.price);
      let promoPrice = nullableNum(v.promo_price);
      let stock = num(v.stock);
      for (const a of variantActions) {
        if (a.type === "price") price = applyNumericAction(price, a) ?? 0;
        else if (a.type === "promoPrice") promoPrice = applyNumericAction(promoPrice, a);
        else if (a.type === "stock") stock = Math.max(0, Math.trunc(applyNumericAction(stock, a) ?? 0));
      }
      if (price <= 0) {
        return {
          ok: false,
          error: `Biến thể “${str(v.color_name)}” của sản phẩm “${str(p.name)}” sẽ có giá bán ${price}₫ sau cập nhật — giá bán phải lớn hơn 0 nên chưa áp dụng gì.`,
          updateId: null, updatedProducts: 0, updatedVariants: 0,
        };
      }
      if (promoPrice != null && promoPrice <= 0) promoPrice = null;
      if (promoPrice != null && promoPrice >= price) {
        return {
          ok: false,
          error: `Biến thể “${str(v.color_name)}” của sản phẩm “${str(p.name)}” sẽ có giá khuyến mãi ${promoPrice}₫ không nhỏ hơn giá bán ${price}₫ — chưa áp dụng gì, hãy chỉnh lại hành động giá.`,
          updateId: null, updatedProducts: 0, updatedVariants: 0,
        };
      }
      if (price !== num(v.price) || promoPrice !== nullableNum(v.promo_price) || stock !== num(v.stock)) {
        plans.push({ id: num(v.id), productId: num(p.id), price, promoPrice, stock });
        changedProductIds.add(num(p.id));
      }
    }
    if (descAction && str(p.description) !== descAction.text) {
      changedProductIds.add(num(p.id));
    }
  }

  if (plans.length === 0 && !descAction) {
    return { ok: false, error: "Các giá trị mới đang bằng giá trị hiện tại của mọi biến thể khớp — chưa có gì để cập nhật.", updateId: null, updatedProducts: 0, updatedVariants: 0 };
  }
  if (plans.length === 0 && descAction && changedProductIds.size === 0) {
    return { ok: false, error: "Mô tả mới đang bằng mô tả hiện tại của mọi sản phẩm khớp — chưa có gì để cập nhật.", updateId: null, updatedProducts: 0, updatedVariants: 0 };
  }

  for (const plan of plans) {
    db.query("UPDATE product_variants SET price = ?, promo_price = ?, stock = ? WHERE id = ?").run(
      plan.price,
      plan.promoPrice,
      plan.stock,
      plan.id,
    );
  }

  const plansByProduct = new Map<number, Map<number, VariantPlan>>();
  for (const plan of plans) {
    const m = plansByProduct.get(plan.productId) ?? new Map<number, VariantPlan>();
    m.set(plan.id, plan);
    plansByProduct.set(plan.productId, m);
  }
  for (const pid of changedProductIds) {
    const pvars = varsByProduct.get(pid) ?? [];
    const first = pvars[0];
    if (first) {
      const fp = plansByProduct.get(pid)?.get(num(first.id));
      const newPrice = fp ? fp.price : num(first.price);
      const newPromo = fp ? fp.promoPrice : nullableNum(first.promo_price);
      const newStock = fp ? fp.stock : num(first.stock);
      if (fp) {
        db.query("UPDATE products SET price = ?, promo_price = ?, stock = ? WHERE id = ?").run(
          newPrice,
          newPromo,
          newStock,
          pid,
        );
      }
    }
    if (descAction) {
      const p = matched.find((x) => num(x.id) === pid);
      if (p && str(p.description) !== descAction.text) {
        db.query("UPDATE products SET description = ? WHERE id = ?").run(descAction.text ?? "", pid);
      }
    }
  }

  const ins = db
    .query(
      `INSERT INTO bulk_updates (conditions, match_mode, variant_must_match, actions, updated_products, updated_variants, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'done', ?) RETURNING id`,
    )
    .get(
      JSON.stringify(conditions),
      matchMode,
      input.variantMustMatch ? 1 : 0,
      JSON.stringify(actions),
      changedProductIds.size,
      plans.length,
      Date.now(),
    ) as Row | null;
  return {
    ok: true,
    error: null,
    updateId: ins ? num(ins.id) : null,
    updatedProducts: changedProductIds.size,
    updatedVariants: plans.length,
  };
}
