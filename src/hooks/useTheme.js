import { useEffect, useState } from "react";

const storageKey = "circuitai-theme";

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0b1220" : "#f8fafc");
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* The switch still works when storage is blocked. */
    }
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key === storageKey || event.key === null)
        setTheme(event.newValue === "dark" ? "dark" : "light");
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}
