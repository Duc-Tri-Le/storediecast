import { avatarImg } from "../data/maps";
import { POLICIES, POLICY_ORDER, type PolicyKey } from "../data/policies";
import type { Page } from "../types";

export function Footer({
  onNavigate,
  onOpenContact,
  onOpenPolicy,
  onScrollTop,
}: {
  onNavigate: (p: Page) => void;
  onOpenContact: () => void;
  onOpenPolicy: (k: PolicyKey) => void;
  onScrollTop: () => void;
}) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] pb-safe">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Cột trái: logo + thông tin shop */}
          <div>
            <button
              type="button"
              onClick={() => onNavigate("home")}
              aria-label="XE ĐỎ Model Shop — bấm để về trang chủ"
              className="rounded-full py-1 pr-2"
            >
              <img
                src={avatarImg}
                alt="XE ĐỎ · Model Shop"
                className="h-14 w-14 rounded-full object-cover ring-1 ring-[var(--border)]"
              />
            </button>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--dim)]">
              Mô hình ô tô, xe máy và xe bán tải đủ màu, tỉ lệ 1:64, 1:32 và 1:16 — để trưng,
              để chơi và để tặng. Giao hàng toàn quốc, freeship đơn từ 1.000.000₫.
            </p>
            <p className="mt-4 rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--dim)]">
              Thông tin liên hệ bên dưới đang là <strong className="text-[var(--text)]">thông tin mẫu</strong> —
              shop cần thay bằng email, địa chỉ và số điện thoại thật trước khi bán thật.
            </p>
            <address className="mt-4 space-y-2 text-sm leading-relaxed not-italic">
              <p>
                <strong>Email:</strong>{" "}
                <span className="text-[var(--dim)]">hotro@xedo.vn (mẫu — cần thay)</span>
              </p>
              <p>
                <strong>Hotline / Zalo:</strong>{" "}
                <span className="text-[var(--dim)]">0900 000 000 (mẫu — cần thay)</span>
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                <span className="text-[var(--dim)]">Việt Nam (địa chỉ mẫu — cần thay bằng địa chỉ thật của shop)</span>
              </p>
              <p>
                <strong>Địa chỉ nhận đổi trả:</strong>{" "}
                <span className="text-[var(--dim)]">Cùng địa chỉ shop ở trên (mẫu — cần thay)</span>
              </p>
              <p>
                <strong>Ngày làm việc:</strong>{" "}
                <span className="text-[var(--dim)]">Thứ 2 – Thứ 7 | 8:30 – 20:30 (giờ Việt Nam)</span>
              </p>
            </address>
          </div>

          {/* Cột giữa: HỖ TRỢ */}
          <nav aria-label="Hỗ trợ khách hàng" className="text-sm">
            <p className="text-[15px] font-black uppercase tracking-wide">Hỗ trợ</p>
            <ul className="mt-4 space-y-3.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("about")}
                  className="text-[var(--dim)] underline-offset-2 hover:text-[var(--text)] hover:underline"
                >
                  Giới thiệu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  aria-label="Liên hệ với shop — mở thông tin liên hệ"
                  className="font-semibold text-[var(--text)] underline-offset-2 hover:underline"
                >
                  Liên hệ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("orders")}
                  className="text-[var(--dim)] underline-offset-2 hover:text-[var(--text)] hover:underline"
                >
                  Tra cứu đơn hàng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("faq")}
                  className="text-[var(--dim)] underline-offset-2 hover:text-[var(--text)] hover:underline"
                >
                  Hỏi đáp
                </button>
              </li>
            </ul>
          </nav>

          {/* Cột phải: CHÍNH SÁCH — mỗi mục mở được nội dung */}
          <nav aria-label="Chính sách của shop" className="text-sm">
            <p className="text-[15px] font-black uppercase tracking-wide">Chính sách</p>
            <ul className="mt-4 space-y-3.5">
              {POLICY_ORDER.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => onOpenPolicy(k)}
                    aria-label={`${POLICIES[k].title} — mở nội dung`}
                    className="text-left text-[var(--dim)] underline-offset-2 hover:text-[var(--text)] hover:underline"
                  >
                    {POLICIES[k].title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Dòng cuối: ngôn ngữ/tiền tệ Việt Nam, bản quyền, thanh toán */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-5 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">
            Tiếng Việt (VI) <span aria-hidden className="text-[var(--dim)]">|</span> VND (₫)
          </p>
          <p className="text-[var(--dim)]">
            © 2026 XE ĐỎ · Model Shop. Mọi quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--dim)]">Thanh toán:</span>
            {["Chuyển khoản"].map((m) => (
              <span
                key={m}
                className="rounded-md border border-[var(--border)] bg-[var(--surface2)] px-2 py-1 text-[11px] font-bold"
              >
                {m}
              </span>
            ))}
            <button
              type="button"
              onClick={onScrollTop}
              aria-label="Về đầu trang"
              className="ml-1 grid h-11 w-11 place-items-center rounded-full bg-[var(--accent)] text-white"
            >
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

