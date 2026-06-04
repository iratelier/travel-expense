import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../utils/supabase";
import Header from "../components/layout/Header";
import Toast from "../components/common/Toast";
import NumInput from "../components/common/NumInput";
import DateInput from "../components/common/DateInput";

// ── UID 헬퍼 ─────────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── 빈 항목 팩토리 ────────────────────────────────────────────────────────────
function emptyFlight() {
  return {
    _id: uid(),
    bookingDate: "",
    bookingNo: "",
    bookingAgency: "",
    depFlightNo: "",
    depAirport: "",
    depDate: "",
    depTime: "",
    arrFlightNo: "",
    arrAirport: "",
    arrDate: "",
    arrTime: "",
    adultFare: "",
    adultCount: "",
    childFare: "",
    childCount: "",
    memo: "",
  };
}
function emptyHotel() {
  return {
    _id: uid(),
    bookingDate: "",
    bookingNo: "",
    bookingAgency: "",
    name: "",
    phone: "",
    address: "",
    cost: "",
    nights: "",
    roomType: "",
    checkInDate: "",
    checkInTime: "",
    checkOutDate: "",
    checkOutTime: "",
    memo: "",
  };
}
function emptyParking() {
  return {
    _id: uid(),
    bookingDate: "",
    bookingNo: "",
    bookingAgency: "",
    name: "",
    phone: "",
    address: "",
    scheduledUse: "",
    scheduledReturn: "",
    product: "",
    cost: "",
    insuranceChecked: false,
    memo: "",
  };
}
function emptyActivity() {
  return {
    _id: uid(),
    bookingDate: "",
    bookingNo: "",
    name: "",
    address: "",
    phone: "",
    programs: [],
    cost: "",
    notes: "",
  };
}

const EMPTY_INFO = {
  flights: [],
  hotels: [],
  parkings: [],
  activities: [],
};

function parseInfo(data) {
  return {
    flights:    Array.isArray(data?.flights)    ? data.flights    : [],
    hotels:     Array.isArray(data?.hotels)     ? data.hotels     : [],
    parkings:   Array.isArray(data?.parkings)   ? data.parkings   : [],
    activities: Array.isArray(data?.activities) ? data.activities : [],
  };
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

// ── 공통 UI 컴포넌트 ──────────────────────────────────────────────────────────
function Field({ label, children, span = 1 }) {
  return (
    <div className="info-field" style={{ gridColumn: `span ${span}` }}>
      <label className="form--label form--label--optional">{label}</label>
      {children}
    </div>
  );
}

function InfoCard({ title, action, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`info-card${open ? " --open" : ""}`}>
      <div className="info-card__header" onClick={() => setOpen((p) => !p)}>
        <span className="info-card__title">{title}</span>
        <i
          className={`info-card__chevron ni-chevron-${open ? "up" : "down"}`}
        />
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
      {open && <div className="info-card__content">{children}</div>}
    </div>
  );
}

