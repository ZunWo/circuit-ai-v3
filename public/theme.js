// Apply the saved theme before React/CSS paint, including the static credits page.
(() => {
  const key = "circuitai-theme";
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0b1220" : "#f8fafc");
  }
  let theme = "light";
  try {
    if (localStorage.getItem(key) === "dark") theme = "dark";
  } catch {
    /* Storage may be unavailable in private browsers. */
  }
  apply(theme);
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null)
      apply(event.newValue === "dark" ? "dark" : "light");
  });
})();
