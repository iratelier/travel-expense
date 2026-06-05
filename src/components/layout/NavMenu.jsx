import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", icon: "ni-list-board", label: "메인" },
  { path: "/info", icon: "ni-bookmark", label: "나의 여행" },
  { path: "/expense", icon: "ni-apps-fill", label: "지출 내역" },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* 외부 클릭 시 닫기 */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div className="nav-menu" ref={ref}>
        <button
          className="nav-menu__trigger"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
        >
          <i
            className={open ? "ni-close" : "ni-menu"}
            style={{ fontSize: 16 }}
          />
        </button>

        {open && (
          <>
            <div className="nav-menu__dropdown">
              {NAV_ITEMS.map(({ path, icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `nav-menu__item${isActive ? " active" : ""}`
                  }
                >
                  <i className={icon} style={{ fontSize: 15 }} />
                  {label}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
