export type PolicyKey = "privacy" | "terms" | "shipping" | "returns" | "refund";

export const POLICIES: Record<PolicyKey, { title: string; intro: string; points: string[] }> = {
  privacy: {
    title: "Chính sách bảo mật",
    intro:
      "XE ĐỎ · Model Shop chỉ thu thập thông tin cần thiết để xử lý đơn hàng mô hình xe và hỗ trợ khách sau khi mua.",
    points: [
      "Thông tin shop thu thập khi bạn đặt hàng: họ tên, số điện thoại và địa chỉ nhận hàng. Shop không thu thập thông tin thẻ ngân hàng trên trang web này.",
      "Thông tin được dùng để: xác nhận đơn qua điện thoại, giao hàng qua đơn vị vận chuyển, và tra cứu hoặc hủy đơn khi bạn yêu cầu.",
      "Trang Tra cứu đơn hàng chỉ hiển thị đơn của đúng số điện thoại đã dùng khi đặt, để tránh lộ đơn của khách khác.",
      "Shop không bán và không chia sẻ thông tin cá nhân của bạn cho bên thứ ba ngoài đơn vị vận chuyển phục vụ chính đơn hàng đó.",
      "Muốn xem lại, sửa hoặc xóa thông tin của mình, bạn liên hệ shop qua mục Liên hệ ở chân trang và cung cấp số điện thoại đã đặt hàng để shop đối chiếu.",
    ],
  },
  terms: {
    title: "Điều khoản dịch vụ",
    intro:
      "Khi đặt hàng tại XE ĐỎ · Model Shop, bạn đồng ý với các điều khoản dưới đây. Giá trên toàn trang hiển thị bằng đồng Việt Nam (VND).",
    points: [
      "Giá niêm yết là giá của từng mẫu mô hình; giá khuyến mãi (nếu có) được hiển thị ngay trên thẻ sản phẩm và áp dụng khi bạn đặt hàng.",
      "Sau khi bạn gửi đơn, shop sẽ gọi lại số điện thoại trong đơn để xác nhận mẫu xe, số lượng và địa chỉ trước khi giao. Đơn chỉ được giao sau khi xác nhận thành công.",
      "Tồn kho hiển thị trên web tự động trừ khi đơn được tạo và cộng lại khi đơn ở trạng thái “Mới” bị hủy.",
      "Thanh toán bằng chuyển khoản khi đặt hàng trên web.",
      "Thông tin sản phẩm như tỉ lệ, màu xe và chi tiết mở cửa/capo được ghi ở trang chi tiết của từng mẫu; bạn nên xem kỹ trước khi đặt.",
    ],
  },
  shipping: {
    title: "Chính sách vận chuyển",
    intro: "Shop giao hàng trên toàn quốc cho tất cả các mẫu 1:64, 1:32 và 1:16.",
    points: [
      "Phí vận chuyển đồng giá 30.000₫ cho đơn dưới 1.000.000₫. Đơn từ 1.000.000₫ trở lên được miễn phí vận chuyển — mức freeship tính trên tạm tính sau khi trừ giảm theo số lượng và mã giảm giá (nếu có).",
      "Tổng tiền trong giỏ hàng đã gồm phí vận chuyển, bạn kiểm tra được trước khi bấm đặt hàng.",
      "Mọi mẫu xe đều được đóng gói chống sốc trước khi gửi; riêng các mẫu 1:16 đi kèm hộp và đế trưng bày.",
      "Thời gian giao cụ thể phụ thuộc vào khu vực nhận hàng và đơn vị vận chuyển — shop sẽ thông báo khi gọi điện xác nhận đơn với bạn.",
      "Khi nhận hàng, bạn kiểm tra bên ngoài kiện hàng và tình trạng xe; nếu thấy hư hỏng do vận chuyển, liên hệ shop ngay để được hỗ trợ theo Chính sách đổi trả.",
    ],
  },
  returns: {
    title: "Chính sách đổi trả",
    intro:
      "Shop hỗ trợ đổi hoặc trả khi mô hình giao tới không đúng cam kết. Bạn liên hệ shop càng sớm càng tốt sau khi nhận hàng và giữ lại hộp, phụ kiện đi kèm.",
    points: [
      "Các trường hợp được đổi/trả: giao sai mẫu hoặc sai tỉ lệ so với đơn đã xác nhận; xe bị lỗi của nhà sản xuất; xe bị hư hỏng do quá trình vận chuyển.",
      "Khi mở hộp, bạn nên quay lại video để shop đối chiếu nhanh nếu xe có vấn đề.",
      "Nếu còn mẫu thay thế, shop đổi đúng mẫu bạn đã đặt; nếu mẫu đó đã hết hàng, bạn được chọn mẫu khác tương đương hoặc áp dụng Chính sách hoàn tiền.",
      "Shop không nhận đổi/trả với hư hỏng do người dùng làm rơi, vỡ hoặc tự ý sửa chữa sau khi nhận hàng.",
      "Để yêu cầu đổi/trả, liên hệ shop qua mục Liên hệ ở chân trang kèm số điện thoại đã đặt hàng và mã trạng thái đơn trong trang Tra cứu đơn hàng.",
    ],
  },
  refund: {
    title: "Chính sách hoàn tiền",
    intro:
      "Chính sách này áp dụng khi bạn đã thanh toán cho đơn và thuộc một trong các trường hợp hoàn tiền dưới đây.",
    points: [
      "Hoàn tiền áp dụng khi: shop không còn mẫu đã xác nhận để giao hoặc để đổi; hoặc trường hợp đổi/trả theo Chính sách đổi trả mà bạn không chọn mẫu thay thế.",
      "Nếu bạn đã thanh toán qua chuyển khoản hoặc ví điện tử, tiền được hoàn qua đúng phương thức bạn đã thanh toán.",
      "Thời gian tiền về tài khoản phụ thuộc vào ngân hàng hoặc ví điện tử của bạn; shop sẽ thông báo cụ thể khi xác nhận yêu cầu hoàn tiền.",
      "Phí vận chuyển của đơn đã giao thành công không được hoàn, trừ trường hợp lỗi thuộc về shop như giao sai mẫu hoặc xe hư hỏng do vận chuyển.",
      "Để yêu cầu hoàn tiền, liên hệ shop qua mục Liên hệ ở chân trang kèm số điện thoại đã đặt hàng để shop kiểm tra trạng thái đơn.",
    ],
  },
};

export const POLICY_ORDER: PolicyKey[] = ["privacy", "terms", "shipping", "returns", "refund"];

