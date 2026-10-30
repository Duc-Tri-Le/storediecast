import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapAddressParts } from "./addressApi";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

type NominatimAddress = Record<string, string | undefined>;
type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

const nominatimCache = new Map<string, NominatimResult[]>();
let lastNominatimAt = 0;
let nominatimChain: Promise<void> = Promise.resolve();

function throttledNominatim<T>(task: () => Promise<T>): Promise<T> {
  const run = nominatimChain.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastNominatimAt = Date.now();
    return task();
  });
  nominatimChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  const key = query.trim().toLowerCase();
  const cached = nominatimCache.get(key);
  if (cached) return cached;
  const results = await throttledNominatim(async () => {
    const url = `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=vn&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NominatimResult[];
  });
  nominatimCache.set(key, results);
  return results;
}

async function nominatimReverse(lat: number, lon: number): Promise<NominatimResult | null> {
  return throttledNominatim(async () => {
    const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NominatimResult;
  });
}

export function partsFromNominatim(result: NominatimResult): MapAddressParts {
  const a: NominatimAddress = result.address ?? {};
  const streetParts = [a.house_number, a.road].filter(Boolean);
  return {
    provinceName: a.state ?? a.province,
    districtName: a.city_district ?? a.county ?? a.city ?? a.town ?? a.district,
    wardName: a.suburb ?? a.quarter ?? a.village ?? a.hamlet ?? a.neighbourhood,
    street: streetParts.length > 0 ? streetParts.join(" ") : undefined,
  };
}

export function AddressMapPicker({
  idPrefix,
  onApply,
}: {
  idPrefix: string;
  onApply: (parts: MapAddressParts) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;
  const [mapFailed, setMapFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tileErrorsRef = useRef(0);

  const placeMarker = useCallback((lat: number, lon: number, zoom = 16) => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([lat, lon], Math.max(map.getZoom(), zoom));
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon], {
        icon: L.divIcon({
          className: "shop-map-pin",
          html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#c8102e;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45);transform:rotate(-45deg)"></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 20],
        }),
      }).addTo(map);
    }
  }, []);

  useEffect(() => {
    const el = mapDivRef.current;
    if (!el || mapRef.current) return;
    let map: L.Map | null = null;
    try {
      map = L.map(el, { scrollWheelZoom: false }).setView([16.0471, 108.2068], 5);
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      tiles.on("tileerror", () => {
        tileErrorsRef.current += 1;
        if (tileErrorsRef.current >= 4) setMapFailed(true);
      });
      tiles.addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng, 16);
        nominatimReverse(e.latlng.lat, e.latlng.lng)
          .then((res) => {
            if (res) onApplyRef.current(partsFromNominatim(res));
          })
          .catch(() => {
            // Bấm bản đồ mà tra ngược lỗi: ghim vẫn ở đó, khách vẫn
            // chọn địa chỉ bằng 3 ô cha con như thường.
          });
      });
      mapRef.current = map;
      const t = setTimeout(() => map?.invalidateSize(), 350);
      return () => {
        clearTimeout(t);
        map?.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    } catch {
      setMapFailed(true);
      return undefined;
    }
  }, [placeMarker]);

  // Gõ tìm địa chỉ: debounce 700ms rồi mới gọi Nominatim (kèm cache +
  // giãn cách trong throttledNominatim).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      nominatimSearch(q)
        .then((results) => {
          setSuggestions(results);
          setSearchError(null);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
          setSearchError("Không tìm được địa chỉ lúc này — bạn chọn địa chỉ bằng 3 ô bên dưới nhé.");
        })
        .finally(() => setSearching(false));
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function pickSuggestion(result: NominatimResult) {
    const lat = Number(result.lat);
    const lon = Number(result.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) placeMarker(lat, lon, 16);
    setQuery(result.display_name);
    setShowSuggestions(false);
    onApplyRef.current(partsFromNominatim(result));
  }

  if (mapFailed) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3.5 py-3">
        <label htmlFor={`${idPrefix}-map-search`} className="text-sm font-semibold">
          Tìm địa chỉ trên bản đồ
        </label>
        <input
          id={`${idPrefix}-map-search`}
          disabled
          placeholder="Bản đồ chưa tải được"
          className="mt-1.5 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm opacity-60"
        />
        <p role="status" className="mt-2 text-xs leading-relaxed text-[var(--dim)]">
          Không tải được bản đồ — bạn vẫn đặt được đơn bằng 3 ô chọn Tỉnh/Thành phố,
          Quận/huyện, Xã/phường bên dưới. © OpenStreetMap contributors
        </p>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={`${idPrefix}-map-search`} className="text-sm font-semibold">
        Tìm địa chỉ trên bản đồ (không bắt buộc)
      </label>
      <div className="relative mt-1.5">
        <input
          id={`${idPrefix}-map-search`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder="Gõ địa chỉ, ví dụ: 1 Tràng Tiền, Hoàn Kiếm, Hà Nội"
          autoComplete="off"
          className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${s.lon}-${i}`}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  aria-label={`Chọn địa chỉ gợi ý: ${s.display_name}`}
                  className="block w-full px-3 py-2.5 text-left text-sm leading-snug hover:bg-[var(--surface2)]"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {searching && (
        <p role="status" className="mt-1 text-xs text-[var(--dim)]">Đang tìm địa chỉ…</p>
      )}
      {searchError && (
        <p role="status" className="mt-1 text-xs text-[var(--dim)]">{searchError}</p>
      )}
      <div
        ref={mapDivRef}
        role="application"
        aria-label="Bản đồ OpenStreetMap — bấm vào bản đồ để đặt ghim chọn địa chỉ"
        className="isolate mt-2 h-52 w-full overflow-hidden rounded-xl border border-[var(--border)]"
      />
      <p className="mt-1 text-xs text-[var(--dim)]">
        Bấm vào bản đồ để đặt ghim, hoặc gõ địa chỉ để chọn gợi ý — các ô địa chỉ bên dưới sẽ tự
        điền, bạn vẫn sửa lại được. Bản đồ © OpenStreetMap contributors.
      </p>
    </div>
  );
}

