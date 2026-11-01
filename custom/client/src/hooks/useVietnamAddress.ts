import { useCallback, useEffect, useRef, useState } from "react";
import {
  type VnUnit,
  type MapAddressParts,
  loadProvinces,
  loadDistricts,
  loadWards,
  findByName,
} from "../addressApi";

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<VnUnit[]>([]);
  const [districts, setDistricts] = useState<VnUnit[]>([]);
  const [wards, setWards] = useState<VnUnit[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState<number | "other" | null>(null);
  const [wardCustom, setWardCustom] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualDistrict, setManualDistrict] = useState("");
  const [manualWard, setManualWard] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const seqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadProvinces()
      .then((list) => {
        if (cancelled) return;
        if (list.length === 0) setManualMode(true);
        else setProvinces(list);
      })
      .catch(() => {
        if (!cancelled) setManualMode(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectProvince = useCallback(async (code: number | null) => {
    const seq = ++seqRef.current;
    setProvinceCode(code);
    setDistrictCode(null);
    setWardCode(null);
    setWardCustom("");
    setDistricts([]);
    setWards([]);
    if (code == null) return;
    setLoadingDistricts(true);
    try {
      const list = await loadDistricts(code);
      if (seqRef.current !== seq) return;
      setDistricts(list);
    } catch {
      if (seqRef.current !== seq) return;
      setManualCity((prev) => prev || "");
      setManualMode(true);
    } finally {
      if (seqRef.current === seq) setLoadingDistricts(false);
    }
  }, []);

  const selectDistrict = useCallback(async (code: number | null) => {
    const seq = ++seqRef.current;
    setDistrictCode(code);
    setWardCode(null);
    setWardCustom("");
    setWards([]);
    if (code == null) return;
    setLoadingWards(true);
    try {
      const list = await loadWards(code);
      if (seqRef.current !== seq) return;
      setWards(list);
    } catch {
      if (seqRef.current !== seq) return;
      setManualMode(true);
    } finally {
      if (seqRef.current === seq) setLoadingWards(false);
    }
  }, []);

  const selectWard = useCallback((code: number | "other" | null) => {
    setWardCode(code);
    if (code !== "other") setWardCustom("");
  }, []);

  const cityName = manualMode
    ? manualCity.trim()
    : (provinces.find((p) => p.code === provinceCode)?.name ?? "");
  const districtName = manualMode
    ? manualDistrict.trim()
    : (districts.find((d) => d.code === districtCode)?.name ?? "");
  const wardName = manualMode
    ? manualWard.trim()
    : wardCode === "other"
      ? wardCustom.trim()
      : (wards.find((w) => w.code === wardCode)?.name ?? "");

  const applyMapAddress = useCallback(
    async (parts: MapAddressParts): Promise<string | null> => {
      const street = parts.street?.trim() ? parts.street.trim() : null;
      if (manualMode) return street;
      try {
        const provList = provinces.length > 0 ? provinces : await loadProvinces();
        if (provList.length > 0 && provinces.length === 0) setProvinces(provList);
        const prov = findByName(provList, parts.provinceName);
        if (!prov) return street;
        await selectProvince(prov.code);
        if (parts.districtName) {
          const distList = await loadDistricts(prov.code);
          const dist = findByName(distList, parts.districtName);
          if (dist) {
            await selectDistrict(dist.code);
            if (parts.wardName) {
              const wardList = await loadWards(dist.code);
              const ward = findByName(wardList, parts.wardName);
              if (ward) selectWard(ward.code);
            }
          }
        }
      } catch {
        // Khớp bản đồ thất bại không làm hỏng form
      }
      return street;
    },
    [manualMode, provinces, selectProvince, selectDistrict, selectWard],
  );

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    wardCode,
    wardCustom,
    setWardCustom,
    manualMode,
    manualCity,
    manualDistrict,
    manualWard,
    setManualCity,
    setManualDistrict,
    setManualWard,
    loadingDistricts,
    loadingWards,
    selectProvince,
    selectDistrict,
    selectWard,
    cityName,
    districtName,
    wardName,
    applyMapAddress,
  };
}

export type VietnamAddressState = ReturnType<typeof useVietnamAddress>;
