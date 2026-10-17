import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import RecognitionPage from "./pages/RecognitionPage.jsx";
import ComponentsPage from "./pages/ComponentsPage.jsx";
import EquipmentPage from "./pages/EquipmentPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const title =
      {
        "/": "AI Recognition",
        "/components": "Components Library",
        "/equipment": "Equipment Guide",
      }[pathname] ?? "ไม่พบหน้า";
    document.title = `${title} | CircuitLib`;
    window.scrollTo(0, 0);
    if (previousPath.current !== pathname)
      mainRef.current?.focus({ preventScroll: true });
    previousPath.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const preventFileNavigation = (event) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", preventFileNavigation);
    window.addEventListener("drop", preventFileNavigation);
    return () => {
      window.removeEventListener("dragover", preventFileNavigation);
      window.removeEventListener("drop", preventFileNavigation);
    };
  }, []);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        ข้ามไปเนื้อหาหลัก
      </a>
      <Navbar />
      <main
        id="main-content"
        className="main-container"
        ref={mainRef}
        tabIndex={-1}
      >
        <Routes>
          <Route path="/" element={<RecognitionPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
