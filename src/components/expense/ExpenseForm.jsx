import { useRef, useState } from "react";
import SectionTitle from "../common/SectionTitle";
import { useExchangeRate } from "../../hooks/useExchangeRate";

export default function ExpenseForm({
  form,
  onChange,
  onAdd,
  saving,
  trips = [],
}) {
  const descRef = useRef(null);
  const [tagInput, setTagInput] = useState("");
  const { toKRW, rates } = useExchangeRate();

  function set(key) {
    return (e) => onChange(key, e.target.value);
  }

  function handleKey(e) {
    if (e.key === "Enter") onAdd(descRef);
  }

  // ── 태그 칩 ────────────────────────────────────────────────────────────────
  const tags = Array.isArray(form.tags) ? form.tags : [];

  function handleTagKeyDown(e) {
    if (e.nativeEvent.isComposing) return; // 한글 IME 조합 중 무시
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(e.target.value);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      onChange("tags", tags.slice(0, -1));
    }
  }

  function addTag(val) {
    const t = (val !== undefined ? val : tagInput).trim().replace(/,/g, "");
    if (!t || tags.includes(t)) {
      setTagInput("");
      return;
    }
    onChange("tags", [...tags, t]);
    setTagInput("");
  }

  function removeTag(t) {
    onChange(
      "tags",
      tags.filter((x) => x !== t),
    );
  }

  // ── 원화 환산 ───────────────────────────────────────────────────────────────
  const krwEstimate = toKRW(form.amount, form.currency);
  const unitRate = rates?.[form.currency] ?? null;

  return (
    <>
      <article className="expense-record__form">
        <SectionTitle title="항목 추가" />

        <section className="form-section" data-form="expense">
          {/* 여행 선택 */}
          {trips.length > 0 && (
            <div className="form-section__cell" data-cell="--trip">
              <label className="form--label form--label--required">여행</label>
              <select
                className="form--select"
                value={form.tripId ?? ""}
                onChange={(e) => onChange("tripId", e.target.value)}
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
            </div>
          )}

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
              ref={descRef}
              type="text"
              className="form--field"
              placeholder="지출 내역 입력"
              value={form.description}
              onChange={set("description")}
              onKeyDown={handleKey}
            />
          </div>

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
              <option value="JPY">¥ 엔화</option>
              <option value="KRW">₩ 원화</option>
              <option value="USD">$ 달러</option>
              <option value="EUR">€ 유로</option>
              <option value="VND">₫ 동 (베트남)</option>
              <option value="ETC">기타</option>
            </select>
          </div>

          {/* 금액 + 원화 환산 */}
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

          {/* 태그 칩 */}
          <div className="form-section__cell" data-cell="--tag">
            <label className="form--label form--label--optional">태그</label>
            <div
              className="form-field__wrap --tags"
              onClick={() => document.getElementById("tag-input")?.focus()}
            >
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                  <button
                    type="button"
                    className="tag-chip__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(t);
                    }}
                    tabIndex={-1}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
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
                  onAdd(descRef);
                }
              }}
            />
          </div>

          {/* 추가 버튼 */}
          <div className="form-section__cell" data-cell="--action">
            <button
              className="btn btn--primary"
              onClick={() => onAdd(descRef)}
              disabled={saving}
              title="추가 (Enter)"
            >
              {saving ? "저장 중" : "+ 항목 추가"}
            </button>
          </div>
        </section>
      </article>
    </>
  );
}
