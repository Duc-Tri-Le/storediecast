import type {
  Analytics,
  AnalyticsGroup,
  AnalyticsUnpaidOrder,
} from "../types";
import { fmtDate, fmtVND, orderCode, STATUS_LABEL } from "../utils/format";
import { Chip } from "./shared";
import { ANALYTICS_CARD } from "./AnalyticsCharts";

export function AnalyticsGroupTable({
  title,
  groups,
}: {
  title: string;
  groups: AnalyticsGroup[];
}) {
  return (
    <section className={`${ANALYTICS_CARD} p-4`} aria-label={title}>
      <h3 className="font-semibold">{title}</h3>
      {groups.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--dim)]">
          Chưa có doanh số từ đơn đã chuyển khoản trong khoảng này.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {groups.map((g) => (
            <li key={g.name}>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-medium">{g.name}</span>
                <span className="flex-1" />
                <span className="font-semibold">{fmtVND(g.revenue)}</span>
                <span className="w-12 text-right text-xs text-[var(--dim)]">
                  {g.share.toLocaleString("vi-VN")}%
                </span>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]"
                role="img"
                aria-label={`${g.name} chiếm ${g.share}% doanh thu sản phẩm`}
              >
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.min(100, Math.max(0, g.share))}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--dim)]">
                {g.qty} sản phẩm · {g.orders} đơn
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

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

export function AnalyticsInventoryAttention({
  inventory,
  onOpenProduct,
}: {
  inventory: Analytics["inventory"];
  onOpenProduct: (id: number) => void;
}) {
  return (
    <section className={`${ANALYTICS_CARD} p-4`} aria-label="Tồn kho cần chú ý">
      <h2 className="font-semibold">Tồn kho cần chú ý</h2>
      <p className="mt-0.5 text-sm text-[var(--dim)]">
        Tồn kho hiện tại, không phụ thuộc khoảng thời gian đã chọn:{" "}
        {inventory.outOfStockCount} biến thể hết hàng ·{" "}
        {inventory.lowStockCount} biến thể sắp hết (còn 1–3 chiếc).
      </p>
      {inventory.items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--dim)]">
          Không có biến thể nào sắp hết hoặc hết hàng.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {inventory.items.map((v) => (
            <li key={v.variantId} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <div className="min-w-0 flex-1 basis-44">
                <button
                  type="button"
                  onClick={() => onOpenProduct(v.productId)}
                  aria-label={`Mở chi tiết sản phẩm ${v.productName}`}
                  className="text-left font-semibold text-[var(--accent)] hover:underline"
                >
                  {v.productName}
                </button>
                <p className="text-xs text-[var(--dim)]">
                  {v.colorName} · Tỉ lệ {v.scale}
                </p>
              </div>
              {v.stock <= 0 ? (
                <Chip tone="red">Hết hàng</Chip>
              ) : (
                <Chip tone="amber">Sắp hết · còn {v.stock}</Chip>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AnalyticsCustomersSection({
  customers,
  kpis,
}: {
  customers: Analytics["customers"];
  kpis: Analytics["kpis"];
}) {
  return (
    <section className={`${ANALYTICS_CARD} p-4`} aria-label="Khách hàng">
      <h2 className="font-semibold">Khách hàng</h2>
      {!customers.hasEnoughData ? (
        <p className="mt-3 text-sm text-[var(--dim)]">
          Chưa đủ dữ liệu để phân tích khách hàng trong khoảng này: cần
          ít nhất 2 đơn đã chuyển khoản mới biết được có khách mua lại
          hay không. Hiện khoảng này có {kpis.paidOrderCount} đơn đã
          chuyển khoản và {customers.totalCustomers} khách theo số
          điện thoại (chỉ tính đơn đã chuyển khoản).
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-[var(--accent-dark)]">
                {customers.totalCustomers}
              </p>
              <p className="text-xs text-[var(--dim)]">Khách theo số điện thoại</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--accent-dark)]">
                {customers.repeatCustomerCount}
              </p>
              <p className="text-xs text-[var(--dim)]">Khách mua lại (từ 2 đơn đã chuyển khoản)</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--accent-dark)]">
                {customers.singlePurchaseCount}
              </p>
              <p className="text-xs text-[var(--dim)]">Khách mua 1 lần</p>
            </div>
          </div>
          {customers.repeatCustomers.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {customers.repeatCustomers.map((c) => (
                <li key={c.phone} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-[var(--dim)]">{c.phone}</p>
                  </div>
                  <span className="text-[var(--dim)]">{c.orders} đơn</span>
                  <span className="font-semibold">{fmtVND(c.spent)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--dim)]">
              Trong khoảng này chưa có khách nào mua lại.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export function AnalyticsStatusAndDiscounts({ a }: { a: Analytics }) {
  return (
    <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
      <section className={`${ANALYTICS_CARD} p-4`} aria-label="Đơn hàng theo trạng thái">
        <h2 className="font-semibold">Trạng thái đơn</h2>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {a.byStatus.map((s) => (
            <li key={s.status} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <span className="font-medium">{STATUS_LABEL[s.status] ?? s.status}</span>
              <span className="text-[var(--dim)]">{s.count} đơn</span>
              <span className="flex-1" />
              <span className="font-semibold">{fmtVND(s.revenue)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--dim)]">
          Cột tiền ở bảng này là doanh thu đã chuyển khoản theo từng
          trạng thái: chỉ đơn Hoàn thành (Đã thanh toán) mới có tiền;
          đơn Mới và Đã xác nhận đang Chờ chuyển khoản hiện 0₫ ở cột
          tiền dù vẫn được đếm trong số đơn, và đơn Đã hủy cũng là 0₫.
        </p>
      </section>

      <section className={`${ANALYTICS_CARD} p-4`} aria-label="Giảm giá và vận chuyển">
        <h2 className="font-semibold">Giảm giá và vận chuyển</h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-[var(--dim)]">Tạm tính trước giảm</dt>
            <span className="flex-1" />
            <dd className="font-semibold">{fmtVND(a.discounts.subtotalBeforeBulk)}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-[var(--dim)]">Tổng giảm theo số lượng</dt>
            <span className="flex-1" />
            <dd className="font-semibold">
              {a.discounts.bulkDiscount > 0
                ? `−${fmtVND(a.discounts.bulkDiscount)}`
                : fmtVND(0)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-[var(--dim)]">Tổng giảm mã giảm giá</dt>
            <span className="flex-1" />
            <dd className="font-semibold">
              {a.discounts.couponDiscount > 0
                ? `−${fmtVND(a.discounts.couponDiscount)}`
                : fmtVND(0)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-[var(--dim)]">Tổng phí ship đã thu</dt>
            <span className="flex-1" />
            <dd className="font-semibold">{fmtVND(a.discounts.shippingFee)}</dd>
          </div>
          <div className="flex items-baseline gap-2 border-t border-[var(--border)] pt-2.5">
            <dt className="font-medium">Doanh thu sau giảm</dt>
            <span className="flex-1" />
            <dd className="font-bold text-[var(--accent-dark)]">
              {fmtVND(a.discounts.totalRevenue)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-[var(--dim)]">
          Mục này chỉ tính đơn đã chuyển khoản. Doanh thu sau giảm =
          tạm tính trước giảm − giảm theo số lượng − giảm mã + phí
          ship, đúng bằng doanh thu của đơn đã chuyển khoản ở trên.
          Tiền hàng sau cả hai lần giảm (chưa gồm ship) là{" "}
          {fmtVND(a.discounts.subtotalAfterCoupon)}.
        </p>
      </section>
    </div>
  );
}

