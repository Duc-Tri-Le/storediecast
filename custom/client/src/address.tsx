// =====================================================================
// ĐỊA CHỈ LỌC THEO CHA CON + BẢN ĐỒ MIỄN PHÍ
// Module tổng hợp: re-export toàn bộ API, Hook và UI component
// =====================================================================

export type { VnUnit, MapAddressParts } from "./addressApi";
export {
  loadProvinces,
  loadDistricts,
  loadWards,
  normalizeVnName,
  findByName,
} from "./addressApi";

export type { VietnamAddressState } from "./useVietnamAddress";
export { useVietnamAddress } from "./useVietnamAddress";

export { AddressSelectFields } from "./AddressSelectFields";

export { AddressMapPicker, partsFromNominatim } from "./AddressMapPicker";
