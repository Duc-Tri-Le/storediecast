import { useState } from "react";
import type { Product } from "../types";
import { POLICIES } from "../data/policies";

export function featureSegments(p: Product): string[] {
  return p.features
    .split("·")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const SCALE_SIZE: Record<string, string> = {
  "1:64": "~7 cm",
  "1:32": "~13–14 cm",
  "1:16": "~28–30 cm",
};

export function specRows(p: Product, colorName?: string): Array<{ label: string; value: string }> {
  const segs = featureSegments(p);
  const sizeSeg = segs.find((s) => /dài/i.test(s));
  const restSegs = segs.filter((s) => s !== sizeSeg);
  const boxSeg = segs.find((s) => /hộp|đế/i.test(s));
  return [
    { label: "Hãng", value: p.brand },
    { label: "Loại xe", value: p.vehicleType },
    { label: "Tỉ lệ", value: p.scale },
    { label: "Màu", value: colorName ?? p.colorName },
    {
      label: "Cấu tạo",
      value: restSegs.length > 0 ? restSegs.join(" · ") : p.features,
    },
    { label: "Kích thước", value: sizeSeg ?? `Dài ${SCALE_SIZE[p.scale] ?? ""}`.trim() },
    {
      label: "Kèm hộp / đế",
      value: boxSeg ?? "Đóng gói chống sốc khi giao (mẫu này không ghi kèm hộp/đế riêng)",
    },
  ];
}

export function ProductInfoTabs({
  product,
  colorName,
  bullets,
}: {
  product: Product;
  colorName: string;
  bullets: string[];
}) {
  const [infoOpen, setInfoOpen] = useState(true);
  const [shippingPolicyOpen, setShippingPolicyOpen] = useState(false);
  const [returnsPolicyOpen, setReturnsPolicyOpen] = useState(false);

  return (
    <div className="md:grid md:grid-cols-2 md:gap-10">
      <div className="min-w-0 md:col-start-2">
        <section aria-label="Thông tin sản phẩm" className="mt-12">
          <h2>
            <button
              type="button"
              onClick={() => setInfoOpen((o) => !o)}
              aria-expanded={infoOpen}
              aria-label={infoOpen ? "Thu gọn mục Thông tin sản phẩm" : "Mở rộng mục Thông tin sản phẩm"}
              className="flex w-full items-center justify-between gap-3 text-left text-xl font-black tracking-tight"
            >
              Thông tin sản phẩm
              <span aria-hidden className="text-base text-[var(--dim)]">{infoOpen ? "▲" : "▼"}</span>
            </button>
          </h2>
          {infoOpen && (
            <>
              <dl className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm">
                {specRows(product, colorName).map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-[var(--border)]" : ""}`}
                  >
                    <dt className="shrink-0 text-[var(--dim)]">{row.label}</dt>
                    <dd className="text-right font-semibold">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[15px] leading-relaxed">{product.description}</p>
              {bullets.length > 0 && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
                  {bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <section aria-label="Chính sách vận chuyển" className="mt-8">
          <h2>
            <button
              type="button"
              onClick={() => setShippingPolicyOpen((o) => !o)}
              aria-expanded={shippingPolicyOpen}
              aria-label={shippingPolicyOpen ? "Thu gọn mục Chính sách vận chuyển" : "Mở rộng mục Chính sách vận chuyển"}
              className="flex w-full items-center justify-between gap-3 text-left text-xl font-black tracking-tight"
            >
              Chính sách vận chuyển
              <span aria-hidden className="text-base text-[var(--dim)]">{shippingPolicyOpen ? "▲" : "▼"}</span>
            </button>
          </h2>
          {shippingPolicyOpen && (
            <>
              <p className="mt-3 text-[15px] leading-relaxed">{POLICIES.shipping.intro}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--dim)]">
                {POLICIES.shipping.points.map((point) => (
                  <li key={point.slice(0, 32)}>{point}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-label="Chính sách đổi trả" className="mt-8">
          <h2>
            <button
              type="button"
              onClick={() => setReturnsPolicyOpen((o) => !o)}
              aria-expanded={returnsPolicyOpen}
              aria-label={returnsPolicyOpen ? "Thu gọn mục Chính sách đổi trả" : "Mở rộng mục Chính sách đổi trả"}
              className="flex w-full items-center justify-between gap-3 text-left text-xl font-black tracking-tight"
            >
              Chính sách đổi trả
              <span aria-hidden className="text-base text-[var(--dim)]">{returnsPolicyOpen ? "▲" : "▼"}</span>
            </button>
          </h2>
          {returnsPolicyOpen && (
            <>
              <p className="mt-3 text-[15px] leading-relaxed">{POLICIES.returns.intro}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--dim)]">
                {POLICIES.returns.points.map((point) => (
                  <li key={point.slice(0, 32)}>{point}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

