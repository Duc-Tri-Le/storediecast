import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Analytics } from "../types";
import { fmtCompactVND, fmtVND } from "../utils/format";

export const ANALYTICS_CARD =
  "rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]";

export function AnalyticsTimeSeriesChart({ a }: { a: Analytics }) {
  return (
    <section
      className={`${ANALYTICS_CARD} mt-6 p-4`}
      aria-label="Biểu đồ doanh thu và số đơn theo thời gian"
    >
      <h2 className="font-semibold">Doanh thu và số đơn theo thời gian</h2>
      <p className="mt-0.5 text-sm text-[var(--dim)]">
        {a.granularity === "hour"
          ? "Theo giờ trong ngày hôm nay"
          : a.granularity === "week"
            ? "Theo tuần"
            : a.granularity === "month"
              ? "Theo tháng"
              : "Theo ngày"}{" "}
        · Doanh thu tính trên đơn đã chuyển khoản · Số đơn tính trên đơn không hủy
      </p>
      {a.series.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--dim)]">
          Chưa có dữ liệu để vẽ biểu đồ trong khoảng này.
        </p>
      ) : (
        <div className="mt-4 h-72 w-full min-w-0 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={a.series}
              margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            >
              <CartesianGrid stroke="#d9e5f1" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#61758c" }}
                minTickGap={24}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                domain={[0, "auto"]}
                tick={{ fontSize: 11, fill: "#61758c" }}
                tickFormatter={(v: number) => fmtCompactVND(Number(v))}
                label={{
                  value: "Doanh thu (VND)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "#61758c" },
                }}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                domain={[0, "auto"]}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#61758c" }}
                label={{
                  value: "Số đơn",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 11, fill: "#61758c" },
                }}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "Doanh thu"
                    ? [fmtVND(Number(value)), "Doanh thu"]
                    : [`${Number(value)} đơn`, "Số đơn"]
                }
              />
              <Legend />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Doanh thu"
                fill="#1f7ae0"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Số đơn"
                stroke="#0b4da2"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

