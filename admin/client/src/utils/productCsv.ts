import type { CatalogData, Product, ProductInput } from "../types";

export function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Đúng bộ cột CSV của shop — dùng cho cả file Xuất và file mẫu tải về. */
export const CSV_HEADERS = [
  "Tên sản phẩm", "Hãng xe", "Tỉ lệ", "Loại xe", "Hãng mô hình", "Màu",
  "Giá (VND)", "Giá khuyến mãi", "Tồn kho", "Link ảnh", "Mô tả", "Nổi bật",
];

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(products: Product[]) {
  const lines = [CSV_HEADERS.join(",")];
  for (const p of products) {
    for (const v of p.variants) {
      lines.push(
        [
          p.name,
          p.brand,
          p.scale,
          p.vehicleType,
          p.modelMaker ?? "",
          v.colorName,
          v.price,
          v.promoPrice ?? "",
          v.stock,
          /^https?:\/\//i.test(v.imageKey) ? v.imageKey : /^data:/i.test(v.imageKey) ? "" : v.imageKey,
          p.description,
          p.isFeatured ? "Có" : "Không",
        ]
          .map(csvEscape)
          .join(","),
      );
    }
  }
  downloadTextFile("san-pham-xe-mo-hinh.csv", lines.join("\n"));
}

export function downloadCsvTemplate() {
  const example = [
    "Ví dụ: Toyota GR Supra [VÍ DỤ]",
    "Toyota",
    "1:32",
    "Ô tô",
    "GT Spirit",
    "Đỏ",
    "499000",
    "449000",
    "10",
    "https://example.com/anh-mau-supra-do.jpg",
    "Dòng ví dụ chỉ để xem định dạng — hệ thống tự bỏ qua khi nhập, không vào shop.",
    "Có",
  ];
  downloadTextFile(
    "mau-nhap-san-pham.csv",
    [CSV_HEADERS.join(","), example.map(csvEscape).join(",")].join("\n"),
  );
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\ufeff/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i] ?? "";
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export type ImportPlan = {
  items: ProductInput[];
  errors: string[];
  /** Tên các sản phẩm đã có bị bỏ qua vì không tích Ghi đè. */
  skippedDuplicates: string[];
  /** Số dòng ví dụ [VÍ DỤ] trong file mẫu bị bỏ qua. */
  skippedExampleRows: number;
  newCount: number;
  updateCount: number;
};

