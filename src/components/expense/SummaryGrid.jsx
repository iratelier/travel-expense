import { useExchangeRate } from "../../hooks/useExchangeRate";

const SYMBOL = { JPY: "¥", KRW: "₩", USD: "$", EUR: "€", VND: "₫" };
const COLOR = {
  JPY: "text-red-600",
  KRW: "text-blue-700",
  USD: "text-green-700",
  EUR: "text-purple-700",
  VND: "text-orange-600",
};

function fmt(n) {
  return Number(n).toLocaleString("ko-KR");
}

function fmtDate(d) {
  if (!d) return null;
  return d.replace(/-/g, "."); // "2025-11-01" → "2025.11.01"
}

function StatCard({ label, value, sub, valueClass = "" }) {
  return (
    <div className="summary-grid__card">
      <span className="summary-grid__label">{label}</span>
      <p className={`summary-grid__value ${valueClass}`}>
        {value}
        {sub && <span className="summary-grid__value--sub">({sub})</span>}
      </p>
    </div>
  );
}

/**
 * SummaryGrid
 * @param {object[]} entries     - 현재 필터 적용된 항목 목록
 * @param {object|null} trip     - 선택된 여행 객체 { location, startDate, endDate, companions }
 */
export default function SummaryGrid({ entries, trip }) {
  const { toKRW } = useExchangeRate();

  // 통화별 합계
  const totals = {};
  entries.forEach((e) => {
    if (e.amount != null && e.currency) {
      totals[e.currency] = (totals[e.currency] || 0) + e.amount;
    }
  });

  // 금액 내림차순 정렬
  const sortedCurrencies = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  // 여행기간 표시
  const start = fmtDate(trip?.startDate);
  const end = fmtDate(trip?.endDate);
  const period = start && end ? `${start} ~ ${end}` : (start ?? end ?? "—");

  return (
    <>
      <div className="travel-info__summary">
        <div className="summary-grid">
          {/* 여행지 */}
          <StatCard
            label="여행지"
            value={trip?.location ?? "전체"}
            valueClass="text-gray-900"
          />

          {/* 여행기간 */}
          <StatCard
            label="여행기간"
            value={trip ? period : "—"}
            valueClass="text-gray-700"
          />

          {/* 총 지출: 통화별 */}
          {sortedCurrencies.length === 0 ? (
            <StatCard label="총 지출" value="—" />
          ) : (
            sortedCurrencies.map(([currency, total]) => {
              const sym = SYMBOL[currency] ?? currency;
              const krw = currency !== "KRW" ? toKRW(total, currency) : null;
              return (
                <StatCard
                  key={currency}
                  label={`총 지출 (${currency})`}
                  value={`${sym} ${fmt(total)}`}
                  valueClass={COLOR[currency] ?? "text-gray-800"}
                  sub={krw != null ? `${fmt(krw)} 원` : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
