(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  const sections = document.querySelectorAll("[data-section-id]");
  const scrollProgress = document.getElementById("scroll-progress");
  const toTop = document.getElementById("to-top");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const statValues = document.querySelectorAll(".stat-value[data-target]");

  function setHeaderScrolled() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    scrollProgress.style.width = `${Math.min(100, pct)}%`;
  }

  function updateActiveNav() {
    const fromTop = window.scrollY + (header ? header.offsetHeight : 0) + 40;
    let current = "";

    sections.forEach(function (section) {
      const top = section.offsetTop;
      if (fromTop >= top) {
        current = section.getAttribute("data-section-id") || "";
      }
    });

    navLinks.forEach(function (link) {
      const id = link.getAttribute("data-section");
      link.classList.toggle("is-active", id === current);
    });
  }

  function toggleMobileNav(open) {
    if (!header || !navToggle) return;
    const isOpen = typeof open === "boolean" ? open : !header.classList.contains("nav-open");
    header.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      toggleMobileNav();
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          toggleMobileNav(false);
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        toggleMobileNav(false);
      }
    });
  }

  function onScroll() {
    setHeaderScrolled();
    updateScrollProgress();
    updateActiveNav();

    if (toTop) {
      toTop.classList.toggle("is-visible", window.scrollY > 400);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Tabs: Progress subsections */
  function activateTab(name) {
    tabButtons.forEach(function (btn) {
      const active = btn.getAttribute("data-tab") === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    tabPanels.forEach(function (panel) {
      const match = panel.getAttribute("data-panel") === name;
      panel.classList.toggle("is-visible", match);
      if (match) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const name = btn.getAttribute("data-tab");
      if (name) activateTab(name);
    });
  });

  /* Intersection: panel lift on view */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.15 }
    );

    document.querySelectorAll(".panel").forEach(function (panel) {
      io.observe(panel);
    });
  }

  /* Count-up for stat cards when visible */
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-target"), 10);
    if (Number.isNaN(target)) return;

    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * target);
      el.textContent = String(value);
      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && statValues.length) {
    let statsDone = false;
    const statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsDone) {
            statsDone = true;
            statValues.forEach(animateCount);
            statsIo.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    const resultPanel = document.getElementById("result");
    if (resultPanel) statsIo.observe(resultPanel);
  }
})();
