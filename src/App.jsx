import { useState } from 'react'
import MainPage from './pages/MainPage'
import TravelPage from './pages/TravelPage'
import TravelInfoPage from './pages/TravelInfoPage'

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem("currentPage") ?? "main")

  function navigate(p) {
    localStorage.setItem("currentPage", p)
    setPage(p)
  }

  if (page === "expense") return <TravelPage     currentPage={page} onNavigate={navigate} />
  if (page === "info")    return <TravelInfoPage currentPage={page} onNavigate={navigate} />
  return                         <MainPage       currentPage={page} onNavigate={navigate} />
}
