(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  const navLinks = [...document.querySelectorAll("#primary-nav a[href^='#']")];
  const backToTop = document.querySelector(".back-to-top");
  const year = document.querySelector("#current-year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroCanvas = document.querySelector(".hero-field");

  // Theme preference: saved choice takes priority over the system setting.
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("egi-theme"); } catch {}
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    themeToggle?.setAttribute("aria-pressed", String(dark));
    themeToggle?.setAttribute("aria-label", dark ? "Aktifkan light mode" : "Aktifkan dark mode");
    if (themeToggle?.firstElementChild) themeToggle.firstElementChild.textContent = dark ? "☼" : "◐";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#171916" : "#f7f7f4");
    try { localStorage.setItem("egi-theme", theme); } catch {}
  }

  setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme);
  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  // Accessible mobile navigation.
  function closeMenu(returnFocus = false) {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Buka navigasi");
    document.body.classList.remove("menu-open");
    if (returnFocus) menuToggle?.focus();
  }

  menuToggle?.addEventListener("click", () => {
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    menuToggle.setAttribute("aria-label", opening ? "Tutup navigasi" : "Buka navigasi");
    nav?.classList.toggle("is-open", opening);
    document.body.classList.toggle("menu-open", opening);
    if (opening) nav?.querySelector("a")?.focus();
  });

  navLinks.forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });
  document.addEventListener("click", event => {
    if (menuToggle?.getAttribute("aria-expanded") === "true" &&
        !nav?.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  // Subtle animated particle wave in the opening hero.
  if (heroCanvas && !reduceMotion) {
    const ctx = heroCanvas.getContext("2d");
    let width = 0, height = 0, frame = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const resizeHero = () => {
      const rect = heroCanvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      heroCanvas.width = Math.round(width * dpr);
      heroCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const drawHero = () => {
      ctx.clearRect(0, 0, width, height);
      const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#a34f36";
      const muted = getComputedStyle(root).getPropertyValue("--muted").trim() || "#777a73";
      const cols = Math.max(26, Math.floor(width / 22));
      const rows = Math.max(10, Math.floor(height / 27));
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = (col / (cols - 1)) * width;
          const depth = row / (rows - 1);
          const perspective = Math.pow(depth, 1.55);
          const wave = Math.sin(col * .22 + frame * .012 + row * .09) * (8 + depth * 18)
            + Math.cos(col * .075 - frame * .009) * 7;
          const y = height * (.26 + perspective * .66) + wave;
          const radius = .55 + perspective * 1.25;
          const alpha = .12 + perspective * .32;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = row % 7 === 0 ? accent : muted;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      frame++;
      raf = requestAnimationFrame(drawHero);
    };
    resizeHero();
    drawHero();
    window.addEventListener("resize", resizeHero, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!raf) drawHero();
    });
  }

  // Footer year.
  if (year) year.textContent = String(new Date().getFullYear());

  // Highlight the section currently in view.
  const sections = [...document.querySelectorAll("main section[id]")];
  function setActiveSection(id) {
    navLinks.forEach(link => {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Back-to-top control appears only after the visitor scrolls.
  const updateScrollControls = () => {
    backToTop?.classList.toggle("is-visible", window.scrollY > 420);
  };
  window.addEventListener("scroll", updateScrollControls, { passive: true });
  updateScrollControls();

  // Avoid animated scrolling for visitors who request reduced motion.
  backToTop?.addEventListener("click", event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });
})();