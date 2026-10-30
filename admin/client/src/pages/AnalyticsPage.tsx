import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type {
  Analytics,
  AnalyticsProduct,
  AnalyticsRange,
} from "../types";
import { fmtDate, fmtVND } from "../utils/format";
import {
  ANALYTICS_CARD,
  AnalyticsTimeSeriesChart,
} from "../components/AnalyticsCharts";
import {
  AnalyticsCustomersSection,
  AnalyticsGroupTable,
  AnalyticsInventoryAttention,
  AnalyticsStatusAndDiscounts,
  AnalyticsUnpaidOrders,
} from "../components/AnalyticsTables";

export const ANALYTICS_RANGES: Array<[AnalyticsRange, string]> = [
  ["today", "Hôm nay"],
  ["7d", "7 ngày"],
  ["30d", "30 ngày"],
  ["90d", "90 ngày"],
  ["all", "Tất cả"],
];

export function AnalyticsPage({
  onOpenProduct,
  onOpenOrder,
}: {
  onOpenProduct: (id: number) => void;
  onOpenOrder: (id: number) => void;
}) {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [topMode, setTopMode] = useState<"qty" | "revenue">("qty");
  const query = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: () => api.adminAnalytics({ range }),
  });
  const a: Analytics | undefined = query.data;

  const topList = a ? (topMode === "qty" ? a.topByQty : a.topByRevenue) : [];

  const kpi = (label: string, value: string, sub?: string) => (
    <div className={`${ANALYTICS_CARD} p-4`}>
      <p className="text-[28px] leading-8 font-bold tracking-tight text-[var(--accent-dark)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--dim)]">{label}</p>
      {sub && <p className="text-xs text-[var(--dim)]">{sub}</p>}
    </div>
  );

  const productNameCell = (p: AnalyticsProduct) =>
    p.productExists ? (
      <button
        type="button"
        onClick={() => onOpenProduct(p.productId)}
        aria-label={`Mở chi tiết sản phẩm ${p.productName}`}
        className="text-left font-semibold text-[var(--accent)] hover:underline"
      >
        {p.productName}
      </button>
    ) : (
      <span className="font-semibold">{p.productName}</span>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Phân tích</h1>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Doanh số tính từ đơn hàng thật trong database chung với web bán hàng.
      </p>
      <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-dark)]">
        Doanh thu chỉ tính đơn đã chuyển khoản. Đơn đang Chờ chuyển khoản
        (Mới hoặc Đã xác nhận, chưa Hoàn thành) vẫn được đếm trong Số đơn
        hàng và bảng Trạng thái đơn, nhưng tiền của đơn đó không tính vào
        doanh thu — doanh thu từ đơn đó là 0₫ cho tới khi shop xác nhận đã
        nhận chuyển khoản và đơn chuyển sang Hoàn thành (Đã thanh toán),
        sau đó mới tính vào doanh thu.
      </p>

      {/* Bộ lọc thời gian */}
      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Khoảng thời gian phân tích"
      >
        {ANALYTICS_RANGES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            aria-pressed={range === key}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ${
              range === key
                ? "bg-[var(--accent)] font-semibold text-white"
                : "border border-[var(--border)] bg-white hover:bg-[var(--sidebar)]"
            }`}
          >
            {label}
          </button>
        ))}
        {a && (
          <span className="ml-auto self-center text-sm text-[var(--dim)]">
            {a.startAt
              ? `Từ ${fmtDate(a.startAt)} đến ${fmtDate(a.endAt)}`
              : `Tất cả đơn hàng tính đến ${fmtDate(a.endAt)}`}
          </span>
        )}
      </div>

      <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-dark)]">
        Trang này không hiện tỉ lệ chuyển đổi, lượt truy cập và tỉ lệ bỏ giỏ vì
        web bán hàng hiện không thu thập dữ liệu lượt truy cập — không có dữ
        liệu thật để tính các chỉ số đó, nên chúng không được hiển thị thay vì
        hiện số 0 gây hiểu nhầm.
      </p>

      {query.isPending && (
        <p className="mt-6 text-sm text-[var(--dim)]">Đang tải số liệu phân tích…</p>
      )}
      {query.error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được số liệu phân tích từ database chung:{" "}
          {String(query.error.message ?? query.error)}
        </p>
      )}

      {a && (
        <>
          {/* 4 số lớn */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {kpi("Doanh thu", fmtVND(a.kpis.revenue), "Chỉ tính đơn đã chuyển khoản")}
            {kpi("Số đơn hàng", String(a.kpis.orderCount), "Đơn không hủy — gồm cả đơn chờ chuyển khoản")}
            {kpi(
              "Giá trị đơn trung bình",
              fmtVND(a.kpis.averageOrderValue),
              "Doanh thu ÷ số đơn đã chuyển khoản",
            )}
            {kpi("Số sản phẩm đã bán", String(a.kpis.itemsSold), "Tổng số lượng trong đơn đã chuyển khoản")}
          </div>

          {a.kpis.orderCount === 0 && (
            <p className="mt-6 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--dim)]">
              Chưa có đơn hàng nào (không tính đơn đã hủy) trong khoảng thời
              gian này — các bảng doanh số bên dưới sẽ trống cho đến khi có đơn.
            </p>
          )}
          {a.kpis.orderCount > 0 && a.kpis.paidOrderCount === 0 && (
            <p className="mt-6 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--dim)]">
              Khoảng này có {a.kpis.orderCount} đơn chưa hủy nhưng chưa có
              đơn nào đã chuyển khoản — doanh thu đang là 0₫ và các bảng
              doanh số bên dưới sẽ trống cho đến khi có đơn Hoàn thành (Đã
              thanh toán). Các đơn chờ chuyển khoản vẫn hiện trong Số đơn
              hàng và bảng Trạng thái đơn ở dưới.
            </p>
          )}

          {/* Biểu đồ doanh thu và số đơn theo thời gian */}
          <AnalyticsTimeSeriesChart a={a} />

          {/* Bán chạy nhất */}
          <section className={`${ANALYTICS_CARD} mt-6 p-4`} aria-label="Sản phẩm bán chạy nhất">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Bán chạy nhất</h2>
              <span className="flex-1" />
              <div className="flex gap-1" role="group" aria-label="Xếp hạng bán chạy theo">
                <button
                  type="button"
                  onClick={() => setTopMode("qty")}
                  aria-pressed={topMode === "qty"}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    topMode === "qty"
                      ? "bg-[var(--accent)] font-semibold text-white"
                      : "border border-[var(--border)] bg-white hover:bg-[var(--sidebar)]"
                  }`}
                >
                  Theo số lượng
                </button>
                <button
                  type="button"
                  onClick={() => setTopMode("revenue")}
                  aria-pressed={topMode === "revenue"}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    topMode === "revenue"
                      ? "bg-[var(--accent)] font-semibold text-white"
                      : "border border-[var(--border)] bg-white hover:bg-[var(--sidebar)]"
                  }`}
                >
                  Theo doanh thu
                </button>
              </div>
            </div>
            <p className="mt-0.5 text-sm text-[var(--dim)]">
              Chỉ tính trên đơn đã chuyển khoản trong khoảng đã chọn; doanh
              thu ở đây là giá bán của dòng sản phẩm, chưa trừ giảm giá của
              đơn. Đơn chờ chuyển khoản không tính vào mục này.
            </p>
            {topList.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--dim)]">
                Chưa bán được sản phẩm nào từ đơn đã chuyển khoản trong khoảng này.
              </p>
            ) : (
              <ol className="mt-3 divide-y divide-[var(--border)]">
                {topList.map((p, i) => (
                  <li key={p.productId} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-3">
                    <span className="w-6 shrink-0 pt-0.5 text-sm font-bold text-[var(--dim)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 basis-48">
                      {productNameCell(p)}
                      <p className="text-xs text-[var(--dim)]">
                        {[p.brand, p.vehicleType, p.scale ? `Tỉ lệ ${p.scale}` : ""]
                          .filter(Boolean)
                          .join(" · ")}
                        {!p.productExists && " · Sản phẩm đã bị xóa, số liệu lấy từ đơn cũ"}
                      </p>
                      {p.bestVariant && (
                        <p className="text-xs text-[var(--dim)]">
                          Màu bán chạy: {p.bestVariant.colorName} · {p.bestVariant.qty}{" "}
                          chiếc · {fmtVND(p.bestVariant.revenue)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{fmtVND(p.revenue)}</p>
                      <p className="text-xs text-[var(--dim)]">Đã bán {p.qty} chiếc</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Doanh số theo phân loại */}
          <div className="mt-6 grid items-start gap-4 lg:grid-cols-3">
            <AnalyticsGroupTable title="Doanh số theo Tỉ lệ" groups={a.byScale} />
            <AnalyticsGroupTable title="Doanh số theo Loại xe" groups={a.byVehicleType} />
            <AnalyticsGroupTable title="Doanh số theo Hãng xe" groups={a.byBrand} />
          </div>
          <p className="mt-2 text-xs text-[var(--dim)]">
            Ba bảng phân loại chỉ tính đơn đã chuyển khoản. Tỉ trọng tính
            theo doanh thu của từng dòng sản phẩm (đơn giá × số lượng), chưa
            trừ giảm giá của đơn và chưa gồm phí vận chuyển.
          </p>

          {/* Trạng thái đơn & Giảm giá */}
          <AnalyticsStatusAndDiscounts a={a} />

          {/* Đơn chưa thanh toán */}
          <AnalyticsUnpaidOrders
            unpaidOrders={a.unpaidOrders}
            onOpenOrder={onOpenOrder}
          />

          <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
            {/* Tồn kho cần chú ý */}
            <AnalyticsInventoryAttention
              inventory={a.inventory}
              onOpenProduct={onOpenProduct}
            />

            {/* Khách hàng */}
            <AnalyticsCustomersSection
              customers={a.customers}
              kpis={a.kpis}
            />
          </div>
        </>
      )}
    </div>
  );
}

