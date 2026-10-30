export type VnUnit = { code: number; name: string };

export type MapAddressParts = {
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  street?: string;
};

const API_BASE = "https://provinces.open-api.vn/api/v1";

// ---- Cache trong phiên cho API hành chính ---------------------------
let provincesCache: VnUnit[] | null = null;
let provincesPromise: Promise<VnUnit[]> | null = null;
const districtsCache = new Map<number, VnUnit[]>();
const wardsCache = new Map<number, VnUnit[]>();

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as unknown;
}

function toUnits(raw: unknown): VnUnit[] {
  if (!Array.isArray(raw)) return [];
  const out: VnUnit[] = [];
  for (const item of raw) {
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      if (typeof rec.code === "number" && typeof rec.name === "string") {
        out.push({ code: rec.code, name: rec.name });
      }
    }
  }
  return out;
}

export function loadProvinces(): Promise<VnUnit[]> {
  if (provincesCache) return Promise.resolve(provincesCache);
  if (!provincesPromise) {
    provincesPromise = fetchJson(`${API_BASE}/p/`)
      .then((raw) => {
        provincesCache = toUnits(raw);
        return provincesCache;
      })
      .catch((e: unknown) => {
        provincesPromise = null;
        throw e;
      });
  }
  return provincesPromise;
}

export async function loadDistricts(provinceCode: number): Promise<VnUnit[]> {
  const cached = districtsCache.get(provinceCode);
  if (cached) return cached;
  const raw = await fetchJson(`${API_BASE}/p/${provinceCode}?depth=2`);
  const list =
    raw && typeof raw === "object"
      ? toUnits((raw as Record<string, unknown>).districts)
      : [];
  districtsCache.set(provinceCode, list);
  return list;
}

export async function loadWards(districtCode: number): Promise<VnUnit[]> {
  const cached = wardsCache.get(districtCode);
  if (cached) return cached;
  const raw = await fetchJson(`${API_BASE}/d/${districtCode}?depth=2`);
  const list =
    raw && typeof raw === "object"
      ? toUnits((raw as Record<string, unknown>).wards)
      : [];
  wardsCache.set(districtCode, list);
  return list;
}

// ---- Chuẩn hoá tên để khớp địa chỉ từ bản đồ với danh sách API ------
export function normalizeVnName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(
      /^(thanh pho|tinh|quan|huyen|thi xa|thi tran|phuong|xa)\s+/,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function findByName(list: VnUnit[], candidate?: string): VnUnit | null {
  if (!candidate) return null;
  const target = normalizeVnName(candidate);
  if (!target) return null;
  return list.find((u) => normalizeVnName(u.name) === target) ?? null;
}

