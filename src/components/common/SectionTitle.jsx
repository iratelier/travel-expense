export default function SectionTitle({ title, children }) {
  return (
    <>
      <div className="section-title">
        <div className="section-title__label">{title}</div>

        {children}
      </div>
    </>
  );
}
