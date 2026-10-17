import { NavLink, Link } from "react-router-dom";
import {
  ScanLine,
  BookOpen,
  Gauge,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

const links = [
  { to: "/", text: "AI Recognition", Icon: ScanLine },
  { to: "/components", text: "Components", Icon: BookOpen },
  { to: "/equipment", text: "Equipment Guide", Icon: Gauge },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <header className="site-header">
      <div className="nav-container">
        <Link to="/" className="brand" aria-label="CircuitLib หน้าหลัก">
          <img className="brand-mark" src="/circuitlib-logo.svg" alt="" width="40" height="40" />
          <span className="brand-name">
            CIRCUIT<span className="brand-accent">LIB</span>
          </span>
        </Link>
        <nav aria-label="เมนูหลัก" className="main-nav">
          {links.map(({ to, text, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={17} aria-hidden="true" />
              <span>{text}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="สลับโหมดมืด"
          aria-pressed={dark}
          title={dark ? "เปิดโหมดสว่าง" : "เปิดโหมดมืด"}
        >
          {dark ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {dark ? "โหมดสว่าง" : "โหมดมืด"}
          </span>
        </button>
      </div>
    </header>
  );
}
