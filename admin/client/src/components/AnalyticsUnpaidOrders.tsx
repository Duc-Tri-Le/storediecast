import type { Analytics, AnalyticsUnpaidOrder } from "../types";
import { fmtDate, fmtVND, orderCode } from "../utils/format";
import { Chip } from "./shared";
import { ANALYTICS_CARD } from "./AnalyticsCharts";

export function AnalyticsUnpaidOrders({
  unpaidOrders,
  onOpenOrder,
}: {
  unpaidOrders: Analytics["unpaidOrders"];
  onOpenOrder: (id: number) => void;
}) {
  return (
    <section className={`${ANALYTICS_CARD} mt-6 p-4`} aria-label="Đơn chưa thanh toán">
      <h2 className="font-semibold">Đơn chưa thanh toán</h2>
      <p className="mt-0.5 text-sm text-[var(--dim)]">
        Các đơn đang Chờ chuyển khoản trong khoảng đã chọn. Tiền
        của các đơn này không tính vào doanh thu — chỉ khi đơn
        chuyển sang Hoàn thành (Đã thanh toán) thì tiền của đơn đó
        mới tính vào doanh thu và đơn tự biến mất khỏi mục này.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3">
          <p className="text-[28px] leading-8 font-bold tracking-tight text-[var(--accent-dark)]">
            {unpaidOrders.count}
          </p>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Tổng số đơn chưa thanh toán
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3">
          <p className="text-[28px] leading-8 font-bold tracking-tight text-[var(--accent-dark)]">
            {fmtVND(unpaidOrders.totalValue)}
          </p>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Tổng giá trị chưa thanh toán
          </p>
        </div>
      </div>
      {unpaidOrders.orders.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--dim)]">
          Không có đơn nào đang chờ chuyển khoản trong khoảng này.
        </p>
      ) : (
        <>
          <div className="mt-4 hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-xs tracking-wide text-[var(--dim)] uppercase">
                  <th className="px-3 py-2.5 font-medium">Mã đơn</th>
                  <th className="px-3 py-2.5 font-medium">Ngày đặt</th>
                  <th className="px-3 py-2.5 font-medium">Khách hàng</th>
                  <th className="px-3 py-2.5 font-medium">Số điện thoại</th>
                  <th className="px-3 py-2.5 font-medium">Số sản phẩm</th>
                  <th className="px-3 py-2.5 text-right font-medium">Tổng giá trị đơn</th>
                  <th className="px-3 py-2.5 font-medium">Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {unpaidOrders.orders.map((o: AnalyticsUnpaidOrder) => (
                  <tr
                    key={o.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--sidebar)]"
                  >
                    <td className="px-3 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => onOpenOrder(o.id)}
                        aria-label={`Xem chi tiết đơn ${orderCode(o.id)}`}
                        className="font-semibold text-[var(--accent)] hover:underline"
                      >
                        {orderCode(o.id)}
                      </button>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-3 py-3">{o.customerName}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{o.customerPhone}</td>
                    <td className="px-3 py-3">{o.itemCount} sản phẩm</td>
                    <td className="px-3 py-3 text-right font-semibold">
                      {fmtVND(o.total)}
                    </td>
                    <td className="px-3 py-3">
                      <Chip tone="amber">Chờ chuyển khoản</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 lg:hidden">
            {unpaidOrders.orders.map((o: AnalyticsUnpaidOrder) => (
              <div
                key={o.id}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenOrder(o.id)}
                    aria-label={`Xem chi tiết đơn ${orderCode(o.id)}`}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    {orderCode(o.id)}
                  </button>
                  <span className="flex-1" />
                  <Chip tone="amber">Chờ chuyển khoản</Chip>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Ngày đặt:</dt>
                    <dd>{fmtDate(o.createdAt)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Khách hàng:</dt>
                    <dd className="font-medium">{o.customerName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Số điện thoại:</dt>
                    <dd>{o.customerPhone}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Số sản phẩm:</dt>
                    <dd>{o.itemCount} sản phẩm</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Tổng giá trị đơn:</dt>
                    <dd className="font-semibold">{fmtVND(o.total)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--dim)]">Trạng thái thanh toán:</dt>
                    <dd>Chờ chuyển khoản</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

