export default function Checkbox({
  checked,
  onChange,
  children,
  disabled = false,
  className = "",
}) {
  return (
    <>
      <label className={`form--checkbox-row ${className}`}>
        <input
          type="checkbox"
          className="form--checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {children && <span>{children}</span>}
      </label>
    </>
  );
}
