export function PolicyStrip() {
  return (
    <div className="mt-10 grid gap-3 rounded-2xl bg-[var(--dark)] p-5 text-white md:grid-cols-3">
      <div>
        <p className="font-bold">Giao hàng toàn quốc</p>
        <p className="mt-1 text-sm text-white/70">Giao tới địa chỉ nhận hàng bạn đã đặt, trên toàn quốc.</p>
      </div>
      <div>
        <p className="font-bold">Freeship từ 1.000.000₫</p>
        <p className="mt-1 text-sm text-white/70">Đơn dưới mức này phí ship đồng giá 30.000₫.</p>
      </div>
      <div>
        <p className="font-bold">Đóng gói chống sốc</p>
        <p className="mt-1 text-sm text-white/70">Hộp + đế trưng bày đi kèm các mẫu 1:16.</p>
      </div>
    </div>
  );
}

