(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const year = document.querySelector("#current-year");
  let saved = null;
  try { saved = localStorage.getItem("egi-theme"); } catch {}
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    toggle?.setAttribute("aria-pressed", String(dark));
    toggle?.setAttribute("aria-label", dark ? "Aktifkan light mode" : "Aktifkan dark mode");
    if (toggle) toggle.firstElementChild.textContent = dark ? "☼" : "◐";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#171916" : "#f7f7f4");
    try { localStorage.setItem("egi-theme", theme); } catch {}
  }

  setTheme(saved === "dark" || saved === "light" ? saved : preferred);
  toggle?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  if (year) year.textContent = new Date().getFullYear();
})();