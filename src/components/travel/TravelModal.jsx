import { useState } from "react";
import Modal from "../common/Modal";

export default function TravelModal({
  isEditing,
  tripForm,
  onChange,
  onSave,
  onClose,
}) {
  const [errors, setErrors] = useState({});

  function set(key) {
    return (e) => {
      const val = e.target.value;
      onChange(key, val);
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));

      // 시작일 변경 시 종료일이 비어있거나 시작일보다 앞이면 시작일로 맞춤
      if (key === "startDate" && val) {
        if (!tripForm.endDate || tripForm.endDate < val) {
          onChange("endDate", val);
          if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: false }));
        }
      }
    };
  }

  function handleSave() {
    const errs = {};
    if (!tripForm.location.trim()) errs.location = true;
    if (!tripForm.startDate) errs.startDate = true;
    if (!tripForm.endDate) errs.endDate = true;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave();
  }

  return (
    <Modal
      title={isEditing ? "여행 수정" : "여행 추가"}
      name="trip"
      onClose={onClose}
      footer={
        <div className="btn-group">
          <button className="btn btn--primary" onClick={handleSave}>
            {isEditing ? "수정" : "추가"}
          </button>
          <button className="btn" onClick={onClose}>
            취소
          </button>
        </div>
      }
    >
      {/* 여행지 — 필수 */}
      <Modal.Section title={<>여행지 <span className="text-red-500">*</span></>}>
        <input
          type="text"
          className={`form--field${errors.location ? " border-red-400" : ""}`}
          placeholder="여행지 입력"
          value={tripForm.location}
          onChange={set("location")}
        />
        {errors.location && (
          <span className="text-red-500 text-xs mt-0.5">여행지를 입력해 주세요</span>
        )}
      </Modal.Section>

      {/* 여행 기간 — 필수 */}
      <Modal.Section title={<>여행 기간 <span className="text-red-500">*</span></>}>
        <div className="flex items-center gap-2">
          <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
            <input
              type="date"
              className={`form--field${errors.startDate ? " border-red-400" : ""}`}
              value={tripForm.startDate}
              onChange={set("startDate")}
            />
            {errors.startDate && (
              <span className="text-red-500 text-xs mt-0.5">시작일을 선택해 주세요</span>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0">~</span>
          <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
            <input
              type="date"
              className={`form--field${errors.endDate ? " border-red-400" : ""}`}
              value={tripForm.endDate}
              min={tripForm.startDate || undefined}
              onChange={set("endDate")}
            />
            {errors.endDate && (
              <span className="text-red-500 text-xs mt-0.5">종료일을 선택해 주세요</span>
            )}
          </div>
        </div>
      </Modal.Section>

      {/* 동행 — 선택 */}
      <Modal.Section title="동행 (선택)">
        <input
          type="text"
          className="form--field"
          placeholder="동행자 이름 (예: 지수, 민준)"
          value={tripForm.companions}
          onChange={set("companions")}
        />
      </Modal.Section>
    </Modal>
  );
}
