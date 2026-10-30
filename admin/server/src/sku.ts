// ─────────────────────────────────────────────────────────────────────
// Hệ thống mã SKU nội bộ — quy ước do chủ shop chốt (29/10/2026).
//
// Cấu trúc: [Mã hãng mô hình]-[Mã tỷ lệ]-[Mã thương hiệu xe]-[Mã dòng
// xe]-[Mã màu], nối bằng dấu gạch nối "-".
//   GT Spirit  · 1:18 · BMW · M8 Gran Coupe · Xanh dương
//     → GTS-18-BMW-M8GC-BL
//   Mini GT    · 1:64 · BMW · M8 Gran Coupe · Đen
//     → MGT-64-BMW-M8GC-BK
//   Bburago    · 1:24 · Ferrari · FXX-K · Đỏ
//     → BB-24-FER-FXXK-RD
//
// Quy tắc cứng khi sinh/kiểm tra mã:
//  - Tuyệt đối không có khoảng trắng, dấu /, dấu * hay ký tự đặc biệt
//    nào khác: chỉ chữ, số, dấu "-" và dấu "_".
//  - Không bắt đầu bằng số 0 (phần mềm kho như Excel tự xóa số 0 đầu).
//  - Độ dài lý tưởng 8–15 ký tự; nếu mã đầy đủ 5 thành phần dài hơn
//    thì VẪN giữ đủ 5 thành phần, không cắt bỏ thành phần nào để ép
//    độ dài (cả 3 ví dụ chuẩn của chủ shop đều dài hơn 15 ký tự).
//  - Nhất quán: mỗi hãng/màu chỉ có ĐÚNG một mã, lấy từ các bảng mã
//    duy nhất trong file này — không suy diễn tại chỗ ở nơi khác.
//  - Mã phải duy nhất: trùng mã thì từ chối, không ghi đè (việc kiểm
//    tra trùng với database nằm ở actions.ts, nơi có quyền ghi).
//
// Mã SKU chỉ nằm trong database + dữ liệu nội bộ của đơn hàng. Mọi
// response trả về phía khách (productOut / orderOut) đều lược bỏ nó.
// ─────────────────────────────────────────────────────────────────────

