import { useState } from "react";

const PAGES = [
  { id: "main",    label: "메인" },
  { id: "info",    label: "여행 정보" },
  { id: "expense", label: "지출 내역" },
];

export default function Header({ currentPage, onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header__logo">
        <i className="ni-apps-fill header__logo-icon" style={{ fontSize: 18 }} />
        Travel
      </div>

      {onNavigate && (
        <div className="nav-menu">
          <button
            className="nav-menu__trigger"
            aria-label="메뉴 열기"
            onClick={() => setOpen((p) => !p)}
          >
            <i className="ni-menu" style={{ fontSize: 16 }} />
          </button>
          {open && (
            <>
              {/* 외부 클릭 닫기 */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 299 }}
                onClick={() => setOpen(false)}
              />
              <div className="nav-menu__dropdown">
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    className={`nav-menu__item${currentPage === p.id ? " active" : ""}`}
                    onClick={() => { onNavigate(p.id); setOpen(false); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
