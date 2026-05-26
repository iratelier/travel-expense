import { useState, useEffect } from "react";
import Modal from "../common/Modal";

const EMPTY_FORM = { location: "", startDate: "", endDate: "", companions: "" };

/**
 * TravelModal — 여행 관리 (목록 선택 + 추가/수정/삭제)
 *
 * Props:
 *   trips          {array}                  전체 여행 목록
 *   initialTripId  {string|null}            열릴 때 선택할 여행 id (null = 새 여행 모드)
 *   onSave         {(tripId, form) => void} tripId=null이면 추가, 있으면 수정
 *   onDelete       {(tripId) => void}
 *   onClose        {() => void}
 */
export default function TravelModal({
  trips = [],
  initialTripId = null,
  onSave,
  onDelete,
  onClose,
}) {
  const [activeId, setActiveId] = useState(initialTripId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // 선택 여행 변경 시 폼 동기화
  useEffect(() => {
    if (activeId) {
      const trip = trips.find((t) => t.id === activeId);
      if (trip) {
        setForm({
          location: trip.location,
          startDate: trip.startDate ?? "",
          endDate: trip.endDate ?? "",
          companions: trip.companions ?? "",
        });
      }
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectTrip(id) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  function set(key) {
    return (e) => {
      const val = e.target.value;
      if (errors[key]) setErrors((p) => ({ ...p, [key]: false }));

      if (key === "startDate" && val) {
        setForm((f) => ({
          ...f,
          startDate: val,
          endDate: !f.endDate || f.endDate < val ? val : f.endDate,
        }));
        if (errors.endDate) setErrors((p) => ({ ...p, endDate: false }));
      } else {
        setForm((f) => ({ ...f, [key]: val }));
      }
    };
  }

  function handleSave() {
    const errs = {};
    if (!form.location.trim()) errs.location = true;
    if (!form.startDate) errs.startDate = true;
    if (!form.endDate) errs.endDate = true;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(activeId, form); // activeId=null이면 추가
  }

  function handleDelete() {
    if (activeId) onDelete(activeId);
  }

  const isEditing = !!activeId;
  const title = isEditing ? "여행 수정" : "여행 추가";

  return (
    <>
      <Modal
        title="여행 관리"
        name="trip"
        onClose={onClose}
        footer={
          <div className="btn-group">
            <button className="btn btn--primary" onClick={handleSave}>
              {isEditing ? "수정 저장" : "추가"}
            </button>
            <button className="btn" onClick={onClose}>
              취소
            </button>
            {isEditing && (
              <button
                className="btn btn--delete"
                style={{ marginLeft: "auto" }}
                onClick={handleDelete}
              >
                <i className="ni-delete" /> 삭제
              </button>
            )}
          </div>
        }
      >
        {/* ── 여행 목록 ─────────────────────────────────────── */}
        {trips.length > 0 && (
          <div className="trip-list">
            {trips.map((t) => {
              const ym = t.startDate
                ? t.startDate.slice(0, 7).replace("-", ".")
                : "";
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`trip-list__item${activeId === t.id ? " --active" : ""}`}
                  onClick={() => selectTrip(t.id)}
                >
                  <span className="trip-list__name">{t.location}</span>
                  {ym && <span className="trip-list__date">{ym}</span>}
                </button>
              );
            })}
            {/* 새 여행 추가 선택 */}
            <button
              type="button"
              className={`trip-list__item trip-list__item--new${!activeId ? " --active" : ""}`}
              onClick={() => setActiveId(null)}
            >
              <i className="ni-add" /> 새 여행
            </button>
          </div>
        )}

        <div className="travel-card">
          {/* ── 폼 제목 ───────────────────────────────────────── */}
          <h3 className="title-header">[{title}]</h3>

          {/* ── 여행지 ────────────────────────────────────────── */}
          <Modal.Section
            title={
              <>
                여행지 <span className="text-red-500">*</span>
              </>
            }
          >
            <input
              type="text"
              className={`form--field${errors.location ? " border-red-400" : ""}`}
              placeholder="여행지 입력"
              value={form.location}
              onChange={set("location")}
            />
            {errors.location && (
              <span className="text-red-500 text-xs mt-0.5">
                여행지를 입력해 주세요
              </span>
            )}
          </Modal.Section>

          {/* ── 여행 기간 ──────────────────────────────────────── */}
          <Modal.Section
            title={
              <>
                여행 기간 <span className="text-red-500">*</span>
              </>
            }
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="date"
                  className={`form--field${errors.startDate ? " border-red-400" : ""}`}
                  value={form.startDate}
                  onChange={set("startDate")}
                />
                {errors.startDate && (
                  <span className="text-red-500 text-xs mt-0.5">
                    시작일을 선택해 주세요
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">~</span>
              <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="date"
                  className={`form--field${errors.endDate ? " border-red-400" : ""}`}
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={set("endDate")}
                />
                {errors.endDate && (
                  <span className="text-red-500 text-xs mt-0.5">
                    종료일을 선택해 주세요
                  </span>
                )}
              </div>
            </div>
          </Modal.Section>

          {/* ── 동행 ──────────────────────────────────────────── */}
          <Modal.Section title="동행 (선택)">
            <input
              type="text"
              className="form--field"
              placeholder="동행자 이름 (예: 지수, 민준)"
              value={form.companions}
              onChange={set("companions")}
            />
          </Modal.Section>
        </div>
      </Modal>
    </>
  );
}
