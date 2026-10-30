import type { VietnamAddressState } from "./useVietnamAddress";

export function AddressSelectFields({
  addr,
  idPrefix,
  inputCls,
}: {
  addr: VietnamAddressState;
  idPrefix: string;
  inputCls: string;
}) {
  if (addr.manualMode) {
    return (
      <div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label htmlFor={`${idPrefix}-city`} className="sr-only">Tỉnh/Thành phố</label>
            <input
              id={`${idPrefix}-city`}
              value={addr.manualCity}
              onChange={(e) => addr.setManualCity(e.target.value)}
              placeholder="Tỉnh/Thành phố *"
              autoComplete="address-level1"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-district`} className="sr-only">Quận/huyện</label>
            <input
              id={`${idPrefix}-district`}
              value={addr.manualDistrict}
              onChange={(e) => addr.setManualDistrict(e.target.value)}
              placeholder="Quận/huyện *"
              autoComplete="address-level2"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-ward`} className="sr-only">Xã/phường</label>
            <input
              id={`${idPrefix}-ward`}
              value={addr.manualWard}
              onChange={(e) => addr.setManualWard(e.target.value)}
              placeholder="Xã/phường *"
              autoComplete="address-level3"
              className={inputCls}
            />
          </div>
        </div>
        <p role="status" className="mt-1.5 text-xs text-[var(--dim)]">
          Không tải được danh sách tỉnh/quận/xã — bạn nhập tay địa chỉ vẫn đặt được đơn bình thường.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label htmlFor={`${idPrefix}-city`} className="sr-only">Tỉnh/Thành phố</label>
          <select
            id={`${idPrefix}-city`}
            aria-label="Tỉnh/Thành phố"
            value={addr.provinceCode ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              void addr.selectProvince(v === "" ? null : Number(v));
            }}
            className={inputCls}
          >
            <option value="">Tỉnh/Thành phố *</option>
            {addr.provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-district`} className="sr-only">Quận/huyện</label>
          <select
            id={`${idPrefix}-district`}
            aria-label="Quận/huyện"
            value={addr.districtCode ?? ""}
            disabled={addr.provinceCode == null || addr.loadingDistricts}
            onChange={(e) => {
              const v = e.target.value;
              void addr.selectDistrict(v === "" ? null : Number(v));
            }}
            className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">
              {addr.provinceCode == null
                ? "Chọn tỉnh trước"
                : addr.loadingDistricts
                  ? "Đang tải quận/huyện…"
                  : "Quận/huyện *"}
            </option>
            {addr.districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-ward`} className="sr-only">Xã/phường</label>
          <select
            id={`${idPrefix}-ward`}
            aria-label="Xã/phường"
            value={addr.wardCode ?? ""}
            disabled={addr.districtCode == null || addr.loadingWards}
            onChange={(e) => {
              const v = e.target.value;
              addr.selectWard(v === "" ? null : v === "other" ? "other" : Number(v));
            }}
            className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">
              {addr.districtCode == null
                ? "Chọn quận/huyện trước"
                : addr.loadingWards
                  ? "Đang tải xã/phường…"
                  : "Xã/phường *"}
            </option>
            {addr.wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
            <option value="other">Khác (nhập tay)</option>
          </select>
        </div>
      </div>
      {addr.wardCode === "other" && (
        <div className="mt-2">
          <label htmlFor={`${idPrefix}-ward-custom`} className="sr-only">Tên xã/phường khác</label>
          <input
            id={`${idPrefix}-ward-custom`}
            value={addr.wardCustom}
            onChange={(e) => addr.setWardCustom(e.target.value)}
            placeholder="Nhập tên xã/phường của bạn *"
            autoComplete="address-level3"
            className={inputCls}
          />
        </div>
      )}
    </div>
  );
}