export function planImport(
  text: string,
  existing: Product[],
  overwrite: boolean,
  catalog: CatalogData | null,
): ImportPlan {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const skippedDuplicates: string[] = [];
  let skippedExampleRows = 0;
  const blank = {
    items: [] as ProductInput[],
    skippedDuplicates,
    skippedExampleRows: 0,
    newCount: 0,
    updateCount: 0,
  };
  if (rows.length < 2) return { ...blank, errors: ["File không có dòng dữ liệu nào."] };
  if (!catalog) {
    return {
      ...blank,
      errors: ["Chưa tải được Quản lý danh mục — chờ danh mục tải xong rồi chọn lại file để hệ thống đối chiếu."],
    };
  }
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const ci = {
    name: col("tên sản phẩm", "ten san pham", "name"),
    brand: col("hãng xe", "hang xe", "brand"),
    scale: col("tỉ lệ", "ti le", "scale"),
    vehicleType: col("loại xe", "loai xe", "vehicle_type", "vehicletype"),
    maker: col("hãng mô hình", "hang mo hinh", "model_maker", "modelmaker"),
    color: col("màu", "mau", "color"),
    price: col("giá (vnd)", "giá", "giá gốc", "gia goc", "gia", "price"),
    promo: col("giá khuyến mãi", "gia khuyen mai", "promo_price", "promoprice"),
    stock: col("tồn kho", "ton kho", "stock"),
    image: col("link ảnh", "link anh", "ảnh (image_key)", "anh (image_key)", "image_key", "imagekey"),
    desc: col("mô tả", "mo ta", "description"),
    featured: col("nổi bật", "noi bat", "featured"),
  };
  if (ci.name < 0 || ci.brand < 0 || ci.color < 0 || ci.price < 0) {
    return {
      ...blank,
      errors: ["Thiếu cột bắt buộc: Tên sản phẩm, Hãng xe, Màu, Giá (VND) — tải file mẫu CSV để xem đúng định dạng."],
    };
  }
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const groups = new Map<string, { first: string[]; rows: string[][]; lineNos: number[] }>();
  rows.slice(1).forEach((r, idx) => {
    if (get(r, ci.name).toLowerCase().includes("ví dụ")) {
      skippedExampleRows++;
      return;
    }
    const key = [get(r, ci.name), get(r, ci.brand), get(r, ci.scale)].join("||").toLowerCase();
    const g = groups.get(key) ?? { first: r, rows: [], lineNos: [] };
    g.rows.push(r);
    g.lineNos.push(idx + 2);
    groups.set(key, g);
  });

  const items: ProductInput[] = [];
  for (const g of groups.values()) {
    const name = get(g.first, ci.name);
    const lineNo = g.lineNos[0];
    if (!name) {
      errors.push(`Dòng ${lineNo}: thiếu tên sản phẩm.`);
      continue;
    }
    const brandRaw = get(g.first, ci.brand);
    const brandEntry = catalog.carBrands.find(
      (e) => e.name.toLowerCase() === brandRaw.toLowerCase(),
    );
    if (!brandRaw) {
      errors.push(`Dòng ${lineNo} (“${name}”): thiếu hãng xe.`);
      continue;
    }
    if (!brandEntry) {
      errors.push(
        `Dòng ${lineNo} (“${name}”): hãng xe “${brandRaw}” chưa có trong Quản lý danh mục → Hãng xe — dòng này không được nhập.`,
      );
      continue;
    }
    const brand = brandEntry.name;
    const scaleRawInput = get(g.first, ci.scale);
    const scaleEntry = catalog.scales.find(
      (e) => e.name.toLowerCase() === scaleRawInput.toLowerCase(),
    );
    if (!scaleRawInput) {
      errors.push(`Dòng ${lineNo} (“${name}”): thiếu tỉ lệ.`);
      continue;
    }
    if (!scaleEntry) {
      errors.push(
        `Dòng ${lineNo} (“${name}”): tỉ lệ “${scaleRawInput}” chưa có trong Quản lý danh mục → Tỉ lệ — dòng này không được nhập.`,
      );
      continue;
    }
    const scaleRaw = scaleEntry.name;
    const typeRaw = get(g.first, ci.vehicleType);
    const typeEntry = catalog.vehicleTypes.find(
      (e) => e.name.toLowerCase() === typeRaw.toLowerCase(),
    );
    if (!typeRaw) {
      errors.push(`Dòng ${lineNo} (“${name}”): thiếu loại xe.`);
      continue;
    }
    if (!typeEntry) {
      errors.push(
        `Dòng ${lineNo} (“${name}”): loại xe “${typeRaw}” chưa có trong Quản lý danh mục → Loại xe — dòng này không được nhập.`,
      );
      continue;
    }
    const makerRaw = get(g.first, ci.maker);
    let makerFromFile = "";
    if (makerRaw) {
      const makerEntry = catalog.modelMakers.find(
        (e) => e.name.toLowerCase() === makerRaw.toLowerCase(),
      );
      if (!makerEntry) {
        errors.push(
          `Dòng ${lineNo} (“${name}”): hãng mô hình “${makerRaw}” chưa có trong Quản lý danh mục → Hãng mô hình — dòng này không được nhập.`,
        );
        continue;
      }
      makerFromFile = makerEntry.name;
    }
    const match = existing.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() &&
        p.brand.toLowerCase() === brand.toLowerCase() &&
        p.scale === scaleRaw,
    );
    if (match && !overwrite) {
      skippedDuplicates.push(name);
      continue;
    }
    const variants: ProductInput["variants"] = [];
    let bad = false;
    g.rows.forEach((r, i) => {
      const color = get(r, ci.color);
      const price = Number(get(r, ci.price).replace(/[^\d]/g, ""));
      const promoRaw = get(r, ci.promo);
      const promo = promoRaw ? Number(promoRaw.replace(/[^\d]/g, "")) : null;
      const stock = Number(get(r, ci.stock).replace(/[^\d]/g, "") || "0");
      if (!color || !Number.isFinite(price) || price <= 0) {
        errors.push(`Dòng ${g.lineNos[i]}: màu hoặc giá gốc không hợp lệ.`);
        bad = true;
        return;
      }
      if (promo != null && promo >= price) {
        errors.push(`Dòng ${g.lineNos[i]}: giá khuyến mãi phải nhỏ hơn giá gốc.`);
        bad = true;
        return;
      }
      const existingVariant = match?.variants.find(
        (v) => v.colorName.toLowerCase() === color.toLowerCase(),
      );
      const imgRaw = get(r, ci.image);
      let imageKey = existingVariant?.imageKey || "scale132";
      if (imgRaw) {
        if (/^https?:\/\//i.test(imgRaw)) {
          try {
            new URL(imgRaw);
            imageKey = imgRaw;
          } catch {
            errors.push(`Dòng ${g.lineNos[i]}: link ảnh “${imgRaw}” không hợp lệ.`);
            bad = true;
            return;
          }
        } else if (/^[\w-]+$/.test(imgRaw)) {
          imageKey = imgRaw;
        } else {
          errors.push(`Dòng ${g.lineNos[i]}: link ảnh “${imgRaw}” không hợp lệ (phải bắt đầu bằng http:// hoặc https://).`);
          bad = true;
          return;
        }
      }
      variants.push({
        id: existingVariant?.id ?? null,
        colorName: color,
        price,
        promoPrice: promo,
        stock: Number.isFinite(stock) ? stock : 0,
        imageKey,
      });
    });
    if (bad || variants.length === 0) continue;
    if (match) {
      for (const v of match.variants) {
        if (!variants.some((x) => x.id === v.id)) {
          variants.push({
            id: v.id,
            colorName: v.colorName,
            price: v.price,
            promoPrice: v.promoPrice,
            stock: v.stock,
            imageKey: v.imageKey,
          });
        }
      }
    }
    const featuredRaw = get(g.first, ci.featured).trim().toLowerCase();
    items.push({
      id: match?.id ?? null,
      name,
      brand,
      scale: scaleRaw,
      vehicleType: typeEntry.name,
      description: get(g.first, ci.desc) || match?.description || "",
      features: match?.features ?? "",
      isFeatured: featuredRaw
        ? ["có", "co", "1", "true", "yes", "x"].includes(featuredRaw)
        : (match?.isFeatured ?? false),
      modelMaker: makerFromFile || match?.modelMaker || "",
      variants,
    });
  }
  return {
    items,
    errors,
    skippedDuplicates,
    skippedExampleRows,
    newCount: items.filter((it) => it.id == null).length,
    updateCount: items.filter((it) => it.id != null).length,
  };
}