function SubGroup({ label, children, cols }) {
  return (
    <div className="info-sub-group">
      <span className="info-sub-group__label">{label}</span>
      <div
        className="info-grid"
        style={
          cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

function ItemDivider({ index, onRemove }) {
  return (
    <div className="info-card__item-header">
      <span className="info-card__item-no">#{index + 1}</span>
      <button
        className="btn btn--delete btn--sm"
        style={{ marginLeft: "auto" }}
        onClick={onRemove}
      >
        <i className="ni-delete" /> 삭제
      </button>
    </div>
  );
}

// ── 메인 페이지 컴포넌트 ──────────────────────────────────────────────────────
export default function TravelInfoPage({ currentPage, onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(
    () => localStorage.getItem("selectedTripId") ?? "",
  );
  const [info, setInfo] = useState(structuredClone(EMPTY_INFO));
  const savedInfo = useRef(structuredClone(EMPTY_INFO));
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const [programInputs, setProgramInputs] = useState({});

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  // ── 데이터 로드 ──────────────────────────────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setTrips(data.map(mapTrip));
  }, []);

  const fetchInfo = useCallback(async (tripId) => {
    const empty = structuredClone(EMPTY_INFO);
    if (!tripId) { setInfo(empty); savedInfo.current = empty; return; }
    setLoading(true);
    if (!supabase) {
      setInfo(empty); savedInfo.current = empty;
      setLoading(false); return;
    }
    const { data } = await supabase
      .from("trip_infos")
      .select("flights, hotels, parkings, activities")
      .eq("trip_id", tripId)
      .maybeSingle();
    const loaded = parseInfo(data);
    setInfo(loaded);
    savedInfo.current = structuredClone(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchInfo(selectedTripId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrips, fetchInfo]);

  // ── 여행 선택 ────────────────────────────────────────────────────────────────
  function handleSelectTrip(id) {
    setSelectedTripId(id);
    id ? localStorage.setItem("selectedTripId", id) : localStorage.removeItem("selectedTripId");
    fetchInfo(id);
    setIsDirty(false);
  }

  // ── 저장 / 취소 ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!selectedTripId) return;
    if (!supabase) { showToast("Supabase 연결 없음"); return; }
    const { error } = await supabase
      .from("trip_infos")
      .upsert(
        { trip_id: selectedTripId, flights: info.flights, hotels: info.hotels,
          parkings: info.parkings, activities: info.activities },
        { onConflict: "trip_id" }
      );
    if (error) { showToast("저장 실패 ✗"); return; }
    savedInfo.current = structuredClone(info);
    setIsDirty(false);
    showToast("저장됐습니다 ✓");
  }

  function handleCancel() {
    setInfo(structuredClone(savedInfo.current));
    setIsDirty(false);
  }

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  // ── 여행 정보 총 지출 계산 ────────────────────────────────────────────────────
  function calcInfoTotal() {
    const flightSum = info.flights.reduce((s, f) => s + flightTotal(f), 0);
    const hotelSum = info.hotels.reduce((s, h) => s + (Number(h.cost) || 0), 0);
    const parkSum = info.parkings.reduce(
      (s, p) => s + (Number(p.cost) || 0),
      0,
    );
    const actSum = info.activities.reduce(
      (s, a) => s + (Number(a.cost) || 0),
      0,
    );
    return {
      flightSum,
      hotelSum,
      parkSum,
      actSum,
      total: flightSum + hotelSum + parkSum + actSum,
    };
  }

  // ── 배열 섹션 CRUD ────────────────────────────────────────────────────────────
  function addItem(section, factory) {
    setInfo((p) => ({ ...p, [section]: [...p[section], factory()] }));
    setIsDirty(true);
  }
  function removeItem(section, idx) {
    setInfo((p) => ({
      ...p,
      [section]: p[section].filter((_, i) => i !== idx),
    }));
    setIsDirty(true);
  }
  function setItem(section, idx, key, val) {
    setInfo((p) => {
      const arr = [...p[section]];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...p, [section]: arr };
    });
    setIsDirty(true);
  }
  // onChange 헬퍼 (e.target.value)
  function si(section, idx) {
    return (key) => (e) => setItem(section, idx, key, e.target.value);
  }

  // ── 운임 합계 ────────────────────────────────────────────────────────────────
  function flightTotal(f) {
    const adult = (Number(f.adultFare) || 0) * (Number(f.adultCount) || 0);
    const child = (Number(f.childFare) || 0) * (Number(f.childCount) || 0);
    return adult + child;
  }

  // ── 체험 프로그램 ────────────────────────────────────────────────────────────
  function addProgram(idx, val) {
    const v = val.trim();
    if (!v) return;
    const progs = info.activities[idx]?.programs ?? [];
    if (progs.includes(v)) {
      setProgramInputs((p) => ({ ...p, [idx]: "" }));
      return;
    }
    setItem("activities", idx, "programs", [...progs, v]);
    setProgramInputs((p) => ({ ...p, [idx]: "" }));
  }
  function removeProgram(idx, prog) {
    setItem(
      "activities",
      idx,
      "programs",
      (info.activities[idx]?.programs ?? []).filter((p) => p !== prog),
    );
  }

  // ── 렌더 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="wrap info-page">
      <Header currentPage={currentPage} onNavigate={onNavigate} />

      <main className="main">
        <div className="page-top">
          <div className="page-top__title-nav">
            <span className="page-top__title">여행 정보</span>
          </div>
          {isDirty && (
            <div className="page-top__actions">
              <button
                className="btn btn--primary page-top__btn"
                onClick={handleSave}
              >
                저장
              </button>
              <button className="btn page-top__btn" onClick={handleCancel}>
                취소
              </button>
            </div>
          )}
        </div>

        <div className="page-container">
          {/* 여행 선택 + 요약 */}
          <section className="travel-info">
            <article className="travel-info__section">
              <div className="travel-info__header">
                <select
                  className="form--select travel-info__trip-select"
                  value={selectedTripId}
                  onChange={(e) => handleSelectTrip(e.target.value)}
                >
                  <option value="">여행 선택</option>
                  {trips.map((t) => {
                    const ym = t.startDate
                      ? t.startDate.slice(0, 7).replace("-", ".")
                      : "";
                    return (
                      <option key={t.id} value={t.id}>
                        {t.location}
                        {ym ? ` (${ym})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectedTrip &&
                (() => {
                  const { flightSum, hotelSum, parkSum, actSum, total } =
                    calcInfoTotal();
                  const fmt = (n) => n.toLocaleString("ko-KR");
                  const fmtDate = (d) => (d ? d.replace(/-/g, ".") : null);
                  const start = fmtDate(selectedTrip.startDate);
                  const end = fmtDate(selectedTrip.endDate);
                  const rows = [
                    { label: "항공", val: flightSum },
                    { label: "호텔", val: hotelSum },
                    { label: "주차", val: parkSum },
                    { label: "체험", val: actSum },
                  ].filter((r) => r.val > 0);
                  return (
                    <div className="info-summary">
                      <div className="info-summary__meta">
                        <span className="info-summary__location">
                          {selectedTrip.location}
                        </span>
                        {(start || end) && (
                          <span className="info-summary__period">
                            {start && end
                              ? `${start} ~ ${end}`
                              : (start ?? end)}
                          </span>
                        )}
                      </div>
                      {total > 0 && (
                        <div className="info-summary__costs">
                          {rows.map((r) => (
                            <span
                              key={r.label}
                              className="info-summary__cost-item"
                            >
                              <span className="info-summary__cost-label">
                                {r.label}
                              </span>
                              <span className="info-summary__cost-val">
                                {fmt(r.val)}
                              </span>
                            </span>
                          ))}
                          <span className="info-summary__total">
                            <span className="info-summary__cost-label">
                              총 지출
                            </span>
                            <span className="info-summary__cost-val --total">
                              {fmt(total)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </article>
          </section>

          {loading && (
            <p className="trip-summary__empty">불러오는 중...</p>
          )}

          <section className="info-section">
            {/* ── 항공 정보 ── */}
            <InfoCard
              title="항공 정보"
              action={
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => addItem("flights", emptyFlight)}
                >
                  <i className="ni-add" /> 추가
                </button>
              }
            >
              {info.flights.length === 0 && (
                <div className="info-card__empty">
                  등록된 항공 정보가 없습니다
                </div>
              )}
              {info.flights.map((f, idx) => {
                const total = flightTotal(f);
                return (
                  <div key={f._id} className="info-card__item">
                    {idx > 0 && <div className="info-card__divider" />}
                    <div className="info-card__body">
                      <ItemDivider
                        index={idx}
                        onRemove={() => removeItem("flights", idx)}
                      />
                      <div className="info-grid">
                        <Field label="예약일">
                          <DateInput
                            className="form--field"
                            value={f.bookingDate}
                            onChange={(v) =>
                              setItem("flights", idx, "bookingDate", v)
                            }
                          />
                        </Field>
                        <Field label="예약번호">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="예약번호"
                            value={f.bookingNo}
                            onChange={si("flights", idx)("bookingNo")}
                          />
                        </Field>
                        <Field label="예약업체">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="예: 하나투어"
                            value={f.bookingAgency}
                            onChange={si("flights", idx)("bookingAgency")}
                          />
                        </Field>
                      </div>

                      <SubGroup label="출발">
                        <Field label="항공편명">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="인천 ( INC)"
                            value={f.depFlightNo}
                            onChange={si("flights", idx)("depFlightNo")}
                          />
                        </Field>
                        <Field label="공항">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="예: ICN"
                            value={f.depAirport}
                            onChange={si("flights", idx)("depAirport")}
                          />
                        </Field>
                        <Field label="출발일">
                          <DateInput
                            className="form--field"
                            value={f.depDate}
                            onChange={(v) =>
                              setItem("flights", idx, "depDate", v)
                            }
                          />
                        </Field>
                        <Field label="출발시간">
                          <input
                            type="time"
                            className="form--field"
                            value={f.depTime}
                            onChange={si("flights", idx)("depTime")}
                          />
                        </Field>
                      </SubGroup>

                      <SubGroup label="도착">
                        <Field label="항공편명">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="예: KE124"
                            value={f.arrFlightNo}
                            onChange={si("flights", idx)("arrFlightNo")}
                          />
                        </Field>
                        <Field label="공항">
                          <input
                            type="text"
                            className="form--field"
                            placeholder="예: 괌 (GWM)"
                            value={f.arrAirport}
                            onChange={si("flights", idx)("arrAirport")}
                          />
                        </Field>
                        <Field label="도착일">
                          <DateInput
                            className="form--field"
                            value={f.arrDate}
                            onChange={(v) =>
                              setItem("flights", idx, "arrDate", v)
                            }
                          />
                        </Field>
                        <Field label="도착시간">
                          <input
                            type="time"
                            className="form--field"
                            value={f.arrTime}
                            onChange={si("flights", idx)("arrTime")}
                          />
                        </Field>
                      </SubGroup>

                      <SubGroup label="운임">
                        <Field label="성인 비용">
                          <NumInput
                            className="form--field text-right"
                            placeholder="0"
                            value={f.adultFare}
                            onChange={(v) =>
                              setItem("flights", idx, "adultFare", v)
                            }
                          />
                        </Field>
                        <Field label="성인 인원">
                          <NumInput
                            className="form--field text-right"
                            placeholder="0"
                            value={f.adultCount}
                            onChange={(v) =>
                              setItem("flights", idx, "adultCount", v)
                            }
                          />
                        </Field>
                        <Field label="소아 비용">
                          <NumInput
                            className="form--field text-right"
                            placeholder="0"
                            value={f.childFare}
                            onChange={(v) =>
                              setItem("flights", idx, "childFare", v)
                            }
                          />
                        </Field>
                        <Field label="소아 인원">
                          <NumInput
                            className="form--field text-right"
                            placeholder="0"
                            value={f.childCount}
                            onChange={(v) =>
                              setItem("flights", idx, "childCount", v)
                            }
                          />
                        </Field>
                        <Field label="합계">
                          <NumInput
                            className="form--field text-right"
                            placeholder="자동 합계"
                            value={total > 0 ? String(total) : ""}
                            readOnly
                          />
                        </Field>
                      </SubGroup>

                      <div className="info-grid" style={{ marginTop: "12px" }}>
                        <Field label="메모" span={3}>
                          <input
                            type="text"
                            className="form--field"
                            placeholder="메모"
                            value={f.memo}
                            onChange={si("flights", idx)("memo")}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                );
              })}
            </InfoCard>

            {/* ── 호텔 정보 ── */}
            <InfoCard
              title="호텔 정보"
              action={
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => addItem("hotels", emptyHotel)}
                >
                  <i className="ni-add" /> 추가
                </button>
              }
            >
              {info.hotels.length === 0 && (
                <div className="info-card__empty">
                  등록된 호텔 정보가 없습니다
                </div>
              )}
              {info.hotels.map((h, idx) => (
                <div key={h._id} className="info-card__item">
                  {idx > 0 && <div className="info-card__divider" />}
                  <div className="info-card__body">
                    <ItemDivider
                      index={idx}
                      onRemove={() => removeItem("hotels", idx)}
                    />
                    <div className="info-grid">
                      <Field label="예약일">
                        <DateInput
                          className="form--field"
                          value={h.bookingDate}
                          onChange={(v) =>
                            setItem("hotels", idx, "bookingDate", v)
                          }
                        />
                      </Field>
                      <Field label="예약번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예약번호"
                          value={h.bookingNo}
                          onChange={si("hotels", idx)("bookingNo")}
                        />
                      </Field>
                      <Field label="예약업체">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예: 아고다"
                          value={h.bookingAgency}
                          onChange={si("hotels", idx)("bookingAgency")}
                        />
                      </Field>
                      <Field label="업체명">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="호텔명"
                          value={h.name}
                          onChange={si("hotels", idx)("name")}
                        />
                      </Field>
                      <Field label="전화번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="전화번호"
                          value={h.phone}
                          onChange={si("hotels", idx)("phone")}
                        />
                      </Field>
                      <Field label="주소" span={3}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="주소"
                          value={h.address}
                          onChange={si("hotels", idx)("address")}
                        />
                      </Field>
                      <Field label="비용">
                        <NumInput
                          className="form--field text-right"
                          placeholder="0"
                          value={h.cost}
                          onChange={(v) => setItem("hotels", idx, "cost", v)}
                        />
                      </Field>
                      <Field label="일수">
                        <NumInput
                          className="form--field text-right"
                          placeholder="0"
                          value={h.nights}
                          onChange={(v) => setItem("hotels", idx, "nights", v)}
                        />
                      </Field>
                      <Field label="룸타입">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예: 디럭스 더블"
                          value={h.roomType}
                          onChange={si("hotels", idx)("roomType")}
                        />
                      </Field>
                    </div>

                    <SubGroup label="체크인">
                      <Field label="날짜">
                        <DateInput
                          className="form--field"
                          value={h.checkInDate}
                          onChange={(v) =>
                            setItem("hotels", idx, "checkInDate", v)
                          }
                        />
                      </Field>
                      <Field label="시간">
                        <input
                          type="time"
                          className="form--field"
                          value={h.checkInTime}
                          onChange={si("hotels", idx)("checkInTime")}
                        />
                      </Field>
                    </SubGroup>

                    <SubGroup label="체크아웃">
                      <Field label="날짜">
                        <DateInput
                          className="form--field"
                          value={h.checkOutDate}
                          onChange={(v) =>
                            setItem("hotels", idx, "checkOutDate", v)
                          }
                        />
                      </Field>
                      <Field label="시간">
                        <input
                          type="time"
                          className="form--field"
                          value={h.checkOutTime}
                          onChange={si("hotels", idx)("checkOutTime")}
                        />
                      </Field>
                    </SubGroup>

                    <div className="info-grid" style={{ marginTop: "12px" }}>
                      <Field label="메모" span={3}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="메모"
                          value={h.memo}
                          onChange={si("hotels", idx)("memo")}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </InfoCard>

            {/* ── 주차(주차대행) ── */}
            <InfoCard
              title="주차 (주차대행)"
              action={
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => addItem("parkings", emptyParking)}
                >
                  <i className="ni-add" /> 추가
                </button>
              }
            >
              {info.parkings.length === 0 && (
                <div className="info-card__empty">
                  등록된 주차 정보가 없습니다
                </div>
              )}
              {info.parkings.map((pk, idx) => (
                <div key={pk._id} className="info-card__item">
                  {idx > 0 && <div className="info-card__divider" />}
                  <div className="info-card__body">
                    <ItemDivider
                      index={idx}
                      onRemove={() => removeItem("parkings", idx)}
                    />
                    <div className="info-grid">
                      <Field label="예약일">
                        <DateInput
                          className="form--field"
                          value={pk.bookingDate}
                          onChange={(v) =>
                            setItem("parkings", idx, "bookingDate", v)
                          }
                        />
                      </Field>
                      <Field label="예약번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예약번호"
                          value={pk.bookingNo}
                          onChange={si("parkings", idx)("bookingNo")}
                        />
                      </Field>
                      <Field label="예약업체">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예약업체"
                          value={pk.bookingAgency}
                          onChange={si("parkings", idx)("bookingAgency")}
                        />
                      </Field>
                      <Field label="업체명">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="업체명"
                          value={pk.name}
                          onChange={si("parkings", idx)("name")}
                        />
                      </Field>
                      <Field label="전화번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="전화번호"
                          value={pk.phone}
                          onChange={si("parkings", idx)("phone")}
                        />
                      </Field>
                      <Field label="주소" span={3}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="주소"
                          value={pk.address}
                          onChange={si("parkings", idx)("address")}
                        />
                      </Field>
                      <Field label="이용 예정일시">
                        <input
                          type="datetime-local"
                          className="form--field"
                          value={pk.scheduledUse}
                          onChange={si("parkings", idx)("scheduledUse")}
                        />
                      </Field>
                      <Field label="반납 예정일시">
                        <input
                          type="datetime-local"
                          className="form--field"
                          value={pk.scheduledReturn}
                          onChange={si("parkings", idx)("scheduledReturn")}
                        />
                      </Field>
                      <Field label="상품명">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="상품명"
                          value={pk.product}
                          onChange={si("parkings", idx)("product")}
                        />
                      </Field>
                      <Field label="비용">
                        <NumInput
                          className="form--field text-right"
                          placeholder="0"
                          value={pk.cost}
                          onChange={(v) => setItem("parkings", idx, "cost", v)}
                        />
                      </Field>
                      <Field label="자동차 보험" span={2}>
                        <div
                          className="flex items-center gap-2"
                          style={{ paddingTop: "2px" }}
                        >
                          <input
                            type="checkbox"
                            checked={pk.insuranceChecked}
                            onChange={(e) =>
                              setItem(
                                "parkings",
                                idx,
                                "insuranceChecked",
                                e.target.checked,
                              )
                            }
                            className="form-check"
                            style={{ flexShrink: 0 }}
                          />
                          <span
                            className="form--label form--label--optional"
                            style={{ margin: 0 }}
                          >
                            포함
                          </span>
                        </div>
                      </Field>
                      <Field label="메모" span={3}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="메모"
                          value={pk.memo}
                          onChange={si("parkings", idx)("memo")}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </InfoCard>

            {/* ── 체험 예약 ── */}
            <InfoCard
              title="체험 예약"
              action={
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => addItem("activities", emptyActivity)}
                >
                  <i className="ni-add" /> 추가
                </button>
              }
            >
              {info.activities.length === 0 && (
                <div className="info-card__empty">
                  등록된 체험 예약이 없습니다
                </div>
              )}
              {info.activities.map((act, idx) => (
                <div key={act._id} className="info-card__item">
                  {idx > 0 && <div className="info-card__divider" />}
                  <div className="info-card__body">
                    <ItemDivider
                      index={idx}
                      onRemove={() => removeItem("activities", idx)}
                    />
                    <div className="info-grid">
                      <Field label="예약일">
                        <DateInput
                          className="form--field"
                          value={act.bookingDate}
                          onChange={(v) =>
                            setItem("activities", idx, "bookingDate", v)
                          }
                        />
                      </Field>
                      <Field label="예약번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="예약번호"
                          value={act.bookingNo}
                          onChange={si("activities", idx)("bookingNo")}
                        />
                      </Field>
                      <Field label="업체명">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="업체명"
                          value={act.name}
                          onChange={si("activities", idx)("name")}
                        />
                      </Field>
                      <Field label="주소" span={2}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="주소"
                          value={act.address}
                          onChange={si("activities", idx)("address")}
                        />
                      </Field>
                      <Field label="전화번호">
                        <input
                          type="text"
                          className="form--field"
                          placeholder="전화번호"
                          value={act.phone}
                          onChange={si("activities", idx)("phone")}
                        />
                      </Field>
                      <Field label="비용">
                        <NumInput
                          className="form--field text-right"
                          placeholder="0"
                          value={act.cost}
                          onChange={(v) =>
                            setItem("activities", idx, "cost", v)
                          }
                        />
                      </Field>
                      <Field label="프로그램" span={3}>
                        <div
                          className="form-field__wrap --tags"
                          onClick={() =>
                            document.getElementById(`prog-${idx}`)?.focus()
                          }
                        >
                          {act.programs.map((prog) => (
                            <span key={prog} className="tag-chip">
                              {prog}
                              <button
                                type="button"
                                className="tag-chip__remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProgram(idx, prog);
                                }}
                                tabIndex={-1}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                          <input
                            id={`prog-${idx}`}
                            type="text"
                            className="tag-chip__input"
                            placeholder={
                              act.programs.length === 0
                                ? "프로그램 입력 후 Enter"
                                : ""
                            }
                            value={programInputs[idx] ?? ""}
                            onChange={(e) =>
                              setProgramInputs((p) => ({
                                ...p,
                                [idx]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.nativeEvent.isComposing) return;
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addProgram(idx, programInputs[idx] ?? "");
                              }
                            }}
                            onBlur={(e) => addProgram(idx, e.target.value)}
                          />
                        </div>
                      </Field>
                      <Field label="비고" span={3}>
                        <input
                          type="text"
                          className="form--field"
                          placeholder="비고"
                          value={act.notes}
                          onChange={si("activities", idx)("notes")}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </InfoCard>
          </section>
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
