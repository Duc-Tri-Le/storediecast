import { useState } from "react";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Đặt hàng như thế nào?",
    a: "Vào trang Sản phẩm, chọn mẫu mô hình bạn thích rồi bấm “Thêm vào giỏ”. Bấm icon giỏ hàng để sang trang Giỏ hàng, bấm “Tiến hành thanh toán” rồi điền họ tên, số điện thoại và địa chỉ nhận hàng, thanh toán bằng Chuyển khoản rồi bấm Đặt hàng. Shop sẽ gọi lại số điện thoại bạn đã nhập để xác nhận trước khi giao.",
  },
  {
    q: "Phí ship bao nhiêu? Khi nào được freeship?",
    a: "Phí ship đồng giá 30.000₫ cho đơn dưới 1.000.000₫. Đơn từ 1.000.000₫ trở lên được miễn phí ship — mức này tính trên tạm tính sau khi đã trừ giảm theo số lượng và mã giảm giá (nếu có). Tổng tiền hiển thị trong giỏ đã gồm phí ship, bạn kiểm tra trước khi bấm đặt.",
  },
  {
    q: "Mã giảm giá dùng như thế nào?",
    a: "Mã giảm giá không bắt buộc — không có mã thì bạn cứ để trống ô mã và đặt hàng bình thường, không cần bấm “Áp dụng”. Nếu có mã, bạn nhập mã ở ô “Mã giảm giá (không bắt buộc)” rồi bấm “Áp dụng” — ô này có ở khối Tổng cộng trên trang Giỏ hàng, trong hộp thoại Mua ngay và ở bước đặt hàng. Mỗi đơn chỉ dùng được 1 mã, không cộng dồn nhiều mã. Mã được giảm trên tạm tính sau khi đơn đã giảm theo tổng số lượng, rồi mới tính phí ship, và mức freeship cũng xét trên số tiền sau khi trừ mã. Nếu nhập sai mã, web sẽ báo mã không hợp lệ ngay và tổng tiền không thay đổi — bạn chỉ cần xóa mã sai (hoặc để trống) là vẫn đặt được đơn. Muốn bỏ mã đã áp, bấm “Gỡ mã” để quay về tổng chưa giảm, hoặc gỡ rồi nhập mã khác để đổi mã.",
  },
  {
    q: "Thanh toán bằng cách nào?",
    a: "Bạn thanh toán bằng chuyển khoản khi đặt hàng trên web. Shop sẽ liên hệ lại bằng số điện thoại bạn để trong đơn để nhận chuyển khoản rồi mới giao hàng.",
  },
  {
    q: "Tra cứu đơn hàng ở đâu?",
    a: "Vào mục “Tra cứu đơn hàng” trên menu và nhập đúng số điện thoại đã dùng khi đặt. Vì riêng tư, trang chỉ hiện đơn của đúng số điện thoại đó, không hiện đơn của khách khác.",
  },
  {
    q: "Muốn hủy đơn thì làm sao?",
    a: "Bạn tự hủy được khi đơn còn ở trạng thái “Mới”: vào Tra cứu đơn hàng bằng số điện thoại đã đặt và bấm “Hủy đơn của tôi” — số lượng trong kho sẽ được cộng lại. Đơn đã được shop xác nhận trở đi thì không tự hủy được trên web, hãy liên hệ shop bằng số điện thoại đã đặt.",
  },
  {
    q: "Tỉ lệ 1:64, 1:32 và 1:16 khác nhau thế nào?",
    a: "1:64 dài khoảng 7 cm, sealed không mở được chi tiết, hợp bỏ túi và sưu tầm theo bộ. 1:32 dài khoảng 13–14 cm, mở được cửa và capo/cốp tùy mẫu. 1:16 dài khoảng 28–30 cm, chi tiết nhất, mở cửa/capo/cốp và thường kèm hộp cùng đế trưng bày. Chi tiết từng mẫu ghi rõ ở trang chi tiết sản phẩm.",
  },
  {
    q: "Xe có mở được cửa, capo không?",
    a: "Tùy tỉ lệ và từng mẫu: 1:64 là sealed (không mở), 1:32 và 1:16 mở được cửa, capo hoặc cốp — phần “Đặc điểm” trong chi tiết sản phẩm ghi rõ mẫu đó mở được những gì, bạn xem kỹ trước khi đặt.",
  },
  {
    q: "Mẫu tôi thích đang hết hàng thì sao?",
    a: "Mẫu hết hàng sẽ hiện nhãn “HẾT HÀNG” và không thêm vào giỏ được. Bạn có thể chọn một mẫu khác cùng tỉ lệ trên trang Sản phẩm, hoặc quay lại sau khi shop nhập thêm đợt mới.",
  },
  {
    q: "Hàng có kèm hộp và đế trưng bày không?",
    a: "Các mẫu 1:16 đi kèm hộp và đế trưng bày; các tỉ lệ khác tùy mẫu — thông tin này nằm trong phần “Đặc điểm” của từng sản phẩm. Xe được đóng gói chống sốc trước khi gửi.",
  },
];

export function FaqPage({
  onOpenOrders,
  onOpenProducts,
}: {
  onOpenOrders: () => void;
  onOpenProducts: () => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black tracking-tight">Hỏi đáp</h1>
      <p className="mt-1 text-sm leading-relaxed text-[var(--dim)]">
        Những câu khách hay hỏi nhất khi mua mô hình ở shop: đặt hàng, phí ship, thanh toán,
        tra cứu và hủy đơn, cách chọn tỉ lệ. Bấm vào từng câu để xem trả lời.
      </p>
      <div className="mt-6 space-y-2.5">
        {FAQS.map((f, i) => {
          const open = openIdx === i;
          return (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                aria-label={`${open ? "Thu gọn" : "Mở"} câu hỏi: ${f.q}`}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="font-bold">{f.q}</span>
                <span aria-hidden className="shrink-0 text-lg font-black text-[var(--accent)]">{open ? "−" : "+"}</span>
              </button>
              {open && <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--dim)]">{f.a}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={onOpenProducts} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">
          Xem sản phẩm
        </button>
        <button type="button" onClick={onOpenOrders} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold">
          Tra cứu đơn hàng của tôi
        </button>
      </div>
    </main>
  );
}

