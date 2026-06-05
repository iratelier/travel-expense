import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import Header from "../components/layout/Header";
import TravelModal from "../components/travel/TravelModal";
import Toast from "../components/common/Toast";
import { useTripCrud } from "../hooks/useTripCrud";

const SYMBOL = { JPY: "¥", KRW: "₩", USD: "$", EUR: "€", VND: "₫" };

function fmt(n) {
  return Number(n).toLocaleString("ko-KR");
}
function fmtDate(d) {
  return d ? d.replace(/-/g, ".") : null;
}

function mapTrip(row) {
  return {
    id: row.id,
    location: row.location,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    companions: row.companions ?? "",
  };
}

export default function MainPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const [{ data: tripData }, { data: expData }] = await Promise.all([
      supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase.from("expenses").select("id, trip_id, currency, amount"),
    ]);
    if (tripData) setTrips(tripData.map(mapTrip));
    if (expData) setEntries(expData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const {
    showModal,
    editingTripId,
    openAdd,
    closeModal,
    handleSaveTrip,
    handleDeleteTrip: handleDeleteTripBase,
  } = useTripCrud({
    showToast,
    onInsert: fetchAll,
    onUpdate: fetchAll,
    onDelete: fetchAll,
  });

  function handleDeleteTrip(tripId) {
    return handleDeleteTripBase(tripId, trips);
  }

  // 여행별 지출 집계
  function getTripStats(tripId) {
    const exps = entries.filter((e) => e.trip_id === tripId);
    const totals = {};
    exps.forEach((e) => {
      if (e.amount != null && e.currency) {
        totals[e.currency] = (totals[e.currency] || 0) + e.amount;
      }
    });
    return { count: exps.length, totals };
  }

  // 여행 선택 → 해당 페이지로 이동
  function handleSelectTrip(tripId, page = "expense") {
    if (tripId) localStorage.setItem("selectedTripId", tripId);
    navigate(page === "expense" ? "/expense" : "/info");
  }

  // 여행 기간 (박 수)
  function nights(start, end) {
    if (!start || !end) return null;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : null;
  }

  return (
    <div className="wrap main-page">
      <Header />

      <main className="main">
        <div className="page-top">
          <div className="page-top__title-nav">
            <span className="page-top__title">여행</span>
          </div>
          <div className="page-top__actions">
            <button
              className="btn btn--primary page-top__btn"
              onClick={openAdd}
            >
              <i className="ni-add" /> 여행 추가
            </button>
          </div>
        </div>

        <div className="page-container">
          <section className="trip-summary-section">
            {loading && <p className="trip-summary__empty">불러오는 중...</p>}

            {!loading && trips.length === 0 && (
              <p className="trip-summary__empty">등록된 여행이 없습니다</p>
            )}

            {!loading && trips.length > 0 && (
              <div className="trip-card-grid">
                {trips.map((trip) => {
                  const { count, totals } = getTripStats(trip.id);
                  const start = fmtDate(trip.startDate);
                  const end = fmtDate(trip.endDate);
                  const n = nights(trip.startDate, trip.endDate);
                  const sortedCurrencies = Object.entries(totals).sort(
                    (a, b) => b[1] - a[1],
                  );

                  return (
                    <div key={trip.id} className="trip-card">
                      {/* 상단 */}
                      <div className="trip-card__top">
                        <span className="trip-card__location">
                          {trip.location}
                        </span>
                        {n != null && (
                          <span className="trip-card__nights">
                            {n}박 {n + 1}일
                          </span>
                        )}
                      </div>

                      {/* 기간 */}
                      {(start || end) && (
                        <p className="trip-card__period">
                          {start && end ? `${start} ~ ${end}` : (start ?? end)}
                        </p>
                      )}

                      {/* 동행 */}
                      {trip.companions && (
                        <p className="trip-card__companions">
                          <i className="ni-users" /> {trip.companions}
                        </p>
                      )}

                      {/* 지출 요약 */}
                      <div className="trip-card__expense">
                        {sortedCurrencies.length > 0 ? (
                          sortedCurrencies.map(([cur, total]) => (
                            <span key={cur} className="trip-card__amount">
                              {SYMBOL[cur] ?? cur} {fmt(total)}
                            </span>
                          ))
                        ) : (
                          <span className="trip-card__amount --empty">
                            지출 없음
                          </span>
                        )}
                        <span className="trip-card__count">{count}건</span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="trip-card__actions">
                        <button
                          className="btn btn--sm"
                          onClick={() => handleSelectTrip(trip.id, "info")}
                        >
                          나의 여행
                        </button>
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => handleSelectTrip(trip.id, "expense")}
                        >
                          지출 내역
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Toast message={toast} />
      {showModal && (
        <TravelModal
          trips={trips}
          initialTripId={editingTripId}
          onSave={handleSaveTrip}
          onDelete={handleDeleteTrip}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
