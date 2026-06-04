import { useState } from "react";

/**
 * NumInput — 천단위 쉼표 포맷 숫자 입력
 *
 * Props:
 *   value       {string|number}  원시 숫자 문자열
 *   onChange    {(raw: string) => void}
 *   className   {string}
 *   placeholder {string}
 *   readOnly    {boolean}
 */
export default function NumInput({
  value,
  onChange,
  className = "",
  placeholder = "0",
  readOnly = false,
}) {
  const [focused, setFocused] = useState(false);

  const raw = String(value ?? "");
  const num = raw !== "" ? Number(raw) : null;

  // 포커스 중엔 원시값, 블러 후엔 천단위 포맷
  const displayValue =
    !focused && num != null && !isNaN(num)
      ? num.toLocaleString("ko-KR")
      : raw;

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      value={displayValue}
      readOnly={readOnly}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        if (readOnly) return;
        const stripped = e.target.value.replace(/[^\d]/g, "");
        onChange?.(stripped);
      }}
    />
  );
}
