const root = document.documentElement;
const menuButton = document.querySelector("[data-menu]");
const nav = document.querySelector("#nav");
const header = document.querySelector("[data-header]");
const themeButton = document.querySelector("[data-theme-toggle]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateThemeControl() {
  if (!themeButton) return;
  const isDark = root.dataset.theme !== "light";
  themeButton.querySelector("span").textContent = isDark ? "☼" : "☾";
  themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#070707" : "#f3f0e9");
}

themeButton?.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (error) { /* storage may be unavailable */ }
  updateThemeControl();
});
updateThemeControl();

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

const slides = [...document.querySelectorAll("[data-slide]")];
const current = document.querySelector("[data-current]");
let active = 0;
function showSlide(index) {
  if (!slides.length) return;
  active = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === active));
  if (current) current.textContent = String(active + 1).padStart(2, "0");
}
document.querySelector("[data-next]")?.addEventListener("click", () => showSlide(active + 1));
document.querySelector("[data-prev]")?.addEventListener("click", () => showSlide(active - 1));

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  }), { threshold: 0.1, rootMargin: "0px 0px -7% 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
}

function animateCounter(element) {
  const target = Number(element.dataset.counter || 0);
  const suffix = element.dataset.suffix || "";
  if (reducedMotion.matches) { element.textContent = `${target}${suffix}`; return; }
  const start = performance.now();
  const duration = 1200;
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const counterGroup = document.querySelector("[data-counters]");
if (counterGroup) {
  const counters = counterGroup.querySelectorAll("[data-counter]");
  if (!("IntersectionObserver" in window)) counters.forEach(animateCounter);
  else {
    const counterObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      counters.forEach(animateCounter);
      counterObserver.disconnect();
    }, { threshold: 0.4 });
    counterObserver.observe(counterGroup);
  }
}

const hero = document.querySelector(".hero-full");
let lastScroll = window.scrollY;
let ticking = false;
function updateOnScroll() {
  const scrollY = window.scrollY;
  if (hero && !reducedMotion.matches) {
    const progress = Math.min(Math.max(scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
    hero.style.setProperty("--copy-y", `${-24 * progress}px`);
    hero.style.setProperty("--copy-opacity", String(1 - .32 * progress));
    hero.style.setProperty("--portrait-y", `${34 * progress}px`);
    hero.style.setProperty("--portrait-scale", String(1 + .016 * progress));
    hero.style.setProperty("--orb-one-x", `${-30 * progress}px`);
    hero.style.setProperty("--orb-one-y", `${-48 * progress}px`);
    hero.style.setProperty("--orb-two-x", `${20 * progress}px`);
    hero.style.setProperty("--orb-two-y", `${30 * progress}px`);
  }
  header?.classList.toggle("scrolled", scrollY > 20);
  const menuOpen = nav?.classList.contains("open");
  if (scrollY <= 20 || menuOpen || scrollY < lastScroll) header?.classList.remove("nav-hidden");
  else if (scrollY > lastScroll + 3) header?.classList.add("nav-hidden");
  lastScroll = Math.max(scrollY, 0);
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateOnScroll);
}, { passive: true });
window.addEventListener("resize", updateOnScroll);
updateOnScroll();
