import { useNavigate } from "react-router-dom";
import NavMenu from "./NavMenu";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="header__logo">
        <h1
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <i
            className="ni-apps-fill header__logo-icon"
            style={{ fontSize: 18 }}
          />
          Travel
        </h1>
      </div>
      <NavMenu />
    </header>
  );
}
