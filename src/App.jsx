import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TravelPage from "./pages/TravelPage";
import TravelInfoPage from "./pages/TravelInfoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<MainPage />} />
        <Route path="/info"    element={<TravelInfoPage />} />
        <Route path="/expense" element={<TravelPage />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
