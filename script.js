(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const label = document.querySelector(".theme-toggle__label");
  const year = document.querySelector("#current-year");
  let saved = null;
  try { saved = localStorage.getItem("egi-theme"); } catch {}
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    toggle?.setAttribute("aria-pressed", String(dark));
    toggle?.setAttribute("aria-label", dark ? "Aktifkan light mode" : "Aktifkan dark mode");
    if (label) label.textContent = dark ? "Light mode" : "Dark mode";
    try { localStorage.setItem("egi-theme", theme); } catch {}
  }
  setTheme(saved || (prefersDark ? "dark" : "light"));
  toggle?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  if (year) year.textContent = new Date().getFullYear();
})();