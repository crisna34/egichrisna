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

  // Interactive perspective particle field + cursor parallax.
  const openingHero = document.querySelector(".opening-hero");
  if (heroCanvas && openingHero) {
    const ctx = heroCanvas.getContext("2d");
    let width = 0, height = 0, frame = 0, raf = 0;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pointerEnabled = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const resizeHero = () => {
      const rect = heroCanvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      heroCanvas.width = Math.round(width * dpr);
      heroCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onPointerMove = event => {
      const rect = openingHero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      openingHero.style.setProperty("--pointer-x", event.clientX - rect.left + "px");
      openingHero.style.setProperty("--pointer-y", event.clientY - rect.top + "px");
      openingHero.classList.add("is-pointer-active");
    };
    const onPointerLeave = () => {
      targetX = 0; targetY = 0;
      openingHero.style.setProperty("--pointer-x", "50%");
      openingHero.style.setProperty("--pointer-y", "50%");
      openingHero.classList.remove("is-pointer-active");
    };
    if (pointerEnabled) {
      openingHero.addEventListener("pointermove", onPointerMove, { passive: true });
      openingHero.addEventListener("pointerleave", onPointerLeave);
    }
    const drawHero = () => {
      ctx.clearRect(0, 0, width, height);
      pointerX += (targetX - pointerX) * .055;
      pointerY += (targetY - pointerY) * .055;
      const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#a34f36";
      const muted = getComputedStyle(root).getPropertyValue("--muted").trim() || "#777a73";
      const cols = Math.max(30, Math.floor(width / 19));
      const rows = Math.max(14, Math.floor(height / 22));
      const horizon = height * .27;
      for (let row = 0; row < rows; row++) {
        const depth = row / (rows - 1);
        const perspective = Math.pow(depth, 1.7);
        for (let col = 0; col < cols; col++) {
          const baseX = (col / (cols - 1) - .5) * width;
          const wave = Math.sin(col * .2 + frame * .009 + row * .12) * (3 + depth * 13)
            + Math.cos(col * .065 - frame * .006) * 5;
          // Mouse movement changes the virtual camera angle, not just the dot positions.
          const cameraX = pointerX * (24 + perspective * 105);
          const cameraY = pointerY * (12 + perspective * 55);
          const perspectivePull = pointerX * perspective * (baseX * -.12);
          const x = width / 2 + baseX + cameraX + perspectivePull;
          const y = horizon + perspective * height * .68 + wave + cameraY
            + pointerY * (baseX / width) * perspective * 28;
          const radius = .45 + perspective * 1.45;
          const alpha = .1 + perspective * .34;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = (row + col) % 13 === 0 ? accent : muted;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // The title and framing shift at a different depth from the particle plane.
      openingHero.style.setProperty("--hero-shift-x", (pointerX * -15).toFixed(2) + "px");
      openingHero.style.setProperty("--hero-shift-y", (pointerY * -11).toFixed(2) + "px");
      frame++;
      if (!document.hidden) raf = requestAnimationFrame(drawHero);
    };
    resizeHero();
    if (reduceMotion) {
      // A static field remains visible when the visitor requests reduced motion.
      drawHero();
      cancelAnimationFrame(raf);
    } else {
      drawHero();
    }
    window.addEventListener("resize", resizeHero, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!reduceMotion && !raf) drawHero();
    });
  }

  // Reveal editorial sections gently as they enter the viewport.
  const revealTargets = document.querySelectorAll(".about, .more, .contact, .profile-card, .intro-copy");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealTargets.forEach(target => {
      target.classList.add("reveal-on-scroll");
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach(target => target.classList.add("is-revealed"));
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