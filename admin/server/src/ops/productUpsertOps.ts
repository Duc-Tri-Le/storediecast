import { slugify } from "../slug";
import { Database } from "bun:sqlite";
import {
  type CatalogEntry,
  type ProductInput,
  type Row,
  fail,
  num,
  str,
} from "./dbCommon";
import {
  catalogFind,
  ensureCatalog,
  ensureProductExtras,
  vehicleTypeOf,
} from "./catalogInit";
import { generateSku } from "../sku";

export function upsertProduct(db: Database, input: ProductInput): Row {
  ensureProductExtras(db);
  ensureCatalog(db);
  const name = input.name.trim();
  if (!name) return fail("Thiếu tên sản phẩm.");

  const brandEntry = catalogFind(db, "carBrands", input.brand);
  if (!brandEntry) {
    return fail(
      `Hãng xe “${input.brand.trim()}” chưa có trong Quản lý danh mục → Hãng xe. Thêm mục đó ở trang danh mục trước, hoặc chọn một hãng xe đang có.`,
    );
  }
  const brand = brandEntry.name;
  const scaleEntry = catalogFind(db, "scales", input.scale);
  if (!scaleEntry) {
    return fail(
      `Tỉ lệ “${input.scale.trim()}” chưa có trong Quản lý danh mục → Tỉ lệ. Thêm mục đó ở trang danh mục trước, hoặc chọn một tỉ lệ đang có.`,
    );
  }
  const scale = scaleEntry.name;
  let maker = "";
  let makerEntry: CatalogEntry | null = null;
  if (input.modelMaker.trim()) {
    makerEntry = catalogFind(db, "modelMakers", input.modelMaker);
    if (!makerEntry) {
      return fail(
        `Hãng mô hình “${input.modelMaker.trim()}” chưa có trong Quản lý danh mục → Hãng mô hình. Thêm mục đó ở trang danh mục trước, hoặc chọn một hãng mô hình đang có.`,
      );
    }
    maker = makerEntry.name;
  }
  let vehicleType = vehicleTypeOf(name);
  if (input.vehicleType != null && input.vehicleType.trim()) {
    const typeEntry = catalogFind(db, "vehicleTypes", input.vehicleType);
    if (!typeEntry) {
      return fail(
        `Loại xe “${input.vehicleType.trim()}” chưa có trong Quản lý danh mục → Loại xe. Thêm mục đó ở trang danh mục trước, hoặc chọn một loại xe đang có.`,
      );
    }
    vehicleType = typeEntry.name;
  } else if (input.id != null) {
    const cur = db
      .query("SELECT vehicle_type FROM products WHERE id = ?")
      .get(input.id) as Row | null;
    if (cur && str(cur.vehicle_type).trim()) vehicleType = str(cur.vehicle_type).trim();
  }
  if (input.variants.some((v) => v.promoPrice != null && v.promoPrice >= v.price)) {
    return fail("Giá khuyến mãi phải nhỏ hơn giá gốc ở mọi màu.");
  }
  const colorNames = input.variants.map((v) => v.colorName.trim().toLowerCase());
  if (new Set(colorNames).size !== colorNames.length) {
    return fail("Một sản phẩm không được có hai màu trùng tên.");
  }

  for (const v of input.variants) {
    const key = v.imageKey.trim();
    if (!key) return fail(`Màu “${v.colorName}”: thiếu ảnh.`);
    if (/^https?:\/\//i.test(key)) {
      try {
        new URL(key);
      } catch {
        return fail(`Màu “${v.colorName}”: link ảnh không hợp lệ.`);
      }
    } else if (key.startsWith("data:")) {
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(key)) {
        return fail(`Màu “${v.colorName}”: dữ liệu ảnh tải lên không hợp lệ.`);
      }
      if (key.length > 1500000) {
        return fail(`Màu “${v.colorName}”: ảnh tải lên quá lớn, chọn ảnh nhỏ hơn.`);
      }
    } else if (/\s/.test(key) || key.length > 120) {
      return fail(`Màu “${v.colorName}”: mã ảnh không hợp lệ.`);
    }
  }

  const plans: Array<string | null> = [];
  for (const v of input.variants) {
    if (!maker) {
      plans.push(null);
      continue;
    }
    const gen = generateSku({
      modelMaker: maker,
      scale,
      brand,
      productName: name,
      colorName: v.colorName.trim(),
      codes: {
        makerCode: makerEntry?.code ?? null,
        scaleCode: scaleEntry.code,
        brandCode: brandEntry.code,
      },
    });
    if (gen.status !== "complete" || !gen.sku) {
      const missing = gen.status === "incomplete" ? gen.missing : "";
      const missingLabels: Record<string, string> = {
        modelMaker: "hãng mô hình chưa suy được mã",
        scale: "tỉ lệ chưa suy được mã",
        brand: "hãng xe chưa suy được mã",
        model: "tên sản phẩm chưa tách được mã dòng xe",
        color: "tên màu chưa suy được mã màu",
      };
      const detail = missing.startsWith("invalid:")
        ? missing.slice("invalid:".length)
        : (missingLabels[missing] ?? "kiểm tra lại hãng mô hình, tỉ lệ, hãng xe và tên màu");
      return fail(`Không sinh được mã SKU cho màu “${v.colorName}”: ${detail}.`);
    }
    if (plans.includes(gen.sku)) {
      return fail(`Mã SKU ${gen.sku} bị trùng giữa các màu của sản phẩm này.`);
    }
    plans.push(gen.sku);
  }
  const keepVariantIds = new Set(
    input.variants.map((v) => v.id).filter((x): x is number => x != null),
  );
  for (const plan of plans) {
    if (!plan) continue;
    const dup = db
      .query("SELECT id FROM product_variants WHERE sku = ?")
      .all(plan) as Row[];
    if (dup.some((d) => !keepVariantIds.has(num(d.id)))) {
      return fail(
        `Mã SKU ${plan} đã thuộc về một sản phẩm/màu khác — đổi hãng mô hình hoặc tên màu rồi thử lại.`,
      );
    }
  }

  const first = input.variants[0];
  if (!first) return fail("Sản phẩm cần ít nhất một màu.");
  const slug = (input.slug && input.slug.trim()) ? slugify(input.slug) : slugify(name);
  const seoTitle = (input.seoTitle ?? "").trim();
  const seoDescription = (input.seoDescription ?? "").trim();
  const nowIso = new Date().toISOString();
  let productId: number;
  if (input.id == null) {
    const ins = db
      .query(
        `INSERT INTO products (
           name, brand, scale, vehicle_type,
           description, features, is_featured, model_maker,
           sku, sku_status, internal_code, created_at, updated_at,
           slug, seo_title, seo_description,
           loai_xe, hang_xe, ti_le
         )
         VALUES (
           ?, ?, ?, ?,
           ?, ?, ?, ?,
           NULL, 'incomplete', NULL, ?, ?,
           ?, ?, ?,
           ?, ?, ?
         ) RETURNING id`,
      )
      .get(
        name,
        brand,
        scale,
        vehicleType,
        input.description.trim(),
        input.features.trim(),
        input.isFeatured ? 1 : 0,
        maker || null,
        nowIso,
        nowIso,
        slug,
        seoTitle,
        seoDescription,
        vehicleType,
        brand,
        scale,
      ) as Row | null;
    if (!ins) return fail("Không tạo được sản phẩm.");
    productId = num(ins.id);
    db.query("UPDATE products SET internal_code = ? WHERE id = ?").run(
      `INT-P${productId}`,
      productId,
    );
  } else {
    productId = input.id;
    const existing = db
      .query("SELECT id FROM products WHERE id = ?")
      .get(productId) as Row | null;
    if (!existing) return fail("Không tìm thấy sản phẩm để sửa.");
    db.query(
      "UPDATE products SET name = ?, brand = ?, scale = ?, vehicle_type = ?, description = ?, features = ?, is_featured = ?, model_maker = ?, slug = ?, seo_title = ?, seo_description = ?, loai_xe = ?, hang_xe = ?, ti_le = ?, updated_at = ? WHERE id = ?",
    ).run(
      name,
      brand,
      scale,
      vehicleType,
      input.description.trim(),
      input.features.trim(),
      input.isFeatured ? 1 : 0,
      maker || null,
      slug,
      seoTitle,
      seoDescription,
      vehicleType,
      brand,
      scale,
      nowIso,
      productId,
    );
    const currentVars = db
      .query("SELECT id FROM product_variants WHERE product_id = ?")
      .all(productId) as Row[];
    for (const cv of currentVars) {
      if (!keepVariantIds.has(num(cv.id))) {
        db.query("DELETE FROM product_images WHERE variant_id = ?").run(num(cv.id));
        db.query("DELETE FROM product_variants WHERE id = ?").run(num(cv.id));
      }
    }
  }

  if (input.inventoryPolicy === "track_stop" || input.inventoryPolicy === "no_track") {
    db.query("UPDATE products SET inventory_policy = ? WHERE id = ?").run(
      input.inventoryPolicy,
      productId,
    );
  }

  let defaultSku: string | null = null;
  for (let i = 0; i < input.variants.length; i++) {
    const v = input.variants[i];
    if (!v) continue;
    const sku = plans[i] ?? null;
    if (i === 0) defaultSku = sku;
    const skuStatus = sku ? "complete" : "incomplete";
    let variantId: number;
    if (v.id != null && keepVariantIds.has(v.id)) {
      variantId = v.id;
      db.query(
        "UPDATE product_variants SET product_id = ?, color_name = ?, price = ?, promo_price = ?, stock = ?, image_key = ?, sort_order = ?, sku = ?, sku_status = ? WHERE id = ?",
      ).run(
        productId,
        v.colorName.trim(),
        v.price,
        v.promoPrice,
        v.stock,
        v.imageKey.trim(),
        i,
        sku,
        skuStatus,
        variantId,
      );
    } else {
      const vins = db
        .query(
          `INSERT INTO product_variants (product_id, color_name, price, promo_price, stock, image_key, sort_order, sku, sku_status, internal_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL) RETURNING id`,
        )
        .get(
          productId,
          v.colorName.trim(),
          v.price,
          v.promoPrice,
          v.stock,
          v.imageKey.trim(),
          i,
          sku,
          skuStatus,
        ) as Row | null;
      if (!vins) continue;
      variantId = num(vins.id);
      db.query("UPDATE product_variants SET internal_code = ? WHERE id = ?").run(
        `INT-V${variantId}`,
        variantId,
      );
    }

    const extraSets: string[] = [];
    const extraVals: Array<string | number | null> = [];
    if (v.costPrice !== undefined) {
      extraSets.push("cost_price = ?");
      extraVals.push(v.costPrice);
    }
    if (v.barcode !== undefined) {
      extraSets.push("barcode = ?");
      extraVals.push(v.barcode.trim());
    }
    if (v.variantTag !== undefined) {
      extraSets.push("variant_tag = ?");
      extraVals.push(v.variantTag.trim());
    }
    if (v.weightGrams !== undefined) {
      extraSets.push("weight_grams = ?");
      extraVals.push(v.weightGrams);
    }
    if (extraSets.length > 0) {
      db.query(
        `UPDATE product_variants SET ${extraSets.join(", ")} WHERE id = ?`,
      ).run(...extraVals, variantId);
    }
    const vImgs = db
      .query("SELECT id, image_key FROM product_images WHERE variant_id = ?")
      .all(variantId) as Row[];
    if (vImgs.length === 0) {
      const allImgs = db
        .query("SELECT id FROM product_images WHERE product_id = ?")
        .all(productId) as Row[];
      db.query(
        "INSERT INTO product_images (product_id, variant_id, image_key, sort_order) VALUES (?, ?, ?, ?)",
      ).run(productId, variantId, v.imageKey.trim(), allImgs.length);
    } else if (vImgs[0] && str(vImgs[0].image_key) !== v.imageKey.trim()) {
      db.query("UPDATE product_images SET image_key = ? WHERE id = ?").run(
        v.imageKey.trim(),
        num(vImgs[0].id),
      );
    }
  }

  db.query(
    "UPDATE products SET sku = ?, sku_status = ?, loai_xe = ?, hang_xe = ?, ti_le = ?, updated_at = ? WHERE id = ?",
  ).run(
    defaultSku,
    defaultSku ? "complete" : "incomplete",
    vehicleType,
    brand,
    scale,
    nowIso,
    productId,
  );
  return { ok: true, error: null, productId };
}

