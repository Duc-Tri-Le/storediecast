import type { ScaleFilter, ShopCollection } from "../types";
import heroImg from "../assets/hero.jpg";

export function AboutPage({
  scaleOptions = ["1:64", "1:32", "1:16"],
  collections = [],
  onOpenProducts,
  onOpenCollection,
  onPickScale,
}: {
  scaleOptions?: string[];
  collections?: ShopCollection[];
  onOpenProducts: () => void;
  onOpenCollection: () => void;
  onPickScale: (s: ScaleFilter) => void;
}) {
  const displayScales = scaleOptions && scaleOptions.length > 0 ? scaleOptions : ["1:64", "1:32", "1:16"];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black tracking-tight">Giới thiệu</h1>
      <p className="mt-3 text-[15px] leading-relaxed">
        XE ĐỎ · Model Shop bán <strong>mô hình ô tô, xe máy, xe bán tải và máy bay</strong> ở các
        tỉ lệ chuẩn như {displayScales.join(", ")}. Đủ loại xe, đủ màu, chơi đủ cỡ — từ chiếc nhỏ gọn để bàn
        làm việc, vừa tay mở được cửa, tới cỡ lớn làm tâm điểm kệ trưng hoặc quà tặng cao cấp.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-3xl">
        <img src={heroImg} alt="Mô hình siêu xe đỏ tỉ lệ 1:16 trên bệ trưng bày showroom" className="aspect-[16/9] w-full object-cover" />
      </div>

      <h2 className="mt-8 text-xl font-black tracking-tight">Các tỉ lệ mô hình tại XE ĐỎ</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
              <th scope="col" className="px-4 py-3 font-bold">Tỉ lệ</th>
              <th scope="col" className="px-4 py-3 font-bold">Dài khoảng</th>
              <th scope="col" className="px-4 py-3 font-bold">Đặc điểm</th>
              <th scope="col" className="px-4 py-3 font-bold">Giá tham khảo</th>
            </tr>
          </thead>
          <tbody>
            {displayScales.map((s) => {
              const matchedCol = collections.find((c) => c.title.includes(s));
              const sizeDesc = s === "1:64" ? "~7 cm" : s === "1:32" ? "~13–14 cm" : s === "1:16" ? "~28–30 cm" : "~20 cm";
              const featureDesc = matchedCol?.description || (s === "1:64" ? "Sealed, bỏ túi" : s === "1:32" ? "Mở cửa, vừa tay" : s === "1:16" ? "Full mở, kèm hộp + đế" : "Mô hình tinh xảo");
              const priceDesc = s === "1:64" ? "109–159k" : s === "1:32" ? "349–449k" : s === "1:16" ? "1,69–2,19tr" : "Theo niêm yết";
              return (
                <tr key={s} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="px-4 py-3 font-black">{s}</th>
                  <td className="px-4 py-3">{sizeDesc}</td>
                  <td className="px-4 py-3">{featureDesc}</td>
                  <td className="px-4 py-3 tabular-nums">{priceDesc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Xem sản phẩm theo tỉ lệ">
        {displayScales.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPickScale(s as ScaleFilter)}
            aria-label={`Xem sản phẩm tỉ lệ ${s}`}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold cursor-pointer transition hover:border-[var(--accent)]"
          >
            Mua tỉ lệ {s} →
          </button>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-black tracking-tight">Mua hàng ở shop như thế nào?</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
        <li>Chọn xe ở trang Sản phẩm hoặc theo bộ ở trang Bộ sưu tập, thêm vào giỏ.</li>
        <li>Điền họ tên, số điện thoại, địa chỉ và thanh toán bằng Chuyển khoản.</li>
        <li>Shop gọi lại số điện thoại trong đơn để xác nhận trước khi giao.</li>
        <li>Nhận xe và kiểm tra khi hàng tới. Theo dõi đơn ở mục Tra cứu đơn hàng bằng đúng số điện thoại đã đặt.</li>
      </ol>

      <h2 className="mt-8 text-xl font-black tracking-tight">Chính sách tóm tắt</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
        <li>Thanh toán bằng chuyển khoản.</li>
        <li>Freeship đơn từ 1.000.000₫; dưới mức này phí ship đồng giá 30.000₫.</li>
        <li>Đóng gói chống sốc; mẫu 1:16 kèm hộp và đế trưng bày.</li>
        <li>Tự hủy được đơn còn ở trạng thái “Mới” tại trang Tra cứu đơn hàng, kho sẽ cộng lại ngay.</li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={onOpenProducts} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">
          Bắt đầu mua sắm
        </button>
        <button type="button" onClick={onOpenCollection} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold">
          Xem bộ sưu tập
        </button>
      </div>
    </main>
  );
}

