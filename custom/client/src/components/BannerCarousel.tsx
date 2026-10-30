import { useState, useRef, useEffect } from "react";
import heroImg from "../assets/hero.jpg";
import scale116Img from "../assets/scale116.jpg";
import scale132Img from "../assets/scale132.jpg";
import scale164Img from "../assets/scale164.jpg";
import type { ScaleFilter } from "../types";

type Banner = {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  img: string;
  alt: string;
  action: "products" | "collection" | "scale116" | "sale";
};

const BANNERS: Banner[] = [
  {
    eyebrow: "Bộ sưu tập mô hình · Ô tô · Xe máy · Bán tải",
    title: "Đủ loại xe, đủ màu, đủ 3 tỉ lệ.",
    desc: "Từ 1:64 bỏ túi, 1:32 mở cửa vừa tay, tới 1:16 cỡ lớn cho kệ sưu tầm — ô tô, xe máy, xe bán tải đủ màu, giao hàng toàn quốc, freeship đơn từ 1.000.000₫.",
    cta: "Mua ngay — xem sản phẩm",
    img: heroImg,
    alt: "Mô hình siêu xe đỏ tỉ lệ 1:16 trên bệ trưng bày showroom",
    action: "products",
  },
  {
    eyebrow: "Bộ sưu tập · Tỉ lệ 1:16",
    title: "Cỡ lớn 1:16 — tâm điểm của kệ trưng",
    desc: "Khoảng 28–30 cm, chi tiết khoang máy và nội thất, kèm hộp và đế trưng bày. Mẫu mô hình cỡ lớn dành cho người sưu tầm và làm quà tặng.",
    cta: "Xem xe tỉ lệ 1:16",
    img: scale116Img,
    alt: "Cận cảnh khoang máy mô hình xe đỏ cổ điển tỉ lệ 1:16",
    action: "scale116",
  },
  {
    eyebrow: "Ưu đãi · Đang giảm giá",
    title: "Mẫu đang giảm giá — chốt sớm kẻo hết",
    desc: "Nhiều mẫu đang có giá khuyến mãi ngay trên thẻ sản phẩm. Đơn từ 1.000.000₫ được freeship toàn quốc.",
    cta: "Xem xe đang giảm giá",
    img: scale132Img,
    alt: "Mô hình SUV đỏ tỉ lệ 1:32 mở cả bốn cửa, đang giảm giá",
    action: "sale",
  },
  {
    eyebrow: "Bộ sưu tập · 3 bộ theo tỉ lệ",
    title: "1:64 bỏ túi · 1:32 vừa tay · 1:16 sưu tầm",
    desc: "Chưa biết chọn cỡ nào? Xem đủ 3 bộ sưu tập theo kích thước thật, số mẫu còn hàng và giá từ — rồi chọn bộ hợp với kệ và ngân sách của bạn.",
    cta: "Xem bộ sưu tập",
    img: scale164Img,
    alt: "Ba mô hình xe đỏ tỉ lệ 1:64 cạnh đồng xu",
    action: "collection",
  },
];

export function BannerCarousel({
  onOpenProducts,
  onOpenCollection,
  onPickScale,
}: {
  onOpenProducts: () => void;
  onOpenCollection: () => void;
  onPickScale: (s: ScaleFilter) => void;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIndex(((i % BANNERS.length) + BANNERS.length) % BANNERS.length);
  const next = () => go(index + 1);

  useEffect(() => {
    const t = setTimeout(() => {
      setIndex((v) => (v + 1) % BANNERS.length);
    }, 10000);
    return () => clearTimeout(t);
  }, [index]);

  const banner = BANNERS[index] ?? BANNERS[0]!;
  const runAction = () => {
    if (banner.action === "products" || banner.action === "sale") onOpenProducts();
    else if (banner.action === "collection") onOpenCollection();
    else onPickScale("1:16");
  };

  return (
    <section
      aria-label="Banner nổi bật của shop"
      aria-roledescription="băng chuyền banner"
      className="bg-[var(--dark)] text-white"
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start != null && end != null) {
          const dx = end - start;
          if (dx <= -40) next();
          else if (dx >= 40) go(index - 1);
        }
      }}
    >
      <div className="relative mx-auto max-w-6xl pb-8">
        <div key={index} className="grid gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-8 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">{banner.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">{banner.title}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">{banner.desc}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runAction}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
              >
                {banner.cta}
              </button>
              <button
                type="button"
                onClick={onOpenCollection}
                className="rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black"
              >
                Xem bộ sưu tập
              </button>
            </div>
            <p className="mt-5 text-xs text-white/50">
              Banner {index + 1}/{BANNERS.length} · Đang hiển thị dữ liệu mẫu do shop tạo sẵn để xem trước giao diện.
            </p>
          </div>
          <button
            type="button"
            onClick={runAction}
            aria-label={`${banner.cta} — banner: ${banner.title}`}
            className="relative block min-h-[240px] w-full text-left"
          >
            <img src={banner.img} alt={banner.alt} className="absolute inset-0 h-full w-full object-cover" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" role="group" aria-label="Chọn banner">
          {BANNERS.map((b, i) => (
            <button
              key={b.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Chọn banner ${i + 1}: ${b.title}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-[var(--accent)]" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

