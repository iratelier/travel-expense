import { useRef, useEffect } from "react";

/**
 * vanillajs-datepicker 를 React 에서 쓰기 위한 래퍼.
 * - value: 'YYYY-MM-DD' 문자열 (없으면 "")
 * - onChange(v): 날짜 선택 시 'YYYY-MM-DD' 문자열을 전달
 */
export default function DateInput({ value, onChange, className, placeholder }) {
  const ref      = useRef(null);
  const dpRef    = useRef(null);
  const cbRef    = useRef(onChange);   // onChange 최신 참조 유지

  useEffect(() => { cbRef.current = onChange; }, [onChange]);

  // ── 마운트 시 datepicker 초기화 ──────────────────────────────────────────
  useEffect(() => {
    if (!ref.current || typeof window.Datepicker === "undefined") return;

    const dp = new window.Datepicker(ref.current, {
      language: "ko",
      container: document.body,
      autohide: true,
      todayHighlight: true,
    });
    dpRef.current = dp;

    // 초기값 반영
    if (value) dp.setDate(value, { render: false });

    const handleChange = () => {
      cbRef.current?.(ref.current.value);
    };
    ref.current.addEventListener("changeDate", handleChange);

    return () => {
      // cleanup (React StrictMode 이중 실행 대응)
      ref.current?.removeEventListener("changeDate", handleChange);
      try { dp.destroy(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── value prop 외부 변경 시 datepicker 동기화 ────────────────────────────
  useEffect(() => {
    const dp = dpRef.current;
    if (!dp) return;
    const current = ref.current?.value ?? "";
    if (value === current) return;          // 이미 같으면 스킵
    if (value) {
      dp.setDate(value, { render: false });
    } else {
      dp.setDate({ clear: true });
    }
  }, [value]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="none"            // 모바일 키보드 억제
      className={className}
      placeholder={placeholder ?? "날짜 선택"}
      readOnly                    // datepicker 가 직접 값 관리
    />
  );
}
