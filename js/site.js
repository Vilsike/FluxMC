// js/site.js
(function () {
  const ip = "play.crownfall.gg";

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 1400);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  async function handleCopy() {
    try {
      await copy(ip);
      showToast("Copied: " + ip);
    } catch (e) {
      showToast("Copy failed");
    }
  }

  // Copy buttons
  const btn1 = document.getElementById("copyIpBtn");
  const btn2 = document.getElementById("copyIpBtn2");
  if (btn1) btn1.addEventListener("click", handleCopy);
  if (btn2) btn2.addEventListener("click", handleCopy);

  // Active nav logic
  const navLinks = Array.from(document.querySelectorAll(".topbar-nav a.topbar-link"));
  if (!navLinks.length) return;

  const path = (location.pathname || "/").replace(/\/+$/, "/"); // normalize trailing slash
  const isHome = path === "/";

  function clearActive() {
    navLinks.forEach(a => a.classList.remove("is-active"));
  }

  function setActiveByHref(targetHref) {
    clearActive();
    const found = navLinks.find(a => (a.getAttribute("href") || "") === targetHref);
    if (found) found.classList.add("is-active");
  }

  // Sub-pages: highlight based on current folder
  if (!isHome) {
    // Match "/core/" etc against hrefs like "../core/" or "/core/" or "core/"
    const folder = path.split("/").filter(Boolean)[0]; // "core"
    if (folder) {
      const candidates = [
        "../" + folder + "/",
        "/" + folder + "/",
        folder + "/"
      ];
      const match = navLinks.find(a => candidates.includes((a.getAttribute("href") || "")));
      if (match) {
        clearActive();
        match.classList.add("is-active");
      }
    }
    return;
  }

  // Home page: observe sections for active highlight (only for # links)
  const anchorLinks = navLinks.filter(a => (a.getAttribute("href") || "").startsWith("#"));
  const sections = anchorLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    anchorLinks.forEach(a => a.classList.remove("is-active"));
    const active = anchorLinks.find(a => a.getAttribute("href") === "#" + visible.target.id);
    if (active) active.classList.add("is-active");
  }, {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: [0.15, 0.25, 0.35]
  });

  sections.forEach(s => obs.observe(s));
})();
