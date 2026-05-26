import { useState } from "react";
import Modal from "../common/Modal";
import { useExchangeRate } from "../../hooks/useExchangeRate";

/**
 * ExpenseEditModal — 지출 항목 수정 모달
 *
 * Props:
 *   entry   {object}              수정할 항목 (expenses 행)
 *   onSave  {(id, data) => void}
 *   onClose {() => void}
 *   saving  {boolean}
 */
export default function ExpenseEditModal({
  entry,
  onSave,
  onClose,
  saving,
  trips = [],
}) {
  const { toKRW, rates } = useExchangeRate();

  const [form, setForm] = useState({
    date: entry.date ?? "",
    description: entry.description ?? "",
    location: entry.location ?? "",
    store: entry.store ?? "",
    currency: entry.currency ?? "JPY",
    amount: entry.amount ?? "",
    tags: entry.tag
      ? entry.tag
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    memo: entry.memo ?? "",
  });
  const [tagInput, setTagInput] = useState("");
  const [tripError, setTripError] = useState(false);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSave();
  }

  // ── 태그 ──────────────────────────────────────────────────────
  const tags = form.tags;

  function handleTagKeyDown(e) {
    if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중 무시
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(e.target.value);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }));
    }
  }
  function addTag(val) {
    const t = (val !== undefined ? val : tagInput).trim().replace(/,/g, "");
    if (!t || tags.includes(t)) {
      setTagInput("");
      return;
    }
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  }
  function removeTag(t) {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
  }

  const krwEstimate = toKRW(form.amount, form.currency);
  const unitRate = rates?.[form.currency] ?? null;

  function handleSave() {
    if (trips.length > 0 && !form.location.trim()) {
      setTripError(true);
      return;
    }
    setTripError(false);
    onSave(entry.id, {
      date: form.date,
      description: form.description.trim(),
      location: form.location.trim() || null,
      store: form.store.trim() || null,
      currency: form.currency || "JPY",
      amount: form.amount !== "" ? Number(form.amount) : null,
      tag: tags.length > 0 ? tags.join(",") : null,
      memo: form.memo.trim() || null,
    });
  }

  return (
    <>
      <Modal
        title="항목 수정"
        name="expense-edit"
        onClose={onClose}
        footer={
          <>
            <div className="btn-group">
              <button
                className="btn btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "저장 중" : "수정 저장"}
              </button>
              <button className="btn" onClick={onClose}>
                취소
              </button>
            </div>
          </>
        }
      >
        <section className="form-section" data-form="expense">
          {/* 날짜 */}
          <div className="form-section__cell" data-cell="--date">
            <label className="form--label form--label--required">날짜</label>
            <input
              type="date"
              className="form--field"
              value={form.date}
              onChange={set("date")}
            />
          </div>

          {/* 내역 */}
          <div className="form-section__cell" data-cell="--desc">
            <label className="form--label form--label--required">내역</label>
            <input
              type="text"
              className="form--field"
              placeholder="지출 내역 입력"
              value={form.description}
              onChange={set("description")}
              onKeyDown={handleKey}
            />
          </div>

          {/* 여행 선택 */}
          {trips.length > 0 && (
            <div className="form-section__cell" data-cell="--trip">
              <label className="form--label form--label--required">여행</label>
              <select
                className={`form--select${tripError ? " border-red-400" : ""}`}
                value={
                  trips.find((t) => t.location === form.location)?.id ?? ""
                }
                onChange={(e) => {
                  const trip = trips.find((t) => t.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    location: trip ? trip.location : "",
                  }));
                  setTripError(false);
                }}
              >
                <option value="">선택 안 함</option>
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
              {tripError && (
                <span className="text-red-500 text-xs mt-0.5">
                  여행을 선택해 주세요
                </span>
              )}
            </div>
          )}

          {/* 여행지 */}
          <div className="form-section__cell" data-cell="--location">
            <label className="form--label form--label--optional">여행지</label>
            <input
              type="text"
              className="form--field"
              placeholder="여행지 입력"
              value={form.location}
              onChange={set("location")}
              onKeyDown={handleKey}
            />
          </div>

          {/* 구입처 */}
          <div className="form-section__cell" data-cell="--store">
            <label className="form--label form--label--optional">구입처</label>
            <input
              type="text"
              className="form--field"
              placeholder="구입처 입력"
              value={form.store}
              onChange={set("store")}
              onKeyDown={handleKey}
            />
          </div>

          {/* 통화 */}
          <div className="form-section__cell" data-cell="--currency">
            <label className="form--label form--label--required">통화</label>
            <select
              className="form--select"
              value={form.currency}
              onChange={set("currency")}
            >
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="VND">VND</option>
              <option value="ETC">ETC</option>
            </select>
          </div>

          {/* 금액 */}
          <div className="form-section__cell" data-cell="--amount">
            <label className="form--label form--label--required">금액</label>
            <div className="form--field-inline">
              <input
                type="number"
                className="form--field text-right"
                placeholder="0"
                value={form.amount}
                onChange={set("amount")}
                onKeyDown={handleKey}
              />
              {/* 금액 입력 + 환율 로드 시에만 힌트 노출 */}
              {krwEstimate != null && (
                <span className="form-section__hint">
                  (한화 {krwEstimate.toLocaleString("ko-KR")}원 / 환율{" "}
                  {unitRate != null
                    ? unitRate.toLocaleString("ko-KR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "--"}
                  원)
                </span>
              )}
            </div>
          </div>

          {/* 태그 */}
          <div className="form-section__cell" data-cell="--tag">
            <label className="form--label form--label--optional">태그</label>
            <div
              className="form-field__wrap --tags"
              onClick={() => document.getElementById("edit-tag-input")?.focus()}
            >
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                  <button
                    type="button"
                    className="tag-chip__remove"
                    onClick={() => removeTag(t)}
                    tabIndex={-1}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                id="edit-tag-input"
                type="text"
                className="tag-chip__input"
                placeholder={tags.length === 0 ? "식비, 교통 (Enter)" : ""}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={(e) => addTag(e.target.value)}
              />
            </div>
          </div>

          {/* 메모 */}
          <div className="form-section__cell" data-cell="--memo">
            <label className="form--label form--label--optional">메모</label>
            <textarea
              className="form--textarea resize-none"
              placeholder="추가 메모 (선택)"
              value={form.memo}
              onChange={set("memo")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>
        </section>
      </Modal>
    </>
  );
}
