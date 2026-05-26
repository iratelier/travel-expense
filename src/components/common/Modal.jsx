/**
 * Modal
 *
 * Props:
 *   title      {string}       모달 제목
 *   children   {ReactNode}    본문 영역
 *   footer     {ReactNode}    푸터 영역 (버튼 등)
 *   onClose    {() => void}   닫기 핸들러 (overlay 클릭 포함)
 *   maxWidth   {number|string} 최대 너비 override (px 숫자 또는 CSS 문자열)
 *   className  {string}       .modal에 추가할 클래스
 *   name       {string}       data-modal 식별자 (예: "holiday")
 */
export default function Modal({
  title,
  children,
  footer,
  onClose,
  maxWidth,
  className = "",
  name,
}) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div
          // className={`modal ${className}`}
          className={`modal`}
          data-modal={name || undefined}
          style={maxWidth ? { maxWidth } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {title && <div className="modal__title">{title}</div>}

          <div className="modal__body">{children}</div>

          {footer && <div className="modal__footer">{footer}</div>}
        </div>
      </div>
    </>
  );
}

/**
 * Modal.Section — 모달 내부 구역
 *
 * Props:
 *   title    {string}     섹션 소제목 (선택)
 *   children {ReactNode}
 */
Modal.Section = function ModalSection({ title, children }) {
  return (
    <div className="modal__section">
      {title && <div className="modal__section-title">{title}</div>}
      {children}
    </div>
  );
};
