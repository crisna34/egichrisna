(() => {
  const root=document.documentElement;
  const themeToggle=document.querySelector(".theme-toggle");
  const themeLabel=document.querySelector(".theme-toggle__label");
  const menuToggle=document.querySelector(".menu-toggle");
  const nav=document.querySelector(".primary-nav");
  const navLinks=[...document.querySelectorAll(".primary-nav a")];
  const backToTop=document.querySelector(".back-to-top");
  const year=document.querySelector("#current-year");
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let savedTheme=null;
  try{savedTheme=localStorage.getItem("egi-theme")}catch{}
  const preferred=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  function applyTheme(theme){
    root.dataset.theme=theme;
    const dark=theme==="dark";
    themeToggle?.setAttribute("aria-pressed",String(dark));
    themeToggle?.setAttribute("aria-label",dark?"Aktifkan light mode":"Aktifkan dark mode");
    if(themeLabel)themeLabel.textContent=dark?"Light":"Dark";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#0b1422":"#f5f7fb");
    try{localStorage.setItem("egi-theme",theme)}catch{}
  }
  applyTheme(savedTheme==="dark"||savedTheme==="light"?savedTheme:preferred);
  themeToggle?.addEventListener("click",()=>applyTheme(root.dataset.theme==="dark"?"light":"dark"));

  function closeMenu(){
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded","false");
    menuToggle?.setAttribute("aria-label","Buka navigasi");
    document.body.classList.remove("menu-open");
  }
  menuToggle?.addEventListener("click",()=>{
    const open=menuToggle.getAttribute("aria-expanded")!=="true";
    menuToggle.setAttribute("aria-expanded",String(open));
    menuToggle.setAttribute("aria-label",open?"Tutup navigasi":"Buka navigasi");
    nav?.classList.toggle("is-open",open);
    document.body.classList.toggle("menu-open",open);
  });
  navLinks.forEach(link=>link.addEventListener("click",closeMenu));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu()});
  window.addEventListener("resize",()=>{if(window.innerWidth>760)closeMenu()});

  if(year)year.textContent=new Date().getFullYear();
  const revealItems=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window&&!reducedMotion){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)}});
    },{threshold:.12});
    revealItems.forEach(item=>revealObserver.observe(item));
  }else revealItems.forEach(item=>item.classList.add("is-visible"));

  const sections=[...document.querySelectorAll("main section[id]")];
  if("IntersectionObserver" in window){
    const sectionObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          navLinks.forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+entry.target.id));
        }
      });
    },{rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(section=>sectionObserver.observe(section));
  }
  const updateScrollUI=()=>{
    backToTop?.classList.toggle("is-visible",window.scrollY>500);
  };
  window.addEventListener("scroll",updateScrollUI,{passive:true});
  updateScrollUI();
})();