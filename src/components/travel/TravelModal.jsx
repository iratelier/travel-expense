import Modal from "../common/Modal";

/**
 * TravelModal — 여행 추가/수정 모달
 *
 * Props:
 *   isEditing  {boolean}              수정 모드 여부
 *   tripForm   {object}               { location, startDate, endDate, companions }
 *   onChange   {(key, value) => void} 필드 변경 핸들러
 *   onSave     {() => void}           저장 버튼 클릭
 *   onClose    {() => void}           닫기 / 취소
 */
export default function TravelModal({
  isEditing,
  tripForm,
  onChange,
  onSave,
  onClose,
}) {
  function set(key) {
    return (e) => onChange(key, e.target.value);
  }

  return (
    <>
      <Modal
        title={isEditing ? "여행 수정" : "여행 추가"}
        name="trip"
        onClose={onClose}
        footer={
          <>
            <div className="btn-group">
              <button className="btn btn--primary" onClick={onSave}>
                {isEditing ? "수정" : "추가"}
              </button>
              <button className="btn" onClick={onClose}>
                취소
              </button>
            </div>
          </>
        }
      >
        <Modal.Section title="여행지">
          <input
            type="text"
            className="form--field"
            placeholder="여행지 입력"
            value={tripForm.location}
            onChange={set("location")}
          />
        </Modal.Section>

        <Modal.Section title="여행 기간">
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="form--field"
              style={{ flex: 1, minWidth: 0 }}
              value={tripForm.startDate}
              onChange={set("startDate")}
            />
            <span className="text-xs text-gray-400 shrink-0">~</span>
            <input
              type="date"
              className="form--field"
              style={{ flex: 1, minWidth: 0 }}
              value={tripForm.endDate}
              onChange={set("endDate")}
            />
          </div>
        </Modal.Section>

        <Modal.Section title="동행">
          <input
            type="text"
            className="form--field"
            placeholder="동행자 이름 (예: 지수, 민준)"
            value={tripForm.companions}
            onChange={set("companions")}
          />
        </Modal.Section>
      </Modal>
    </>
  );
}