/** Bỏ dấu tiếng Việt + đ/Đ, dùng cho mọi bước suy mã. */
export function stripDiacritics(s: string): string {
  return s
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Chỉ giữ chữ/số viết hoa — bỏ khoảng trắng và mọi ký tự đặc biệt. */
function alnumUpper(s: string): string {
  return stripDiacritics(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// ── Bảng mã hãng MÔ HÌNH (hãng sản xuất mô hình) ─────────────────────
// Ba mã đầu là ví dụ chủ shop chốt nguyên văn; các hãng quen thuộc
// khác theo cùng nguyên tắc viết tắt nhất quán. Hãng chưa có trong
// bảng dùng quy tắc dự phòng ở modelMakerCode() — vẫn xác định duy
// nhất theo tên hãng, không đổi theo lần gọi.
export const MODEL_MAKER_CODES: Record<string, string> = {
  "GT Spirit": "GTS",
  "Mini GT": "MGT",
  Bburago: "BB",
  AUTOart: "AA",
  "Almost Real": "ALR",
  Minichamps: "MIN",
  Norev: "NOR",
  Kyosho: "KYO",
  "Hot Wheels": "HW",
  Maisto: "MAI",
  Welly: "WEL",
  Solido: "SOL",
  "KK Scale": "KKS",
  Ottomobile: "OTT",
  "GT Autos": "GTA",
  CMC: "CMC",
  Exoto: "EXO",
  Tomica: "TOM",
  Greenlight: "GLT",
  M2: "M2",
};

export function modelMakerCode(modelMaker: string): string | null {
  const name = modelMaker.trim();
  if (!name) return null;
  const known = MODEL_MAKER_CODES[name];
  if (known) return known;
  // Dự phòng nhất quán: nhiều từ → chữ cái đầu của tối đa 3 từ đầu;
  // một từ → 3 chữ cái đầu của từ đó.
  const words = stripDiacritics(name)
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return null;
  if (words.length === 1) return alnumUpper(words[0] ?? "").slice(0, 3) || null;
  return words
    .slice(0, 3)
    .map((w) => (w[0] ?? "").toUpperCase())
    .join("");
}

/** Bỏ dấu + viết hoa + chỉ giữ chữ/số — khóa so khớp cho bảng mã loại xe. */
function vehicleTypeKey(s: string): string {
  return stripDiacritics(s).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
}

// ── Bảng mã LOẠI XE (tự sinh từ tên, không nhập tay) ─────────────────
// Ba mã dưới là quy ước chủ shop chốt nguyên văn. Loại xe ngoài bảng
// dùng quy tắc dự phòng ở vehicleTypeCode() — vẫn xác định duy nhất
// theo chính tên loại xe: nhiều từ → chữ cái đầu của mỗi từ viết hoa
// không dấu; một từ → 3 chữ cái đầu. Mã chỉ để HIỂN THỊ ở trang Quản
// lý danh mục → Loại xe (không lưu cột riêng, không đổi dữ liệu loại
// xe đang có): tên đổi thì mã suy lại theo tên mới ngay.
export const VEHICLE_TYPE_CODES: Record<string, string> = {
  "Ô tô": "OTO",
  "Xe máy": "XM",
  "Xe bán tải": "XBT",
};

export function vehicleTypeCode(vehicleType: string): string | null {
  const name = vehicleType.trim();
  if (!name) return null;
  const key = vehicleTypeKey(name);
  for (const [knownName, code] of Object.entries(VEHICLE_TYPE_CODES)) {
    if (vehicleTypeKey(knownName) === key) return code;
  }
  const words = stripDiacritics(name)
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return null;
  if (words.length === 1) return alnumUpper(words[0] ?? "").slice(0, 3) || null;
  return words.map((w) => (stripDiacritics(w)[0] ?? "").toUpperCase()).join("") || null;
}

// ── Bảng mã TỶ LỆ ────────────────────────────────────────────────────
export const SCALE_CODES: Record<string, string> = {
  "1:18": "18",
  "1:24": "24",
  "1:43": "43",
  "1:64": "64",
  "1:32": "32",
  "1:16": "16",
  "1:12": "12",
};

export function scaleCode(scale: string): string | null {
  const known = SCALE_CODES[scale.trim()];
  if (known) return known;
  // Dự phòng: "1:XX" → "XX" (bỏ phần "1:").
  const m = scale.trim().match(/^1:(\d+)$/);
  return m ? (m[1] ?? null) : null;
}

// ── Bảng mã THƯƠNG HIỆU XE THỰC TẾ ───────────────────────────────────
// Năm mã đầu là quy ước chủ shop chốt nguyên văn; các hãng còn lại
// trên kệ dùng mã ngắn nhất quán trong chính bảng này.
export const CAR_BRAND_CODES: Record<string, string> = {
  BMW: "BMW",
  "Mercedes-Benz": "MB",
  Ferrari: "FER",
  Lamborghini: "LAM",
  Porsche: "POR",
  Toyota: "TOY",
  Honda: "HON",
  Ford: "FOR",
  Chevrolet: "CHE",
  Nissan: "NIS",
  Audi: "AUD",
  Kia: "KIA",
  Hyundai: "HYU",
  Mazda: "MAZ",
  Lexus: "LEX",
  "Land Rover": "LR",
  VinFast: "VF",
  Yamaha: "YAM",
  Suzuki: "SUZ",
  Vespa: "VES",
  Ducati: "DUC",
};

export function carBrandCode(brand: string): string | null {
  const name = brand.trim();
  if (!name) return null;
  const known = CAR_BRAND_CODES[name];
  if (known) return known;
  return alnumUpper(name).slice(0, 3) || null;
}

// ── Mã DÒNG XE ───────────────────────────────────────────────────────
// Bỏ tên thương hiệu ở đầu tên sản phẩm (nếu có), bỏ dấu/khoảng trắng/
// ký tự đặc biệt, viết hoa: từ đầu giữ nguyên, mỗi từ sau lấy chữ cái
// đầu. "M8 Gran Coupe" → "M8GC"; "FXX-K" → "FXXK"; "911 Carrera S" →
// "911CS"; "GR Supra" → "GRS".
export function modelCode(productName: string, brand: string): string | null {
  let name = productName.replace(" [MẪU]", "").trim();
  if (brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = name.slice(brand.length).trim();
  }
  const words = stripDiacritics(name)
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return null;
  const first = alnumUpper(words[0] ?? "");
  if (!first) return null;
  const rest = words
    .slice(1)
    .map((w) => (stripDiacritics(w)[0] ?? "").toUpperCase())
    .join("");
  return first + rest;
}

// ── Bảng mã MÀU (2 ký tự) ────────────────────────────────────────────
// Ba mã đầu là ví dụ chủ shop chốt (Xanh dương BL, Đen BK, Đỏ RD);
// các màu còn lại trên kệ dùng mã 2 ký tự nhất quán trong bảng này.
// Tên màu không khớp bảng nào thì dùng quy tắc dự phòng ở colorCode()
// (suy từ chính tên màu) — không vì thế mà chặn sinh SKU.
// Khớp theo cụm dài trước (ví dụ "xanh dương" trước "xanh") trên tên
// màu đã bỏ dấu, nên "Đỏ Rosso Mars" → RD, "Xanh dương San Marino
// Blue" → BL, "Đen Sapphire Black" → BK.
const COLOR_CODE_RULES: Array<[string, string]> = [
  // Cụm màu ĐẶC THÙ phải khớp trước các quy tắc chung ở dưới, vì khớp
  // theo chuỗi con sẽ bắt nhầm: "Xám Nardo Gray" chứa "do" (trong
  // "Nardo") → suýt thành RD thay vì GY; "Nâu đồng" chứa "do" (trong
  // "đồng") → suýt thành RD thay vì BR; "Vàng Giallo Modena" chứa
  // "den" (trong "Modena") → suýt thành BK thay vì YL, và BK đó còn
  // trùng đúng mã của biến thể Đen Nero Daytona của cùng mẫu F8.
  ["nardo", "GY"],
  ["nau dong", "BR"],
  ["giallo", "YL"],
  ["xanh duong", "BL"],
  ["xanh ngoc", "TQ"],
  ["xanh la", "GN"],
  ["xanh gp", "BL"],
  ["xanh", "BL"],
  ["do", "RD"],
  ["den", "BK"],
  ["trang", "WH"],
  ["bac", "SV"],
  ["xam", "GY"],
  ["vang", "YL"],
  ["cam", "OR"],
  ["tim", "PR"],
  ["nau", "BR"],
  ["hong", "PK"],
  ["be", "BE"],
  ["kem", "CR"],
];

export function colorCode(colorName: string): string | null {
  const lower = stripDiacritics(colorName).toLowerCase();
  for (const [kw, code] of COLOR_CODE_RULES) {
    if (lower.includes(kw)) return code;
  }
  // Dự phòng nhất quán (cùng nguyên tắc với modelMakerCode /
  // carBrandCode ở trên): tên màu ngoài bảng — tên tiếng Anh, tên màu
  // hãng xe, hay tên ngắn như "d" — vẫn có ĐÚNG một mã xác định theo
  // chính tên màu đó, không đổi theo lần gọi: nhiều từ → chữ cái đầu
  // của 2 từ đầu; một từ → 2 ký tự đầu của từ; tên chỉ có 1 ký tự →
  // ký tự đó + "X" để mã màu vẫn đủ 2 ký tự. Chỉ khi tên màu không có
  // chữ/số nào mới trả null (thành phần màu thật sự trống).
  const words = lower.split(/[^a-z0-9]+/).filter((w) => w.length > 0);
  if (words.length === 0) return null;
  if (words.length > 1) {
    return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
  }
  const w = alnumUpper(words[0] ?? "");
  if (w.length >= 2) return w.slice(0, 2);
  if (w.length === 1) return `${w}X`;
  return null;
}

// ── Kiểm tra + sinh mã ───────────────────────────────────────────────
export type SkuValidation = { ok: true } | { ok: false; reason: string };

/**
 * Kiểm tra một mã SKU theo quy tắc cứng của chủ shop. Độ dài ngoài
 * khoảng 8–15 KHÔNG phải lỗi cứng khi mã có đủ 5 thành phần (theo chỉ
 * dẫn: giữ đủ thành phần thay vì cắt bỏ để ép độ dài).
 */
export function validateSku(sku: string): SkuValidation {
  if (!sku) return { ok: false, reason: "Mã rỗng." };
  if (/\s/.test(sku)) return { ok: false, reason: "Mã chứa khoảng trắng." };
  if (!/^[A-Za-z0-9_-]+$/.test(sku)) {
    return {
      ok: false,
      reason: "Mã chứa ký tự không cho phép (chỉ chữ, số, dấu - và _).",
    };
  }
  if (sku.startsWith("0")) {
    return { ok: false, reason: "Mã không được bắt đầu bằng số 0." };
  }
  const parts = sku.split("-").filter((p) => p.length > 0);
  if (parts.length !== 5) {
    return {
      ok: false,
      reason: "Mã phải có đủ 5 thành phần nối bằng dấu -.",
    };
  }
  if (sku.length < 8) return { ok: false, reason: "Mã ngắn hơn 8 ký tự." };
  return { ok: true };
}

export type SkuParts = {
  modelMaker: string;
  scale: string;
  brand: string;
  /** Tên sản phẩm đầy đủ (được tự tách phần dòng xe theo brand). */
  productName: string;
  colorName: string;
  /**
   * Mã lấy từ Quản lý danh mục (database chung) — khi có thì dùng đúng
   * mã này thay cho bảng mã tĩnh trong file, để đổi mã ở trang danh mục
   * là SKU sinh sau đó dùng mã mới ngay.
   */
  codes?: {
    makerCode?: string | null;
    scaleCode?: string | null;
    brandCode?: string | null;
  };
};

export type GeneratedSku =
  | { status: "complete"; sku: string }
  | { status: "incomplete"; sku: null; missing: string };

/**
 * Sinh mã SKU đầy đủ từ 5 thành phần. Thiếu hãng mô hình → trả trạng
 * thái "incomplete" và sku = null. (Kệ mẫu hiện tại ĐÃ có hãng mô hình
 * do chủ shop cho phép bịa riêng cho hàng mẫu — xem
 * SAMPLE_MODEL_MAKERS ở actions.ts; hãng mô hình của HÀNG THẬT vẫn
 * phải là hãng thật, không suy diễn.)
 */
export function generateSku(parts: SkuParts): GeneratedSku {
  const maker = parts.modelMaker.trim();
  if (!maker) return { status: "incomplete", sku: null, missing: "modelMaker" };
  const makerCode = parts.codes?.makerCode ?? modelMakerCode(maker);
  if (!makerCode) return { status: "incomplete", sku: null, missing: "modelMaker" };
  const sc = parts.codes?.scaleCode ?? scaleCode(parts.scale);
  if (!sc) return { status: "incomplete", sku: null, missing: "scale" };
  const bc = parts.codes?.brandCode ?? carBrandCode(parts.brand);
  if (!bc) return { status: "incomplete", sku: null, missing: "brand" };
  const mc = modelCode(parts.productName, parts.brand);
  if (!mc) return { status: "incomplete", sku: null, missing: "model" };
  const cc = colorCode(parts.colorName);
  if (!cc) return { status: "incomplete", sku: null, missing: "color" };
  const sku = [makerCode, sc, bc, mc, cc].join("-");
  const v = validateSku(sku);
  if (!v.ok) return { status: "incomplete", sku: null, missing: `invalid:${v.reason}` };
  return { status: "complete", sku };
}
